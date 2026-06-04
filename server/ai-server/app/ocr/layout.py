"""Detect vertical tategaki layout and sort OCR boxes."""

from __future__ import annotations

from typing import Any

import cv2
import numpy as np


def _count_x_segments(proj: np.ndarray, *, threshold_ratio: float = 0.12) -> int:
    if proj.size == 0 or proj.max() <= 0:
        return 0
    threshold = proj.max() * threshold_ratio
    active = proj > threshold
    segments = 0
    in_seg = False
    for val in active:
        if val and not in_seg:
            segments += 1
            in_seg = True
        elif not val and in_seg:
            in_seg = False
    return segments


def is_vertical_tategaki(ink: np.ndarray, *, min_columns: int = 6) -> bool:
    """
    Heuristic for 縦書き on grid paper: many vertical ink bands, substantial height.
    Note: tategaki ink bbox is often wider than tall (many columns).
    """
    if ink is None or ink.size == 0:
        return False
    ys, xs = np.where(ink > 0)
    if len(xs) < 80:
        return False

    h = ys.max() - ys.min() + 1
    w = xs.max() - xs.min() + 1
    if h < 120 or w < 120:
        return False

    roi = ink[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    # Emphasize vertical strokes before column counting.
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(8, h // 40)))
    col_ink = cv2.erode(roi, kernel, iterations=1)
    proj = col_ink.sum(axis=0).astype(float)

    segments = _count_x_segments(proj)
    if segments >= min_columns:
        return True

    # Fallback: raw ink projection with lower bar when page is tall enough.
    raw_proj = roi.sum(axis=0).astype(float)
    raw_segments = _count_x_segments(raw_proj, threshold_ratio=0.18)
    return raw_segments >= min_columns and h >= w * 0.45


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


def sort_horizontal_lines(lines: list[tuple[Any, tuple[str, float]]]) -> list[str]:
    if not lines:
        return []
    indexed = [(_box_center(box), text, conf) for box, (text, conf) in lines if text.strip()]
    indexed.sort(key=lambda t: (round(t[0][1] / 24), t[0][0]))
    return [t[1] for t in indexed]


def sort_vertical_columns(lines: list[tuple[Any, tuple[str, float]]], *, column_width: float) -> list[str]:
    """Cluster boxes into RTL columns; top-to-bottom inside each column."""
    if not lines:
        return []
    width = max(column_width, 24.0)
    columns: dict[int, list[tuple[float, str]]] = {}
    for box, (text, _conf) in lines:
        if not text.strip():
            continue
        cx, cy = _box_center(box)
        col_idx = int(round(cx / width))
        columns.setdefault(col_idx, []).append((cy, text.strip()))

    ordered_cols: list[str] = []
    for col_idx in sorted(columns.keys(), reverse=True):
        cells = sorted(columns[col_idx], key=lambda t: t[0])
        ordered_cols.append(''.join(t for _, t in cells))
    return ordered_cols


def estimate_column_width(ink: np.ndarray) -> float:
    ys, xs = np.where(ink > 0)
    if len(xs) < 50:
        return 80.0
    roi = ink[ys.min() : ys.max() + 1, xs.min() : xs.max() + 1]
    h = roi.shape[0]
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, max(8, h // 40)))
    col_ink = cv2.erode(roi, kernel, iterations=1)
    proj = col_ink.sum(axis=0).astype(float)
    threshold = proj.max() * 0.12
    active = proj > threshold
    widths: list[int] = []
    start = None
    for i, val in enumerate(active):
        if val and start is None:
            start = i
        elif not val and start is not None:
            widths.append(i - start)
            start = None
    if start is not None:
        widths.append(len(active) - start)
    if not widths:
        return max(80.0, roi.shape[1] / 17)
    return max(40.0, float(np.median(widths)))
