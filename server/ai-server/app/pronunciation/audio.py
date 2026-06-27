import base64
import math
import mimetypes
import struct
import subprocess
import tempfile
import wave
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from app.core.config import Settings
from app.core.ffmpeg_util import resolve_ffmpeg_binary
from app.pronunciation.errors import (
    AudioPayloadTooLargeError,
    AudioProcessingUnavailableError,
    InvalidAudioError,
)


SUPPORTED_MIME_TYPES = {
    "audio/m4a": ".m4a",
    "audio/mp4": ".m4a",
    "audio/webm": ".webm",
    "audio/wav": ".wav",
    "audio/x-m4a": ".m4a",
    "audio/x-wav": ".wav",
    "video/m4a": ".m4a",
    "video/webm": ".webm",
}


def decode_base64_audio(audio_base64: str, settings: Settings) -> bytes:
    if audio_base64.startswith("data:"):
        if "," not in audio_base64:
            raise InvalidAudioError("audio_base64 data URI is missing payload")
        payload = audio_base64.split(",", 1)[1]
    else:
        payload = audio_base64
    payload_size = len(payload.encode("utf-8"))
    if payload_size > settings.max_audio_base64_bytes:
        raise AudioPayloadTooLargeError(
            f"audio_base64 exceeds limit of {settings.max_audio_base64_bytes} bytes"
        )

    try:
        audio_bytes = base64.b64decode(payload, validate=True)
    except Exception as exc:
        raise InvalidAudioError("audio_base64 is not valid base64") from exc

    if not audio_bytes:
        raise InvalidAudioError("audio_base64 is empty")

    return audio_bytes


@contextmanager
def prepare_audio(audio_base64: str, mime_type: str, settings: Settings) -> Iterator[Path]:
    audio_bytes = decode_base64_audio(audio_base64, settings)
    with prepare_audio_bytes(audio_bytes, mime_type, settings) as wav_path:
        yield wav_path


@contextmanager
def prepare_audio_bytes(audio_bytes: bytes, mime_type: str, settings: Settings) -> Iterator[Path]:
    if not audio_bytes:
        raise InvalidAudioError("audio file is empty")
    if len(audio_bytes) > settings.max_audio_base64_bytes:
        raise AudioPayloadTooLargeError(
            f"audio file exceeds limit of {settings.max_audio_base64_bytes} bytes"
        )

    suffix = SUPPORTED_MIME_TYPES.get(mime_type.lower())
    if suffix is None:
        allowed = ", ".join(sorted(SUPPORTED_MIME_TYPES))
        raise InvalidAudioError(f"unsupported mime_type; allowed values: {allowed}")

    ffmpeg = resolve_ffmpeg_binary()
    if ffmpeg is None:
        raise AudioProcessingUnavailableError("ffmpeg is required to normalize audio")

    with tempfile.TemporaryDirectory(prefix="pa-audio-") as temp_dir:
        temp_path = Path(temp_dir)
        source_path = temp_path / f"source{suffix}"
        normalized_path = temp_path / "normalized.wav"
        source_path.write_bytes(audio_bytes)

        normalize_audio(source_path, normalized_path, settings, ffmpeg)
        validate_wav(normalized_path, settings)
        yield normalized_path


def resolve_upload_mime_type(filename: str | None, content_type: str | None) -> str:
    if content_type and content_type.lower() in SUPPORTED_MIME_TYPES:
        return content_type.lower()

    guessed_type, _ = mimetypes.guess_type(filename or "")
    if guessed_type and guessed_type.lower() in SUPPORTED_MIME_TYPES:
        return guessed_type.lower()

    return (content_type or "").lower()


def normalize_audio(
    source_path: Path,
    normalized_path: Path,
    settings: Settings,
    ffmpeg_bin: str | None = None,
) -> None:
    ffmpeg = ffmpeg_bin or resolve_ffmpeg_binary()
    if not ffmpeg:
        raise AudioProcessingUnavailableError("ffmpeg is required to normalize audio")

    command = [
        ffmpeg,
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        str(source_path),
        "-ac",
        "1",
        "-ar",
        "16000",
        "-sample_fmt",
        "s16",
        str(normalized_path),
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            check=False,
            text=True,
            timeout=settings.ffmpeg_timeout_seconds,
        )
    except subprocess.TimeoutExpired as exc:
        raise InvalidAudioError("audio conversion timed out") from exc

    if result.returncode != 0 or not normalized_path.exists():
        detail = result.stderr.strip() or "ffmpeg could not decode the audio"
        raise InvalidAudioError(detail)


def validate_wav(wav_path: Path, settings: Settings) -> None:
    try:
        with wave.open(str(wav_path), "rb") as wav_file:
            channels = wav_file.getnchannels()
            sample_width = wav_file.getsampwidth()
            frame_rate = wav_file.getframerate()
            frame_count = wav_file.getnframes()
            frames = wav_file.readframes(frame_count)
    except wave.Error as exc:
        raise InvalidAudioError("normalized audio is not a valid WAV file") from exc

    if frame_rate <= 0:
        raise InvalidAudioError("audio has invalid frame rate")

    duration_seconds = frame_count / frame_rate
    if duration_seconds < settings.min_audio_seconds:
        raise InvalidAudioError(
            f"audio is too short; minimum is {settings.min_audio_seconds:g} seconds"
        )
    if duration_seconds > settings.max_audio_seconds:
        raise InvalidAudioError(
            f"audio is too long; maximum is {settings.max_audio_seconds:g} seconds"
        )

    if channels != 1 or sample_width != 2:
        raise InvalidAudioError("normalized audio must be mono PCM 16-bit")

    if _rms_16bit_pcm(frames) < settings.silence_rms_threshold:
        raise InvalidAudioError("audio is silent or too quiet")


def _rms_16bit_pcm(frames: bytes) -> float:
    sample_count = len(frames) // 2
    if sample_count == 0:
        return 0.0

    samples = struct.unpack(f"<{sample_count}h", frames[: sample_count * 2])
    mean_square = sum(sample * sample for sample in samples) / sample_count
    return math.sqrt(mean_square)
