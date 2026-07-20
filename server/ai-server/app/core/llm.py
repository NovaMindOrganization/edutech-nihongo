import json
import logging
import re
from dataclasses import dataclass

import httpx
from pydantic import BaseModel

from app.core.agentrouter_client import build_openai_compat_headers, enrich_agentrouter_error
from app.core.agentrouter_vision import agentrouter_vision_transcribe
from app.core.config import settings
from app.core.llm_runtime import get_llm_config
from app.core.prompts import DEFAULT_JSON_TUTOR, load_prompt

logger = logging.getLogger(__name__)

SESSION_START_MARKER = '[SESSION_START]'


class LlmReply(BaseModel):
    AI_Reply: str
    Correction: str | None = None


@dataclass(frozen=True)
class OpenAICompatResult:
    content: str | None = None
    error: str | None = None


def _extract_openai_error(data: dict, status_code: int) -> str:
    err = data.get('error')
    if isinstance(err, dict) and err.get('message'):
        return str(err['message'])
    if data.get('message'):
        return str(data['message'])
    return f'HTTP {status_code}'


def _extract_openai_content(data: dict) -> str | None:
    choices = data.get('choices') or []
    if not choices:
        return None
    msg = choices[0].get('message') or {}
    content = msg.get('content')
    if isinstance(content, str) and content.strip():
        return content.strip()
    if isinstance(content, list):
        parts = [p.get('text', '') for p in content if isinstance(p, dict)]
        joined = ''.join(parts).strip()
        if joined:
            return joined
    reasoning = msg.get('reasoning_content') or msg.get('reasoning')
    if isinstance(reasoning, str) and reasoning.strip():
        return reasoning.strip()
    return None


def _list_openai_models(client: httpx.Client, base_url: str, api_key: str) -> list[str]:
    try:
        res = client.get(
            f'{base_url}/models',
            headers=build_openai_compat_headers(base_url, api_key),
        )
        if res.status_code >= 400:
            return []
        data = res.json()
        return [
            str(item['id'])
            for item in data.get('data', [])
            if isinstance(item, dict) and item.get('id')
        ]
    except Exception:
        return []


def openai_compatible_chat(
    messages: list[dict[str, str]],
    *,
    model: str | None = None,
    temperature: float | None = None,
) -> OpenAICompatResult:
    cfg = get_llm_config()
    api_key = cfg.openai_api_key
    if not api_key:
        return OpenAICompatResult(error='Missing OpenAI-compatible API key')

    use_model = model or cfg.openai_model
    use_temp = cfg.temperature if temperature is None else temperature

    try:
        with httpx.Client(timeout=90) as client:
            res = client.post(
                f'{cfg.openai_base_url}/chat/completions',
                headers=build_openai_compat_headers(cfg.openai_base_url, api_key),
                json={
                    'model': use_model,
                    'messages': messages,
                    'temperature': use_temp,
                },
            )
            try:
                data = res.json()
            except json.JSONDecodeError:
                return OpenAICompatResult(
                    error=f'Non-JSON response ({res.status_code}): {res.text[:300]}',
                )

            if res.status_code >= 400:
                err_msg = enrich_agentrouter_error(
                    _extract_openai_error(data, res.status_code),
                )
                hint = ''
                if 'model' in err_msg.lower() or res.status_code in (400, 404):
                    available = _list_openai_models(client, cfg.openai_base_url, api_key)
                    if available:
                        hint = f" — try: {', '.join(available[:10])}"
                return OpenAICompatResult(error=f'{err_msg}{hint}')

            content = _extract_openai_content(data)
            if not content:
                return OpenAICompatResult(
                    error=f'Empty message content from API: {json.dumps(data)[:400]}',
                )
            return OpenAICompatResult(content=content)
    except httpx.TimeoutException:
        return OpenAICompatResult(error='Request timed out')
    except Exception as err:
        logger.warning('OpenAI-compatible API error: %s', err)
        return OpenAICompatResult(error=str(err))


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
    cfg = get_llm_config()
    primary = cfg.gemini_model
    seen: set[str] = set()
    ordered: list[str] = []
    for name in (primary, *GEMINI_FALLBACK_MODELS):
        if name not in seen:
            seen.add(name)
            ordered.append(name)
    return ordered


def _ocr_gemini_models_to_try() -> list[str]:
    """Gemini models for OCR vision / fallback only (admin-configured)."""
    cfg = get_llm_config()
    primary = (cfg.ocr_gemini_fallback_model or '').strip() or cfg.gemini_model
    seen: set[str] = set()
    ordered: list[str] = []
    for name in (primary, cfg.gemini_model, *GEMINI_FALLBACK_MODELS):
        if name and name not in seen:
            seen.add(name)
            ordered.append(name)
    return ordered


def _gemini_generate(
    parts: list[dict],
    *,
    temperature: float | None = None,
    models: list[str] | None = None,
) -> str | None:
    cfg = get_llm_config()
    api_key = cfg.gemini_api_key or settings.gemini_key
    if not api_key:
        return None

    payload: dict = {'contents': [{'parts': parts}]}
    if temperature is not None:
        payload['generationConfig'] = {'temperature': temperature}
    last_err: Exception | None = None
    model_list = models if models is not None else _gemini_models_to_try()

    with httpx.Client(timeout=90) as client:
        for model in model_list:
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
                if err.response.status_code in (404, 429, 503):
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


def _openai_chat_messages(
    user_text: str,
    history: list[dict[str, str]],
    *,
    prompt_name: str | None = None,
    system_extra: str = '',
) -> list[dict[str, str]]:
    system = _resolve_system(prompt_name, system_extra)
    messages: list[dict[str, str]] = [{'role': 'system', 'content': system}]
    for h in history[-10:]:
        messages.append({'role': h['role'], 'content': h['content']})
    messages.append({'role': 'user', 'content': user_text})
    return messages


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


def call_openai_compatible(
    user_text: str,
    history: list[dict[str, str]],
    *,
    prompt_name: str | None = None,
    system_extra: str = '',
    json_mode: bool = True,
) -> LlmReply | None:
    messages = _openai_chat_messages(
        user_text,
        history,
        prompt_name=prompt_name,
        system_extra=system_extra,
    )
    result = openai_compatible_chat(messages)
    if not result.content:
        if result.error:
            logger.warning('OpenAI-compatible API error: %s', result.error)
        return None
    if json_mode:
        return _parse_json_content(result.content)
    return LlmReply(AI_Reply=result.content, Correction=None)


def _gemini_api_key_for_fallback() -> str | None:
    cfg = get_llm_config()
    return cfg.gemini_api_key or settings.gemini_key


def _agent_router_should_fallback(error: str | None) -> bool:
    if not error:
        return False
    lowered = error.lower()
    return (
        'content-blocked' in lowered
        or 'unauthorized' in lowered
        or 'not support' in lowered
        or 'vision' in lowered
    )


def openai_raw_generate(system: str, user: str) -> str | None:
    cfg = get_llm_config()
    if cfg.provider == 'agent_router' and cfg.openai_api_key:
        result = openai_compatible_chat(
            [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user},
            ],
        )
        if result.content:
            return result.content
        if _agent_router_should_fallback(result.error) and _gemini_api_key_for_fallback():
            logger.info('Agent Router unavailable for text (%s) — using Gemini', result.error)
            text = _gemini_generate(
                [{'text': f'System: {system}'}, {'text': user}],
                temperature=0,
            )
            return text
        if result.error:
            logger.warning('OpenAI-compatible raw generate error: %s', result.error)
        return None

    if cfg.gemini_api_key:
        return _gemini_generate(
            [{'text': f'System: {system}'}, {'text': user}],
            temperature=0,
        )
    return None


def vision_transcribe(
    prompt: str,
    *,
    image_b64: str,
    mime_type: str = 'image/jpeg',
    temperature: float = 0,
) -> tuple[str | None, str | None]:
    """
    Multimodal OCR/transcription using admin LLM provider (Gemini or Agent Router).
    Returns (text, engine_label e.g. gemini:gemini-2.5-flash).
    """
    cfg = get_llm_config()

    if cfg.provider == 'agent_router':
        text, engine = agentrouter_vision_transcribe(
            prompt,
            image_b64=image_b64,
            mime_type=mime_type,
            temperature=temperature,
        )
        if text:
            return text, engine
        if not _gemini_api_key_for_fallback():
            return None, None
        logger.info('Vision OCR: Agent Router failed — using Gemini fallback')

    gemini_key = cfg.gemini_api_key or settings.gemini_key
    if not gemini_key:
        return None, None
    text = _gemini_generate(
        [
            {'text': prompt},
            {'inline_data': {'mime_type': mime_type, 'data': image_b64}},
        ],
        temperature=temperature,
        models=_ocr_gemini_models_to_try(),
    )
    if not text:
        return None, None
    ocr_model = (cfg.ocr_gemini_fallback_model or cfg.gemini_model).strip()
    label = f'gemini:{ocr_model}'
    if cfg.provider == 'agent_router':
        label = f'{label} (fallback)'
    return text, label


def llm_text_generate(
    system: str,
    user: str,
    *,
    temperature: float | None = None,
) -> tuple[str | None, str | None]:
    """Text-only LLM using admin provider. Returns (text, engine_label)."""
    cfg = get_llm_config()
    use_temp = cfg.temperature if temperature is None else temperature

    if cfg.provider == 'agent_router':
        if cfg.openai_api_key:
            result = openai_compatible_chat(
                [
                    {'role': 'system', 'content': system},
                    {'role': 'user', 'content': user},
                ],
                temperature=use_temp,
            )
            if result.content:
                return result.content, f'agent_router:{cfg.openai_model}'
            if not _agent_router_should_fallback(result.error) or not _gemini_api_key_for_fallback():
                if result.error:
                    logger.warning('LLM text generate (agent_router) error: %s', result.error)
                return None, None
            logger.info('LLM text: Agent Router blocked (%s) — using Gemini', result.error)

    gemini_key = cfg.gemini_api_key or settings.gemini_key
    if not gemini_key:
        return None, None
    text = _gemini_generate(
        [{'text': f'System: {system}'}, {'text': user}],
        temperature=use_temp,
    )
    if not text:
        return None, None
    label = f'gemini:{cfg.gemini_model}'
    if cfg.provider == 'agent_router':
        label = f'{label} (fallback)'
    return text, label


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
    return call_openai_compatible(
        user_text,
        history,
        prompt_name=prompt_name,
        system_extra=system_extra,
    )


def chat_with_prompt(
    prompt_name: str,
    user_text: str,
    history: list[dict[str, str]],
    *,
    system_extra: str = '',
) -> LlmReply | None:
    cfg = get_llm_config()
    if cfg.provider == 'agent_router':
        return call_openai_compatible(
            user_text,
            history,
            prompt_name=prompt_name,
            system_extra=system_extra,
        )
    return call_gemini(
        user_text,
        history,
        prompt_name=prompt_name,
        system_extra=system_extra,
    ) or call_openai_compatible(
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
    if len(text) < 4:
        return None

    system = load_prompt('ocr-explain')
    user_block = (
        f'Extracted text:\n{text}\n\n'
        f'Matched vocabulary: {", ".join(matched_vocab[:8]) or "none"}\n'
        f'Matched grammar: {", ".join(matched_grammar[:5]) or "none"}'
    )

    cfg = get_llm_config()
    if cfg.provider == 'agent_router':
        return openai_raw_generate(system, user_block)

    if not cfg.gemini_api_key:
        return None

    parts = [{'text': f'System: {system}'}, {'text': user_block}]
    raw = _gemini_generate(parts)
    return raw.strip() if raw else None
