"""Agent Router vision OCR — Claude-native messages + OpenAI multimodal fallback."""

from __future__ import annotations

import base64
import io
import logging
import os
from typing import Any

import httpx
from PIL import Image

from app.core.agentrouter_client import build_openai_compat_headers, enrich_agentrouter_error
from app.core.llm_runtime import get_llm_config

logger = logging.getLogger(__name__)

# Models that accept image input via Agent Router (not DeepSeek text-only).
VISION_MODEL_CANDIDATES = (
    'claude-opus-4-6',
    'claude-sonnet-4-5-20250929',
    'claude-haiku-4-5-20251001',
    'gpt-4o',
    'gpt-4o-mini',
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'glm-4.6',
)

_TEXT_ONLY_MODEL_HINTS = ('deepseek', 'qwen', 'llama', 'mistral', 'o1-mini', 'o3-mini')

_OCR_VISION_PROMPT = (
    'You are a Japanese OCR engine. Transcribe every character visible in the image '
    'into natural horizontal Japanese. Preserve punctuation (、。). '
    'Output plain text only — no markdown, no explanation.'
)


def _vision_model_candidates() -> list[str]:
    cfg = get_llm_config()
    primary = (
        os.getenv('OCR_AGENTROUTER_VISION_MODEL', '').strip()
        or (cfg.ocr_agent_router_vision_model or '').strip()
        or 'claude-opus-4-6'
    )
    if _is_text_only_model(primary):
        logger.warning(
            'OCR vision model %s is text-only; falling back to claude-opus-4-6',
            primary,
        )
        primary = 'claude-opus-4-6'
    ordered: list[str] = [primary]
    for name in VISION_MODEL_CANDIDATES:
        if name not in ordered:
            ordered.append(name)
    return ordered


def _is_text_only_model(model: str) -> bool:
    lowered = model.lower()
    return any(hint in lowered for hint in _TEXT_ONLY_MODEL_HINTS)


def _prepare_image_b64(
    image_b64: str,
    *,
    mime_type: str,
    max_side: int = 1600,
    jpeg_quality: int = 88,
) -> tuple[str, str]:
    """Resize large images; Claude/GPT vision works better with JPEG under ~5MB."""
    raw = image_b64.split(',')[-1] if ',' in image_b64 else image_b64
    data = base64.b64decode(raw)
    img = Image.open(io.BytesIO(data))
    if img.mode not in ('RGB', 'L'):
        img = img.convert('RGB')
    w, h = img.size
    if max(w, h) > max_side:
        scale = max_side / max(w, h)
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format='JPEG', quality=jpeg_quality, optimize=True)
    out_b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    return out_b64, 'image/jpeg'


def _is_blocked_error(message: str | None) -> bool:
    if not message:
        return False
    lowered = message.lower()
    return (
        'content-blocked' in lowered
        or 'content_filter' in lowered
        or 'sensitive_words' in lowered
        or 'content policy' in lowered
    )


def _extract_anthropic_text(data: dict) -> str | None:
    for block in data.get('content') or []:
        if isinstance(block, dict) and block.get('type') == 'text':
            text = block.get('text', '')
            if isinstance(text, str) and text.strip():
                return text.strip()
    return None


def _anthropic_messages_vision(
    client: httpx.Client,
    *,
    base_url: str,
    api_key: str,
    model: str,
    image_b64: str,
    media_type: str,
    prompt: str,
    temperature: float,
) -> tuple[str | None, str | None]:
    """Claude vision via /v1/messages (preferred on Agent Router for Claude models)."""
    url = f'{base_url.rstrip("/")}/messages'
    headers = build_openai_compat_headers(base_url, api_key)
    payload: dict[str, Any] = {
        'model': model,
        'max_tokens': 4096,
        'temperature': temperature,
        'messages': [{
            'role': 'user',
            'content': [
                {
                    'type': 'image',
                    'source': {
                        'type': 'base64',
                        'media_type': media_type,
                        'data': image_b64,
                    },
                },
                {'type': 'text', 'text': prompt},
            ],
        }],
    }
    res = client.post(url, headers=headers, json=payload)
    try:
        data = res.json()
    except Exception:
        return None, f'Non-JSON ({res.status_code}): {res.text[:200]}'

    if res.status_code >= 400:
        err = data.get('error', data)
        msg = err.get('message', err) if isinstance(err, dict) else str(err)
        return None, str(msg)

    text = _extract_anthropic_text(data)
    if text:
        return text, None
    return None, 'Empty Anthropic message content'


def _openai_chat_vision(
    client: httpx.Client,
    *,
    base_url: str,
    api_key: str,
    model: str,
    data_url: str,
    prompt: str,
    temperature: float,
) -> tuple[str | None, str | None]:
    url = f'{base_url.rstrip("/")}/chat/completions'
    headers = build_openai_compat_headers(base_url, api_key)
    payload = {
        'model': model,
        'temperature': temperature,
        'max_tokens': 4096,
        'messages': [{
            'role': 'user',
            'content': [
                {'type': 'text', 'text': prompt},
                {'type': 'image_url', 'image_url': {'url': data_url, 'detail': 'low'}},
            ],
        }],
    }
    res = client.post(url, headers=headers, json=payload)
    try:
        data = res.json()
    except Exception:
        return None, f'Non-JSON ({res.status_code}): {res.text[:200]}'

    if res.status_code >= 400:
        err = data.get('error', data)
        msg = err.get('message', err) if isinstance(err, dict) else str(err)
        return None, enrich_agentrouter_error(str(msg))

    choices = data.get('choices') or []
    if not choices:
        return None, 'No choices in response'
    msg = choices[0].get('message') or {}
    content = msg.get('content')
    if isinstance(content, str) and content.strip():
        return content.strip(), None
    if isinstance(content, list):
        parts = [p.get('text', '') for p in content if isinstance(p, dict)]
        joined = ''.join(parts).strip()
        if joined:
            return joined, None
    return None, 'Empty chat completion content'


def agentrouter_vision_transcribe(
    prompt: str,
    *,
    image_b64: str,
    mime_type: str = 'image/jpeg',
    temperature: float = 0,
) -> tuple[str | None, str | None]:
    """
    Vision OCR through Agent Router.
    Tries Anthropic /v1/messages then OpenAI /v1/chat/completions per vision-capable model.
    """
    cfg = get_llm_config()
    api_key = cfg.openai_api_key
    if not api_key:
        return None, 'Missing Agent Router API key'

    base_url = cfg.openai_base_url.rstrip('/')
    prepared_b64, media_type = _prepare_image_b64(image_b64, mime_type=mime_type)
    data_url = f'data:{media_type};base64,{prepared_b64}'
    use_prompt = prompt.strip() or _OCR_VISION_PROMPT

    last_err: str | None = None
    with httpx.Client(timeout=120) as client:
        for model in _vision_model_candidates():
            if model.lower().startswith('claude'):
                text, err = _anthropic_messages_vision(
                    client,
                    base_url=base_url,
                    api_key=api_key,
                    model=model,
                    image_b64=prepared_b64,
                    media_type=media_type,
                    prompt=use_prompt,
                    temperature=temperature,
                )
                if text:
                    logger.info('Agent Router vision OK (anthropic/%s)', model)
                    return text, f'agent_router:{model}'
                last_err = err
                if err and not _is_blocked_error(err):
                    logger.debug('Anthropic vision %s: %s', model, err)

            text, err = _openai_chat_vision(
                client,
                base_url=base_url,
                api_key=api_key,
                model=model,
                data_url=data_url,
                prompt=use_prompt,
                temperature=temperature,
            )
            if text:
                logger.info('Agent Router vision OK (openai/%s)', model)
                return text, f'agent_router:{model}'
            last_err = err
            if err and not _is_blocked_error(err):
                logger.debug('OpenAI vision %s: %s', model, err)

    if last_err and _is_blocked_error(last_err):
        logger.warning(
            'Agent Router vision blocked by gateway filter (%s). '
            'Use claude-opus-4-6 / gpt-4o in admin, or OCR_AGENTROUTER_VISION_MODEL.',
            last_err,
        )
    return None, last_err
