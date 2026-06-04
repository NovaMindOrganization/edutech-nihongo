"""OCR: Paddle + vision LLM (admin config) → LLM refine for clean layout."""

from __future__ import annotations

import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor

from app.core.llm_runtime import get_llm_config, run_in_request_context
from app.ocr.gemini_ocr import format_essay_layout, transcribe_tategaki
from app.ocr.layout import is_vertical_tategaki
from app.ocr.paddle_engine import ENGINE_ID, _decode_image, probe_paddle, run_paddle_ocr
from app.ocr.preprocess import preprocess_for_paddle_rgb, preprocess_from_rgb
from app.ocr.refine import pick_best_without_refine, refine_ocr_output
from app.ocr.types import OcrMeta

logger = logging.getLogger(__name__)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def _use_vision_leg() -> bool:
    hw = os.getenv('OCR_HANDWRITING_ENGINE', 'auto').strip().lower()
    if hw == 'paddle':
        return False
    return _env_bool('OCR_USE_VISION', True)


def _use_refine() -> bool:
    hw = os.getenv('OCR_HANDWRITING_ENGINE', 'auto').strip().lower()
    if hw == 'gemini':
        return False
    return _env_bool('OCR_REFINE', True)


def _llm_available() -> bool:
    cfg = get_llm_config()
    if cfg.provider == 'agent_router':
        return bool(cfg.openai_api_key)
    return bool(cfg.gemini_api_key)


def _google_vision_extract(image_b64: str) -> str | None:
    api_key = os.getenv('GOOGLE_VISION_API_KEY')
    if not api_key:
        return None
    try:
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


def _run_paddle(
    image_b64: str,
    rgb,
    *,
    use_gpu: bool,
    min_conf: float,
    preprocess: bool,
) -> tuple[str, OcrMeta | None]:
    paddle_rgb = preprocess_for_paddle_rgb(rgb) if preprocess else rgb
    return run_paddle_ocr(
        image_b64,
        use_gpu=use_gpu,
        min_conf=min_conf,
        rgb=paddle_rgb,
    )


def _run_vision(color_rgb) -> tuple[str, str | None]:
    raw, engine = transcribe_tategaki(color_rgb)
    if not raw:
        return '', engine
    return format_essay_layout(raw).strip(), engine


def _compose_engine_label(
    *,
    paddle_used: bool,
    vision_engine: str | None,
    refine_engine: str | None,
) -> str:
    parts: list[str] = []
    if paddle_used:
        parts.append(ENGINE_ID)
    if vision_engine:
        parts.append(f'vision:{vision_engine}')
    if refine_engine:
        parts.append(f'refine:{refine_engine}')
    elif refine_engine is None and len(parts) > 1:
        parts.append('refine:skipped')
    return '+'.join(parts) if parts else 'unavailable'


def extract_japanese_text(image_b64: str) -> tuple[str, OcrMeta | None]:
    if not image_b64:
        return '', None

    engine_mode = os.getenv('OCR_ENGINE', 'paddleocr').strip().lower()
    use_gpu = _env_bool('OCR_USE_GPU', True)
    min_conf = float(os.getenv('OCR_MIN_CONFIDENCE', '0.5'))
    preprocess = _env_bool('OCR_PREPROCESS', True)
    use_vision = _use_vision_leg() and _llm_available()
    use_refine = _use_refine() and _llm_available()
    started = time.perf_counter()

    if engine_mode == 'google':
        text = _google_vision_extract(image_b64) or ''
        return text, OcrMeta(
            engine='google_vision',
            gpu=False,
            lang='ja',
            confidence_avg=None,
            line_count=text.count('\n') + (1 if text else 0),
            processing_ms=int((time.perf_counter() - started) * 1000),
        )

    rgb = _decode_image(image_b64)
    color_rgb, ink = preprocess_from_rgb(rgb) if preprocess else (rgb, None)
    vertical = ink is not None and is_vertical_tategaki(ink)

    # Legacy: vision-only OCR (no Paddle / refine)
    if engine_mode == 'gemini' or (
        os.getenv('OCR_HANDWRITING_ENGINE', 'auto').strip().lower() == 'gemini'
    ):
        vision_text, vision_engine = _run_vision(color_rgb)
        elapsed = int((time.perf_counter() - started) * 1000)
        engine = vision_engine or 'llm_vision'
        return vision_text, OcrMeta(
            engine=engine,
            gpu=False,
            lang='ja',
            confidence_avg=None,
            line_count=vision_text.count('\n') + (1 if vision_text else 0),
            processing_ms=elapsed,
        )

    paddle_text = ''
    paddle_meta: OcrMeta | None = None
    vision_text = ''
    vision_engine: str | None = None
    paddle_ok = False

    def _paddle_job():
        return _run_paddle(
            image_b64,
            rgb,
            use_gpu=use_gpu,
            min_conf=min_conf,
            preprocess=preprocess,
        )

    def _vision_job():
        return _run_vision(color_rgb)

    try:
        if use_vision:
            cfg = get_llm_config()
            vision_model = (
                cfg.ocr_agent_router_vision_model
                if cfg.provider == 'agent_router'
                else (cfg.ocr_gemini_fallback_model or cfg.gemini_model)
            )
            logger.info(
                'OCR parallel: paddle + vision (provider=%s, ocr_vision_model=%s)',
                cfg.provider,
                vision_model,
            )
            with ThreadPoolExecutor(max_workers=2) as pool:
                # ContextVar (admin llm_config) is not inherited by worker threads by default.
                paddle_future = pool.submit(run_in_request_context, _paddle_job)
                vision_future = pool.submit(run_in_request_context, _vision_job)
                paddle_text, paddle_meta = paddle_future.result()
                vision_text, vision_engine = vision_future.result()
                paddle_ok = True
        else:
            paddle_text, paddle_meta = _paddle_job()
            paddle_ok = True
    except ImportError:
        logger.warning('PP-OCRv5 not installed')
    except Exception as exc:
        logger.exception('Paddle OCR failed: %s', exc)

    if use_vision and not vision_text and _llm_available():
        vision_text, vision_engine = _run_vision(color_rgb)

    refine_engine: str | None = None
    final_text = ''

    if use_refine and (paddle_text.strip() or vision_text.strip()):
        refined, refine_engine = refine_ocr_output(
            paddle_text=paddle_text,
            vision_text=vision_text,
            vertical_tategaki=vertical,
        )
        if refined:
            final_text = refined
        else:
            final_text = pick_best_without_refine(paddle_text, vision_text)
    elif paddle_text.strip() or vision_text.strip():
        final_text = pick_best_without_refine(paddle_text, vision_text)
    elif paddle_ok:
        final_text = paddle_text

    if not final_text.strip():
        vision_text, vision_engine = _run_vision(color_rgb)
        if vision_text.strip():
            final_text = vision_text
        else:
            fallback = _google_vision_extract(image_b64)
            if fallback:
                elapsed = int((time.perf_counter() - started) * 1000)
                return fallback, OcrMeta(
                    engine='google_vision_fallback',
                    gpu=False,
                    lang='ja',
                    confidence_avg=None,
                    line_count=fallback.count('\n') + 1,
                    processing_ms=elapsed,
                )
        elapsed = int((time.perf_counter() - started) * 1000)
        return '', OcrMeta(
            engine='unavailable',
            gpu=False,
            lang='ja',
            confidence_avg=None,
            line_count=0,
            processing_ms=elapsed,
        )

    elapsed = int((time.perf_counter() - started) * 1000)
    engine_label = _compose_engine_label(
        paddle_used=paddle_ok,
        vision_engine=vision_engine if use_vision and vision_text.strip() else None,
        refine_engine=refine_engine if use_refine else None,
    )

    return final_text, OcrMeta(
        engine=engine_label,
        gpu=paddle_meta.gpu if paddle_meta else False,
        lang='ja',
        confidence_avg=paddle_meta.confidence_avg if paddle_meta else None,
        line_count=final_text.count('\n') + (1 if final_text else 0),
        processing_ms=elapsed,
    )


def get_ocr_status() -> dict:
    return {
        'default_engine': os.getenv('OCR_ENGINE', 'paddleocr'),
        'pipeline': 'paddle+vision+refine' if _use_refine() else 'paddle+vision',
        'use_vision': _use_vision_leg(),
        'use_refine': _use_refine(),
        'preprocess': _env_bool('OCR_PREPROCESS', True),
        'use_gpu': _env_bool('OCR_USE_GPU', True),
        'paddle': probe_paddle(),
        'llm_provider': get_llm_config().provider,
        'llm_configured': _llm_available(),
        'ocr_agent_router_vision_model': get_llm_config().ocr_agent_router_vision_model,
        'ocr_gemini_fallback_model': get_llm_config().ocr_gemini_fallback_model,
    }
