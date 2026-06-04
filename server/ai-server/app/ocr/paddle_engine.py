"""PP-OCRv5 (PaddleOCR 3.x) — Japanese printed + vertical text."""

from __future__ import annotations

import base64
import io
import logging
import os
import threading
import time
from typing import Any

from app.ocr.types import OcrMeta

logger = logging.getLogger(__name__)

ENGINE_ID = 'pp-ocrv5'

_ocr_lock = threading.Lock()
_ocr_instance: Any | None = None
_ocr_device: str | None = None


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


def _resolve_device(use_gpu: bool) -> str:
    if use_gpu and _paddle_gpu_available():
        return 'gpu:0'
    return 'cpu'


def _model_tier() -> str:
    tier = os.getenv('OCR_PP_OCR_MODEL', 'server').strip().lower()
    return 'mobile' if tier == 'mobile' else 'server'


def _quiet_paddlex_logs() -> None:
    """PaddleX prints 'Creating model' / 'To redownload' even when using cache."""
    for name in ('paddlex', 'ppocr', 'paddle', 'paddleocr'):
        logging.getLogger(name).setLevel(logging.WARNING)


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def _get_paddle_ocr(device: str):
    global _ocr_instance, _ocr_device
    with _ocr_lock:
        if _ocr_instance is not None and _ocr_device == device:
            return _ocr_instance
        import warnings

        warnings.filterwarnings('ignore', message='.*ccache.*', category=UserWarning)
        _quiet_paddlex_logs()

        from paddleocr import PaddleOCR

        tier = _model_tier()
        det = f'PP-OCRv5_{tier}_det'
        rec = f'PP-OCRv5_{tier}_rec'

        # Explicit det/rec names — omit lang/ocr_version (Paddle ignores them anyway).
        _ocr_instance = PaddleOCR(
            text_detection_model_name=det,
            text_recognition_model_name=rec,
            use_doc_orientation_classify=False,
            use_doc_unwarping=False,
            use_textline_orientation=True,
            device=device,
        )
        _ocr_device = device
        logger.info('PP-OCRv5 ready (device=%s, det=%s, rec=%s)', device, det, rec)
        return _ocr_instance


def _box_center(box: Any) -> tuple[float, float]:
    if box is None:
        return (0.0, 0.0)
    pts = box.tolist() if hasattr(box, 'tolist') else box
    if not pts:
        return (0.0, 0.0)
    if len(pts) == 4 and all(isinstance(v, (int, float)) for v in pts):
        x1, y1, x2, y2 = pts
        return ((x1 + x2) / 2, (y1 + y2) / 2)
    xs = [p[0] for p in pts]
    ys = [p[1] for p in pts]
    return (sum(xs) / len(xs), sum(ys) / len(ys))


def _sort_lines_reading_order(lines: list[tuple[Any, tuple[str, float]]]) -> list[str]:
    """Top-to-bottom, right-to-left friendly ordering for JP blocks."""
    if not lines:
        return []

    indexed = [
        (_box_center(box), text, conf)
        for box, (text, conf) in lines
        if text.strip()
    ]
    if not indexed:
        return []

    indexed.sort(key=lambda t: (round(t[0][1] / 24), -t[0][0]))
    return [t[1] for t in indexed]


def _extract_result_payload(page: Any) -> dict:
    if hasattr(page, 'json'):
        payload = page.json
        if isinstance(payload, dict):
            inner = payload.get('res')
            return inner if isinstance(inner, dict) else payload
    if isinstance(page, dict):
        inner = page.get('res')
        return inner if isinstance(inner, dict) else page
    return {}


def _parse_result(pages: list[Any] | None, min_conf: float) -> tuple[str, float | None, int]:
    if not pages:
        return '', None, 0

    lines: list[tuple[Any, tuple[str, float]]] = []
    confs: list[float] = []
    for page in pages:
        res = _extract_result_payload(page)
        texts = res.get('rec_texts') or []
        scores = res.get('rec_scores')
        polys = res.get('rec_polys')
        boxes = res.get('rec_boxes')

        score_list: list[float] = []
        if scores is not None:
            score_list = [float(s) for s in (scores.tolist() if hasattr(scores, 'tolist') else scores)]

        for i, raw_text in enumerate(texts):
            text = str(raw_text).strip()
            if not text:
                continue
            conf = score_list[i] if i < len(score_list) else 1.0
            if conf < min_conf:
                continue
            geom = None
            if polys is not None and i < len(polys):
                geom = polys[i]
            elif boxes is not None and i < len(boxes):
                geom = boxes[i]
            lines.append((geom, (text, conf)))
            confs.append(conf)

    ordered = _sort_lines_reading_order(lines)
    avg_conf = sum(confs) / len(confs) if confs else None
    return '\n'.join(ordered), avg_conf, len(ordered)


def run_paddle_ocr(
    image_b64: str,
    *,
    use_gpu: bool,
    min_conf: float,
    rgb: Any | None = None,
) -> tuple[str, OcrMeta]:
    started = time.perf_counter()
    device = _resolve_device(use_gpu)
    gpu = device.startswith('gpu')
    if use_gpu and not gpu:
        logger.warning('OCR_USE_GPU=true but CUDA not available — using CPU')

    ocr = _get_paddle_ocr(device)
    img = rgb if rgb is not None else _decode_image(image_b64)
    raw = ocr.predict(img)
    text, avg_conf, line_count = _parse_result(list(raw) if raw is not None else None, min_conf)
    elapsed = int((time.perf_counter() - started) * 1000)

    return text, OcrMeta(
        engine=ENGINE_ID,
        gpu=gpu,
        lang='japan',
        confidence_avg=avg_conf,
        line_count=line_count,
        processing_ms=elapsed,
    )


def warmup_paddle_ocr() -> bool:
    """
    Load PP-OCRv5 into memory once per process.
    Weights are read from ~/.paddlex (not re-downloaded unless cache is deleted).
    """
    engine = os.getenv('OCR_ENGINE', 'paddleocr').strip().lower()
    if engine in ('google', 'gemini'):
        return False
    if not _env_bool('OCR_PRELOAD', True):
        return False
    try:
        device = _resolve_device(_env_bool('OCR_USE_GPU', True))
        started = time.perf_counter()
        _get_paddle_ocr(device)
        elapsed = int((time.perf_counter() - started) * 1000)
        logger.info('PP-OCRv5 preloaded at startup (%sms)', elapsed)
        return True
    except Exception as exc:
        logger.warning('PP-OCRv5 preload skipped: %s', exc)
        return False


def probe_paddle() -> dict:
    try:
        from importlib.metadata import PackageNotFoundError, version

        try:
            pkg_version = version('paddleocr')
        except PackageNotFoundError:
            return {'installed': False, 'error': 'paddleocr not installed'}

        gpu_compiled = _paddle_gpu_available()
        return {
            'installed': True,
            'version': pkg_version,
            'ocr_version': 'PP-OCRv5',
            'model_tier': _model_tier(),
            'cuda_compiled': gpu_compiled,
            'ready': _ocr_instance is not None,
        }
    except Exception as exc:
        return {'installed': False, 'error': str(exc)}
