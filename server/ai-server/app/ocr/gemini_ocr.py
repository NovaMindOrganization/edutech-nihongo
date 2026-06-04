"""Vision LLM OCR for vertical handwritten Japanese (tategaki)."""

from __future__ import annotations

import base64
import logging
import re

import cv2
import numpy as np

from app.core.llm import vision_transcribe

logger = logging.getLogger(__name__)

_TATEGAKI_PROMPT = '''あなたは日本語OCRエンジンです。方眼原稿用紙の縦書き（縦書き）手書き作文を写し取ります。

手順:
1. 右端の列から左へ、各列を上から下へ1文字ずつ読む。
2. 列をつなげて横書きの自然な日本語文に並べ替える。
3. 助詞（の・は・を・が・に・で・と・も）や小さい仮名を省略しない。

出力形式（プレーンテキストのみ）:
- 1行目: タイトル（例: 故郷のクリスマス）
- 2行目: 空行
- 3行目以降: 本文（句読点「、」「。」を保持）
- 最後: 空行のあと署名（右下の名前のみ）

厳守:
- 言い換え・要約・創作・補完禁止。見える文字だけを転写。
- 推測で別の語に置き換えない（例: 「大切な」を「静かな」にしない）。
- Markdown・説明文・注釈禁止。
'''


def _rgb_to_jpeg_b64(rgb: np.ndarray, quality: int = 92) -> str:
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    ok, buf = cv2.imencode('.jpg', bgr, [int(cv2.IMWRITE_JPEG_QUALITY), quality])
    if not ok:
        raise RuntimeError('Failed to encode OCR image')
    return base64.b64encode(buf.tobytes()).decode('ascii')


def transcribe_tategaki(rgb: np.ndarray) -> tuple[str | None, str | None]:
    """Returns (text, engine_label from admin LLM config)."""
    if rgb is None or rgb.size == 0:
        return None, None
    try:
        b64 = _rgb_to_jpeg_b64(rgb)
        text, engine = vision_transcribe(_TATEGAKI_PROMPT, image_b64=b64, temperature=0)
        if not text:
            return None, engine
        return _clean_llm_text(text), engine
    except Exception as exc:
        logger.warning('Vision tategaki OCR failed: %s', exc)
        return None, None


def _clean_llm_text(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith('```'):
        cleaned = re.sub(r'^```[\w]*\n?', '', cleaned)
        cleaned = re.sub(r'\n?```$', '', cleaned)
    return cleaned.strip()


def format_essay_layout(raw: str) -> str:
    """Normalize title / body / signature spacing."""
    lines = [ln.strip() for ln in raw.replace('\r\n', '\n').split('\n')]
    lines = [ln for ln in lines if ln]
    if not lines:
        return ''

    title = lines[0]
    signature = ''
    body_lines = lines[1:]

    if len(body_lines) >= 1 and len(body_lines[-1]) <= 6 and re.search(r'[\u4e00-\u9fff]', body_lines[-1]):
        if not re.search(r'[。、]$', body_lines[-1]):
            signature = body_lines.pop()

    body = '\n'.join(body_lines).strip()
    if not body and len(lines) > 1:
        body = '\n'.join(lines[1:])

    parts = [title, '', body]
    if signature:
        parts.extend(['', signature])
    return '\n'.join(parts).strip() + '\n'
