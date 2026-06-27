import asyncio
import base64
import io
import time

from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field, field_validator

from app.core.config import settings
from app.core.stt import transcribe_audio
from app.pronunciation.audio import prepare_audio, prepare_audio_bytes, resolve_upload_mime_type
from app.pronunciation.engines import get_engine
from app.pronunciation.errors import (
    AppError,
    AudioPayloadTooLargeError,
    InvalidAudioError,
    InvalidRequestError,
)

router = APIRouter(prefix='/speech', tags=['speech'])


class TtsRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    voice: str | None = None


class TtsResponse(BaseModel):
    audio_base64: str
    content_type: str = 'audio/mpeg'


class SttRequest(BaseModel):
    audio: str = Field(description='Base64-encoded audio (webm/wav/mp3)')
    language: str | None = None
    mime_type: str = 'audio/webm'
    allow_gemini_fallback: bool = True


class SttResponse(BaseModel):
    text: str
    confidence: float | None = None
    engine: str = 'none'
    interim_supported: bool = True


class SttConfigResponse(BaseModel):
    default_language: str
    whisper_model: str
    whisper_device: str
    gemini_fallback: bool
    vad_filter: bool
    beam_size: int
    sample_rate: int
    min_audio_bytes: int
    max_duration_sec: int
    live_stt_hint: str


class PronunciationAssessmentRequest(BaseModel):
    reference_text: str = Field(min_length=1)
    audio_base64: str = Field(min_length=1)
    language: str = 'ja'
    mime_type: str = 'audio/webm'
    pass_threshold: float = Field(default=70, ge=0, le=100)

    @field_validator('reference_text', 'audio_base64', 'language', 'mime_type')
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise ValueError('must not be empty')
        return trimmed


class PronunciationWordScore(BaseModel):
    word: str
    accuracy_score: float | None = None
    error_type: str | None = None


class PronunciationAssessmentResponse(BaseModel):
    overall_score: float
    passed: bool
    feedback_vi: str
    transcript: str | None = None
    engine: str
    duration_ms: int | None = None
    raw_scores: dict[str, float | None] = Field(default_factory=dict)
    words: list[PronunciationWordScore] = Field(default_factory=list)


async def _edge_tts_bytes(text: str, voice: str) -> bytes | None:
    try:
        import edge_tts

        communicate = edge_tts.Communicate(text, voice)
        buf = io.BytesIO()
        async for chunk in communicate.stream():
            if chunk['type'] == 'audio':
                buf.write(chunk['data'])
        if buf.tell() > 0:
            return buf.getvalue()
    except Exception:
        pass

    try:
        import tempfile
        from pathlib import Path

        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as tmp:
            out_path = Path(tmp.name)
        proc = await asyncio.create_subprocess_exec(
            'edge-tts',
            '--voice',
            voice,
            '--text',
            text,
            '--write-media',
            str(out_path),
            stdout=asyncio.subprocess.DEVNULL,
            stderr=asyncio.subprocess.DEVNULL,
        )
        await proc.wait()
        if out_path.exists() and out_path.stat().st_size > 0:
            data = out_path.read_bytes()
            out_path.unlink(missing_ok=True)
            return data
        out_path.unlink(missing_ok=True)
    except Exception:
        return None
    return None


@router.get('/stt/config', response_model=SttConfigResponse)
def stt_config() -> SttConfigResponse:
    device = settings.whisper_device
    if device == 'cuda':
        try:
            import ctranslate2

            if ctranslate2.get_cuda_device_count() < 1:
                device = 'cpu (cuda unavailable)'
        except Exception:
            device = 'cpu (ctranslate2 cuda missing)'
    return SttConfigResponse(
        default_language=settings.stt_default_language,
        whisper_model=settings.whisper_model,
        whisper_device=device,
        gemini_fallback=settings.stt_gemini_fallback,
        vad_filter=settings.stt_vad_filter,
        beam_size=settings.stt_beam_size,
        sample_rate=settings.stt_sample_rate,
        min_audio_bytes=settings.stt_min_audio_bytes,
        max_duration_sec=settings.stt_max_duration_sec,
        live_stt_hint='Browser SpeechRecognition provides live transcript; server refines on stop.',
    )


@router.post('/tts', response_model=TtsResponse)
async def text_to_speech(body: TtsRequest) -> TtsResponse:
    voice = body.voice or settings.edge_tts_voice
    audio = await _edge_tts_bytes(body.text, voice)
    if not audio:
        return TtsResponse(audio_base64='', content_type='audio/mpeg')
    return TtsResponse(audio_base64=base64.b64encode(audio).decode('ascii'))


@router.post('/stt', response_model=SttResponse)
def speech_to_text(body: SttRequest) -> SttResponse:
    try:
        raw = base64.b64decode(body.audio)
    except Exception:
        return SttResponse(text='', confidence=0, engine='none')

    lang = body.language or settings.stt_default_language
    text, confidence, engine = transcribe_audio(
        raw,
        language=lang,
        mime_type=body.mime_type,
        allow_gemini_fallback=body.allow_gemini_fallback,
    )
    return SttResponse(
        text=text,
        confidence=confidence,
        engine=engine,
        interim_supported=True,
    )


@router.post('/pronunciation/assess', response_model=PronunciationAssessmentResponse)
async def assess_pronunciation(
    body: PronunciationAssessmentRequest,
) -> PronunciationAssessmentResponse:
    started_at = time.perf_counter()
    try:
        with prepare_audio(body.audio_base64, body.mime_type, settings) as wav_path:
            return await _assess_pronunciation_wav(
                wav_path,
                body.reference_text,
                body.language,
                body.pass_threshold,
                started_at,
            )
    except AppError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail={'error': exc.error_code, 'message': exc.message},
        ) from exc


@router.post('/pronunciation/assess/upload', response_model=PronunciationAssessmentResponse)
async def assess_pronunciation_upload(
    reference_text: str = Form(...),
    audio_file: UploadFile = File(...),
    language: str = Form('ja'),
    pass_threshold: float = Form(70, ge=0, le=100),
) -> PronunciationAssessmentResponse:
    started_at = time.perf_counter()
    try:
        reference_text = _strip_required_form_value(reference_text, 'reference_text')
        language = _strip_required_form_value(language, 'language')
        audio_bytes = await _read_upload_audio_bytes(audio_file)
        mime_type = resolve_upload_mime_type(audio_file.filename, audio_file.content_type)

        with prepare_audio_bytes(audio_bytes, mime_type, settings) as wav_path:
            return await _assess_pronunciation_wav(
                wav_path,
                reference_text,
                language,
                pass_threshold,
                started_at,
            )
    except AppError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail={'error': exc.error_code, 'message': exc.message},
        ) from exc


async def _read_upload_audio_bytes(audio_file: UploadFile) -> bytes:
    audio_bytes = await audio_file.read(settings.max_audio_base64_bytes + 1)
    if len(audio_bytes) > settings.max_audio_base64_bytes:
        raise AudioPayloadTooLargeError(
            f'audio file exceeds limit of {settings.max_audio_base64_bytes} bytes',
        )
    if not audio_bytes:
        raise InvalidAudioError('audio file is empty')
    return audio_bytes


def _strip_required_form_value(value: str, field_name: str) -> str:
    stripped = value.strip()
    if not stripped:
        raise InvalidRequestError(f'{field_name} is required')
    return stripped


async def _assess_pronunciation_wav(
    wav_path: Path,
    reference_text: str,
    language: str,
    pass_threshold: float,
    started_at: float,
) -> PronunciationAssessmentResponse:
    engine = get_engine(settings)
    result = await asyncio.to_thread(
        engine.assess,
        wav_path,
        reference_text,
        language,
        pass_threshold,
    )

    duration_ms = int((time.perf_counter() - started_at) * 1000)
    overall_score = max(0.0, min(100.0, result.overall_score))

    return PronunciationAssessmentResponse(
        overall_score=overall_score,
        passed=overall_score >= pass_threshold,
        feedback_vi=result.feedback_vi,
        transcript=result.transcript,
        engine=engine.name,
        duration_ms=duration_ms,
        raw_scores=result.raw_scores,
        words=[
            PronunciationWordScore(
                word=word.word,
                accuracy_score=word.accuracy_score,
                error_type=word.error_type,
            )
            for word in result.words
        ],
    )
