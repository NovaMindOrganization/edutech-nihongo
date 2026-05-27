"""OCR orchestration: PaddleOCR (GPU) → optional Google Vision fallback."""

from __future__ import annotations

import logging
import os
import time

from app.ocr.paddle_engine import probe_paddle, run_paddle_ocr
from app.ocr.types import OcrMeta

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def _google_vision_extract(image_b64: str) -> str | None:
    api_key = os.getenv('GOOGLE_VISION_API_KEY')
    if not api_key:
        return None
    try:
        import base64

        import httpx

        payload = {
            'requests': [{
                'image': {'content': image_b64.split(',')[-1]},
                'features': [{'type': 'TEXT_DETECTION'}],
                'imageContext': {'languageHints': ['ja']},
            }],
        }
        with httpx.Client(timeout=30) as client:
            res = client.post(
                f'https://vision.googleapis.com/v1/images:annotate?key={api_key}',
                json=payload,
            )
            res.raise_for_status()
            annotations = res.json()['responses'][0].get('textAnnotations', [])
            if annotations:
                return annotations[0].get('description', '').strip()
    except Exception as exc:
        logger.warning('Google Vision OCR failed: %s', exc)
    return None


def extract_japanese_text(image_b64: str) -> tuple[str, OcrMeta | None]:
    if not image_b64:
        return '', None

    engine = os.getenv('OCR_ENGINE', 'paddleocr').strip().lower()
    use_gpu = _env_bool('OCR_USE_GPU', True)
    min_conf = float(os.getenv('OCR_MIN_CONFIDENCE', '0.5'))

    if engine == 'google':
        started = time.perf_counter()
        text = _google_vision_extract(image_b64) or ''
        return text, OcrMeta(
            engine='google_vision',
            gpu=False,
            lang='ja',
            confidence_avg=None,
            line_count=text.count('\n') + (1 if text else 0),
            processing_ms=int((time.perf_counter() - started) * 1000),
        )

    try:
        return run_paddle_ocr(image_b64, use_gpu=use_gpu, min_conf=min_conf)
    except ImportError:
        logger.warning('PaddleOCR not installed — trying Google Vision or stub')
    except Exception as exc:
        logger.exception('PaddleOCR failed: %s', exc)

    text = _google_vision_extract(image_b64)
    if text:
        return text, OcrMeta(
            engine='google_vision_fallback',
            gpu=False,
            lang='ja',
            confidence_avg=None,
            line_count=text.count('\n') + 1,
            processing_ms=0,
        )

    return '', OcrMeta(
        engine='unavailable',
        gpu=False,
        lang='ja',
        confidence_avg=None,
        line_count=0,
        processing_ms=0,
    )


def get_ocr_status() -> dict:
    return {
        'default_engine': os.getenv('OCR_ENGINE', 'paddleocr'),
        'use_gpu': _env_bool('OCR_USE_GPU', True),
        'paddle': probe_paddle(),
    }
