"""PaddleOCR — primary OSS engine for Japanese (printed + vertical)."""

from __future__ import annotations

import base64
import io
import logging
import threading
import time
from typing import Any

from app.ocr.types import OcrMeta

logger = logging.getLogger(__name__)

_ocr_lock = threading.Lock()
_ocr_instance: Any | None = None
_ocr_gpu: bool | None = None


def _decode_image(image_b64: str):
    import numpy as np
    from PIL import Image

    raw = image_b64.split(',')[-1] if ',' in image_b64 else image_b64
    data = base64.b64decode(raw)
    img = Image.open(io.BytesIO(data)).convert('RGB')
    return np.array(img)


def _paddle_gpu_available() -> bool:
    try:
        import paddle

        return bool(getattr(paddle.device, 'is_compiled_with_cuda', lambda: False)())
    except Exception:
        return False


def _get_paddle_ocr(use_gpu: bool):
    global _ocr_instance, _ocr_gpu
    with _ocr_lock:
        if _ocr_instance is not None and _ocr_gpu == use_gpu:
            return _ocr_instance
        from paddleocr import PaddleOCR

        _ocr_instance = PaddleOCR(
            use_angle_cls=True,
            lang='japan',
            use_gpu=use_gpu,
            show_log=False,
        )
        _ocr_gpu = use_gpu
        logger.info('PaddleOCR ready (gpu=%s)', use_gpu)
        return _ocr_instance


def _sort_lines_reading_order(lines: list[tuple[list, tuple[str, float]]]) -> list[str]:
    """Top-to-bottom, right-to-left friendly ordering for JP blocks."""
    if not lines:
        return []

    def center(box: list) -> tuple[float, float]:
        xs = [p[0] for p in box]
        ys = [p[1] for p in box]
        return (sum(xs) / len(xs), sum(ys) / len(ys))

    indexed = [(center(box), text, conf) for box, (text, conf) in lines if text.strip()]
    if not indexed:
        return []

    indexed.sort(key=lambda t: (round(t[0][1] / 24), -t[0][0]))
    return [t[1] for t in indexed]


def _parse_result(result: list | None, min_conf: float) -> tuple[str, float | None, int]:
    if not result or not result[0]:
        return '', None, 0

    lines: list[tuple[list, tuple[str, float]]] = []
    confs: list[float] = []
    for item in result[0]:
        if not item or len(item) < 2:
            continue
        box, rec = item[0], item[1]
        text, conf = rec[0], float(rec[1])
        if conf >= min_conf and text.strip():
            lines.append((box, (text.strip(), conf)))
            confs.append(conf)

    ordered = _sort_lines_reading_order(lines)
    avg_conf = sum(confs) / len(confs) if confs else None
    return '\n'.join(ordered), avg_conf, len(ordered)


def run_paddle_ocr(image_b64: str, *, use_gpu: bool, min_conf: float) -> tuple[str, OcrMeta]:
    started = time.perf_counter()
    gpu = use_gpu and _paddle_gpu_available()
    if use_gpu and not gpu:
        logger.warning('OCR_USE_GPU=true but CUDA not available — using CPU')

    ocr = _get_paddle_ocr(gpu)
    img = _decode_image(image_b64)
    raw = ocr.ocr(img, cls=True)
    text, avg_conf, line_count = _parse_result(raw, min_conf)
    elapsed = int((time.perf_counter() - started) * 1000)

    return text, OcrMeta(
        engine='paddleocr',
        gpu=gpu,
        lang='japan',
        confidence_avg=avg_conf,
        line_count=line_count,
        processing_ms=elapsed,
    )


def probe_paddle() -> dict:
    try:
        import paddleocr  # noqa: F401

        gpu_compiled = _paddle_gpu_available()
        return {
            'installed': True,
            'cuda_compiled': gpu_compiled,
        }
    except ImportError as exc:
        return {'installed': False, 'error': str(exc)}
