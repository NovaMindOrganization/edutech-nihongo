"""Merge Paddle + vision OCR and polish layout via admin LLM."""

from __future__ import annotations

import logging

from app.core.llm import llm_text_generate
from app.core.llm_runtime import get_llm_config
from app.ocr.gemini_ocr import _clean_llm_text, format_essay_layout

logger = logging.getLogger(__name__)

_REFINE_SYSTEM_JA = '''あなたは日本語OCRの後処理エディターです。
複数エンジンの生出力を統合し、読みやすい完成稿に整えます。

役割:
- 縦書き・乱れた行順を横書きの自然な日本語に並べ替える
- タイトル・本文・署名のレイアウトを整える（空行ルールを守る）
- 2つのOCR結果で一致する語句を優先し、明らかな誤認識のみ修正する

禁止: 要約、言い換え、創作、原文にない内容の追加。'''

_REFINE_SYSTEM_EN = (
    'You merge two Japanese OCR outputs into one clean document. '
    'Fix reading order and paragraph breaks. Prefer tokens agreed by both sources. '
    'No summarization or invention. Output plain Japanese text only.'
)


def _build_refine_user(
    *,
    paddle_text: str,
    vision_text: str,
    vertical_tategaki: bool,
) -> str:
    layout_hint = (
        '縦書き原稿（各列は右→左、列内は上→下）。横書きの自然な読み順に直す。'
        if vertical_tategaki
        else '横書きまたはブロック混在。上から下・左から右の読み順に整える。'
    )
    blocks: list[str] = [
        layout_hint,
        '',
    ]
    if paddle_text.strip():
        blocks.extend(['--- PaddleOCR raw ---', paddle_text.strip(), ''])
    if vision_text.strip():
        blocks.extend(['--- Vision LLM raw ---', vision_text.strip(), ''])
    if not paddle_text.strip() and not vision_text.strip():
        return ''

    blocks.extend([
        '【出力形式 — プレーンテキストのみ】',
        '1行目: タイトル',
        '2行目: 空行',
        '3行目以降: 本文（「、」「。」を保持。段落は意味のまとまりで改行）',
        '最後: 空行のあと署名（右下の名前のみ、あれば）',
        '',
        'Markdown・説明・注釈は書かない。',
    ])
    return '\n'.join(blocks)


def refine_ocr_output(
    *,
    paddle_text: str,
    vision_text: str,
    vertical_tategaki: bool = False,
) -> tuple[str | None, str | None]:
    """
    Merge OCR sources and return (formatted_text, refine_engine_label).
    """
    paddle = paddle_text.strip()
    vision = vision_text.strip()
    if not paddle and not vision:
        return None, None

    if paddle and not vision:
        return format_essay_layout(paddle), None
    if vision and not paddle:
        return format_essay_layout(vision), None

    user = _build_refine_user(
        paddle_text=paddle,
        vision_text=vision,
        vertical_tategaki=vertical_tategaki,
    )
    if not user:
        return None, None

    system = (
        _REFINE_SYSTEM_EN
        if get_llm_config().provider == 'agent_router'
        else _REFINE_SYSTEM_JA
    )
    raw, engine = llm_text_generate(system, user, temperature=0)
    if not raw:
        merged = vision if len(vision) >= len(paddle) else paddle
        return format_essay_layout(merged), engine

    cleaned = _clean_llm_text(raw)
    if not cleaned:
        merged = vision if len(vision) >= len(paddle) else paddle
        return format_essay_layout(merged), engine

    return format_essay_layout(cleaned), engine


def pick_best_without_refine(paddle_text: str, vision_text: str) -> str:
    """Fallback when refine LLM unavailable."""
    paddle = paddle_text.strip()
    vision = vision_text.strip()
    if vision and len(vision) > len(paddle) * 0.6:
        return format_essay_layout(vision)
    if paddle:
        return format_essay_layout(paddle)
    return format_essay_layout(vision) if vision else ''
