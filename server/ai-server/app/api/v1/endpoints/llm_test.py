import time

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.core.llm import _gemini_generate, openai_compatible_chat
from app.core.llm_runtime import apply_llm_config, get_llm_config
from app.schemas.llm_config import LlmConfigPayload

router = APIRouter(prefix='/llm', tags=['llm'])

TEST_SYSTEM = 'You are an API connectivity check. Reply with exactly one word: OK'
TEST_USER = 'ping'


class LlmTestRequest(BaseModel):
    llm_config: LlmConfigPayload
    test_provider: str = Field(description='gemini | agent_router')


class LlmTestResponse(BaseModel):
    ok: bool
    provider: str
    model: str
    latency_ms: int
    reply: str | None = None
    error: str | None = None


@router.post('/test', response_model=LlmTestResponse)
def test_llm(body: LlmTestRequest) -> LlmTestResponse:
    apply_llm_config(body.llm_config)
    cfg = get_llm_config()
    provider = body.test_provider if body.test_provider in ('gemini', 'agent_router') else cfg.provider

    if provider == 'agent_router':
        if not cfg.openai_api_key:
            return LlmTestResponse(
                ok=False,
                provider=provider,
                model=cfg.openai_model,
                latency_ms=0,
                error='Missing OpenAI-compatible API key',
            )
        model = cfg.openai_model
        started = time.perf_counter()
        result = openai_compatible_chat(
            [
                {'role': 'system', 'content': TEST_SYSTEM},
                {'role': 'user', 'content': TEST_USER},
            ],
        )
        latency_ms = int((time.perf_counter() - started) * 1000)
        if not result.content:
            return LlmTestResponse(
                ok=False,
                provider=provider,
                model=model,
                latency_ms=latency_ms,
                error=result.error or 'No response from API (check base URL, model, key)',
            )
        reply = result.content
        return LlmTestResponse(
            ok=True,
            provider=provider,
            model=model,
            latency_ms=latency_ms,
            reply=reply[:500],
        )

    if not cfg.gemini_api_key:
        return LlmTestResponse(
            ok=False,
            provider='gemini',
            model=cfg.gemini_model,
            latency_ms=0,
            error='Missing Gemini API key',
        )

    model = cfg.gemini_model
    started = time.perf_counter()
    reply = _gemini_generate(
        [{'text': f'System: {TEST_SYSTEM}'}, {'text': TEST_USER}],
    )
    latency_ms = int((time.perf_counter() - started) * 1000)
    if not reply:
        return LlmTestResponse(
            ok=False,
            provider='gemini',
            model=model,
            latency_ms=latency_ms,
            error='No response from Gemini (check model id and API key)',
        )
    return LlmTestResponse(
        ok=True,
        provider='gemini',
        model=model,
        latency_ms=latency_ms,
        reply=reply.strip()[:500],
    )
