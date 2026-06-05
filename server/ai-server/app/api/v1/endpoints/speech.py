import asyncio
import base64
import io

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.stt import transcribe_audio

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
