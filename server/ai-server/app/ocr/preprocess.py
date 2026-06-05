"""Notebook / homework photo preprocessing for Japanese OCR."""

from __future__ import annotations

import os

import cv2
import numpy as np


def _env_bool(name: str, default: bool) -> bool:
    raw = os.getenv(name)
    if raw is None:
        return default
    return raw.strip().lower() in ('1', 'true', 'yes', 'on')


def _target_min_width() -> int:
    raw = os.getenv('OCR_PREPROCESS_MIN_WIDTH', '2000')
    try:
        return max(800, int(raw))
    except ValueError:
        return 2000


def remove_blue_grid(bgr: np.ndarray) -> np.ndarray:
    """Mask light-blue/cyan grid lines; keep pen ink (blue/red/black)."""
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    grid = cv2.inRange(hsv, np.array([85, 20, 100]), np.array([150, 255, 255]))
    out = bgr.copy()
    out[grid > 0] = (255, 255, 255)
    return out


def _perspective_warp(bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 40, 120)
    edges = cv2.dilate(edges, np.ones((3, 3), np.uint8), iterations=1)
    cnts, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    if not cnts:
        return bgr
    contour = max(cnts, key=cv2.contourArea)
    peri = cv2.arcLength(contour, True)
    approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
    if len(approx) != 4:
        return bgr

    pts = approx.reshape(4, 2).astype(np.float32)
    sums = pts.sum(axis=1)
    diffs = np.diff(pts, axis=1).reshape(-1)
    tl = pts[np.argmin(sums)]
    br = pts[np.argmax(sums)]
    tr = pts[np.argmin(diffs)]
    bl = pts[np.argmax(diffs)]
    ordered = np.array([tl, tr, br, bl], dtype=np.float32)

    w = int(max(np.linalg.norm(tr - tl), np.linalg.norm(br - bl)))
    h = int(max(np.linalg.norm(bl - tl), np.linalg.norm(br - tr)))
    if w < 200 or h < 200:
        return bgr

    dst = np.array([[0, 0], [w - 1, 0], [w - 1, h - 1], [0, h - 1]], dtype=np.float32)
    matrix = cv2.getPerspectiveTransform(ordered, dst)
    return cv2.warpPerspective(bgr, matrix, (w, h), flags=cv2.INTER_CUBIC)


def _upscale(bgr: np.ndarray, min_width: int) -> np.ndarray:
    h, w = bgr.shape[:2]
    if w >= min_width:
        return bgr
    scale = min_width / w
    return cv2.resize(bgr, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)


def _extract_ink_mask(color_bgr: np.ndarray) -> np.ndarray:
    """Dark pen strokes only — ignore faint grid residue."""
    gray = cv2.cvtColor(color_bgr, cv2.COLOR_BGR2GRAY)
    ink = np.zeros_like(gray)
    ink[gray < 175] = 255
    ink = cv2.morphologyEx(ink, cv2.MORPH_OPEN, np.ones((2, 2), np.uint8), iterations=1)
    ink = cv2.morphologyEx(ink, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8), iterations=1)

    num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(ink, connectivity=8)
    cleaned = np.zeros_like(ink)
    min_area = max(12, int(color_bgr.shape[0] * color_bgr.shape[1] * 0.00002))
    for i in range(1, num_labels):
        if stats[i, cv2.CC_STAT_AREA] >= min_area:
            cleaned[labels == i] = 255
    return cleaned


def preprocess_notebook_bgr(bgr: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """
    Returns (color_for_vlm, binary_ink_for_layout).
    color: grid-softened BGR suitable for Gemini / Paddle.
    ink: inverted binary ink mask (255 = ink).
    """
    img = _upscale(bgr, _target_min_width())
    if _env_bool('OCR_PREPROCESS_WARP', True):
        img = _perspective_warp(img)
    color = remove_blue_grid(img)
    ink = _extract_ink_mask(color)

    pad = int(os.getenv('OCR_PREPROCESS_CROP_PAD', '24'))
    ys, xs = np.where(ink > 0)
    if len(xs) > 0:
        y1 = max(0, int(ys.min()) - pad)
        y2 = min(color.shape[0], int(ys.max()) + pad + 1)
        x1 = max(0, int(xs.min()) - pad)
        x2 = min(color.shape[1], int(xs.max()) + pad + 1)
        color = color[y1:y2, x1:x2]
        ink = ink[y1:y2, x1:x2]

    return color, ink


def preprocess_for_paddle_rgb(rgb: np.ndarray) -> np.ndarray:
    """High-contrast black-on-white RGB for PP-OCRv5."""
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    _, ink = preprocess_notebook_bgr(bgr)
    out = cv2.cvtColor(255 - ink, cv2.COLOR_GRAY2BGR)
    return cv2.cvtColor(out, cv2.COLOR_BGR2RGB)


def preprocess_from_rgb(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    color_bgr, ink = preprocess_notebook_bgr(bgr)
    color_rgb = cv2.cvtColor(color_bgr, cv2.COLOR_BGR2RGB)
    return color_rgb, ink
