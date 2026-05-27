import json
import logging
import re

import httpx
from pydantic import BaseModel

from app.core.config import settings
from app.core.prompts import DEFAULT_JSON_TUTOR, load_prompt

logger = logging.getLogger(__name__)

SESSION_START_MARKER = '[SESSION_START]'


class LlmReply(BaseModel):
    AI_Reply: str
    Correction: str | None = None


def _parse_json_content(content: str) -> LlmReply | None:
    match = re.search(r'\{.*\}', content, re.DOTALL)
    if not match:
        return None
    try:
        data = json.loads(match.group())
        return LlmReply(
            AI_Reply=data.get('AI_Reply', ''),
            Correction=data.get('Correction'),
        )
    except json.JSONDecodeError:
        return None


GEMINI_FALLBACK_MODELS = (
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-2.5-flash-lite',
)


def _gemini_models_to_try() -> list[str]:
    primary = settings.gemini_model
    seen: set[str] = set()
    ordered: list[str] = []
    for name in (primary, *GEMINI_FALLBACK_MODELS):
        if name not in seen:
            seen.add(name)
            ordered.append(name)
    return ordered


def _gemini_generate(parts: list[dict]) -> str | None:
    api_key = settings.gemini_key
    if not api_key:
        return None

    payload = {'contents': [{'parts': parts}]}
    last_err: Exception | None = None

    with httpx.Client(timeout=90) as client:
        for model in _gemini_models_to_try():
            url = (
                f'https://generativelanguage.googleapis.com/v1beta/models/'
                f'{model}:generateContent?key={api_key}'
            )
            try:
                res = client.post(url, json=payload)
                res.raise_for_status()
                body = res.json()
                return body['candidates'][0]['content']['parts'][0]['text']
            except httpx.HTTPStatusError as err:
                last_err = err
                if err.response.status_code in (404, 429):
                    logger.warning('Gemini model %s unavailable (%s), trying fallback', model, err)
                    continue
                logger.warning('Gemini API error (%s): %s', model, err)
                return None
            except Exception as err:
                last_err = err
                logger.warning('Gemini API error (%s): %s', model, err)
                return None

    if last_err:
        logger.warning('Gemini exhausted all models: %s', last_err)
    return None


def _resolve_system(prompt_name: str | None, system_extra: str = '') -> str:
    if prompt_name:
        system = load_prompt(prompt_name)
    elif settings.llm_system_prompt:
        system = settings.llm_system_prompt
    else:
        system = DEFAULT_JSON_TUTOR
    if system_extra:
        system = f'{system}\n\n{system_extra}'
    return system


def call_gemini(
    user_text: str,
    history: list[dict[str, str]],
    *,
    prompt_name: str | None = None,
    system_extra: str = '',
) -> LlmReply | None:
    system = _resolve_system(prompt_name, system_extra)
    parts = [{'text': f'System: {system}'}]
    for h in history[-10:]:
        parts.append({'text': f'{h["role"]}: {h["content"]}'})
    parts.append({'text': f'user: {user_text}'})

    text = _gemini_generate(parts)
    if not text:
        return None
    parsed = _parse_json_content(text)
    if parsed and parsed.AI_Reply:
        return parsed
    return None


def call_openai(
    user_text: str,
    history: list[dict[str, str]],
    *,
    prompt_name: str | None = None,
    system_extra: str = '',
) -> LlmReply | None:
    api_key = settings.openai_api_key
    if not api_key:
        return None

    system = _resolve_system(prompt_name, system_extra)
    messages = [{'role': 'system', 'content': system}]
    for h in history[-10:]:
        messages.append({'role': h['role'], 'content': h['content']})
    messages.append({'role': 'user', 'content': user_text})

    try:
        with httpx.Client(timeout=60) as client:
            res = client.post(
                'https://api.openai.com/v1/chat/completions',
                headers={'Authorization': f'Bearer {api_key}'},
                json={
                    'model': settings.llm_model,
                    'messages': messages,
                    'temperature': 0.4,
                },
            )
            res.raise_for_status()
            content = res.json()['choices'][0]['message']['content']
            return _parse_json_content(content)
    except Exception as err:
        logger.warning('OpenAI API error: %s', err)
        return None


def chat_with_prompt(
    prompt_name: str,
    user_text: str,
    history: list[dict[str, str]],
    *,
    system_extra: str = '',
) -> LlmReply | None:
    return call_gemini(
        user_text,
        history,
        prompt_name=prompt_name,
        system_extra=system_extra,
    ) or call_openai(
        user_text,
        history,
        prompt_name=prompt_name,
        system_extra=system_extra,
    )


def chat_tutor(
    user_text: str,
    history: list[dict[str, str]],
    *,
    prompt_name: str | None = 'speaking-free',
    system_extra: str = '',
) -> LlmReply | None:
    return chat_with_prompt(
        prompt_name or 'speaking-free',
        user_text,
        history,
        system_extra=system_extra,
    )


def explain_homework_japanese(text: str, matched_vocab: list[str], matched_grammar: list[str]) -> str | None:
    if not settings.gemini_key or len(text) < 4:
        return None

    system = load_prompt('ocr-explain')
    user_block = (
        f'Extracted text:\n{text}\n\n'
        f'Matched vocabulary: {", ".join(matched_vocab[:8]) or "none"}\n'
        f'Matched grammar: {", ".join(matched_grammar[:5]) or "none"}'
    )
    parts = [{'text': f'System: {system}'}, {'text': user_block}]
    raw = _gemini_generate(parts)
    return raw.strip() if raw else None
