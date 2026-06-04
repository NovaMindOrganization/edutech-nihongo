import base64
import logging
import subprocess
import tempfile
from pathlib import Path

import httpx

from app.core.config import settings
from app.core.llm import _gemini_generate

logger = logging.getLogger(__name__)

_whisper_model = None


def _webm_to_wav(audio_bytes: bytes) -> bytes | None:
    with tempfile.TemporaryDirectory() as tmp:
        webm_path = Path(tmp) / 'input.webm'
        wav_path = Path(tmp) / 'audio.wav'
        webm_path.write_bytes(audio_bytes)
        try:
            proc = subprocess.run(
                [
                    'ffmpeg',
                    '-y',
                    '-i',
                    str(webm_path),
                    '-ar',
                    str(settings.stt_sample_rate),
                    '-ac',
                    '1',
                    '-f',
                    'wav',
                    str(wav_path),
                ],
                capture_output=True,
                timeout=30,
            )
            if proc.returncode != 0 or not wav_path.exists():
                logger.warning('ffmpeg conversion failed: %s', proc.stderr[:200])
                return None
            return wav_path.read_bytes()
        except FileNotFoundError:
            logger.warning('ffmpeg not found — STT may fail for webm')
            return None
        except Exception as err:
            logger.warning('ffmpeg error: %s', err)
            return None


def _whisper_transcribe(audio_bytes: bytes, language: str) -> tuple[str, float | None]:
    global _whisper_model
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        logger.info('faster_whisper not installed — skip local STT')
        return '', None

    if _whisper_model is None:
        _whisper_model = WhisperModel(
            settings.whisper_model,
            device=settings.whisper_device,
            compute_type=settings.whisper_compute_type,
        )

    suffix = '.wav' if audio_bytes[:4] == b'RIFF' else '.webm'
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(audio_bytes)
        tmp.flush()
        segments, info = _whisper_model.transcribe(
            tmp.name,
            language=language,
            beam_size=settings.stt_beam_size,
            vad_filter=settings.stt_vad_filter,
            temperature=settings.stt_temperature,
        )
        text = ' '.join(s.text.strip() for s in segments).strip()
        conf = getattr(info, 'language_probability', None)
        return text, conf


def _gemini_transcribe(audio_bytes: bytes, language: str, mime_type: str) -> tuple[str, float | None]:
    if not settings.gemini_key or not settings.stt_gemini_fallback:
        return '', None

    b64 = base64.b64encode(audio_bytes).decode('ascii')
    lang_label = 'Japanese' if language.startswith('ja') else language
    prompt = (
        f'Transcribe this {lang_label} speech accurately. '
        'Return ONLY the spoken words, no translation or commentary.'
    )
    parts = [
        {'inline_data': {'mime_type': mime_type, 'data': b64}},
        {'text': prompt},
    ]
    text = _gemini_generate(parts)
    return (text.strip() if text else ''), 0.85 if text else None


def transcribe_audio(
    raw_bytes: bytes,
    *,
    language: str | None = None,
    mime_type: str = 'audio/webm',
    allow_gemini_fallback: bool | None = None,
) -> tuple[str, float | None, str]:
    """
    Returns (text, confidence, engine).
    engine: whisper | gemini | none
    """
    lang = language or settings.stt_default_language
    if len(raw_bytes) < settings.stt_min_audio_bytes:
        return '', None, 'none'

    wav_bytes = raw_bytes
    if mime_type in ('audio/webm', 'audio/ogg', 'video/webm') or raw_bytes[:4] != b'RIFF':
        converted = _webm_to_wav(raw_bytes)
        if converted:
            wav_bytes = converted
            mime_type = 'audio/wav'

    text, conf = _whisper_transcribe(wav_bytes, lang)
    if text:
        return text, conf, 'whisper'

    use_gemini = (
        settings.stt_gemini_fallback
        if allow_gemini_fallback is None
        else allow_gemini_fallback
    )
    if use_gemini:
        text, conf = _gemini_transcribe(wav_bytes, lang, mime_type)
        if text:
            return text, conf, 'gemini'

    return '', None, 'none'
