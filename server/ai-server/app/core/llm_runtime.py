from contextvars import ContextVar
from dataclasses import dataclass

from app.core.config import settings
from app.schemas.llm_config import LlmConfigPayload

_llm_ctx: ContextVar['LlmRuntimeConfig | None'] = ContextVar('llm_runtime', default=None)


@dataclass(frozen=True)
class LlmRuntimeConfig:
    provider: str
    gemini_api_key: str | None
    gemini_model: str
    openai_api_key: str | None
    openai_base_url: str
    openai_model: str
    temperature: float


def _default_runtime() -> LlmRuntimeConfig:
    return LlmRuntimeConfig(
        provider='gemini',
        gemini_api_key=settings.gemini_key,
        gemini_model=settings.gemini_model,
        openai_api_key=settings.openai_api_key,
        openai_base_url='https://agentrouter.org/v1',
        openai_model=settings.llm_model,
        temperature=0.4,
    )


def _from_payload(payload: LlmConfigPayload) -> LlmRuntimeConfig:
    provider = payload.provider if payload.provider in ('gemini', 'agent_router') else 'gemini'
    return LlmRuntimeConfig(
        provider=provider,
        gemini_api_key=payload.gemini_api_key or settings.gemini_key,
        gemini_model=payload.gemini_model or settings.gemini_model,
        openai_api_key=payload.openai_api_key or settings.openai_api_key,
        openai_base_url=(payload.openai_base_url or 'https://agentrouter.org/v1').rstrip('/'),
        openai_model=payload.openai_model or settings.llm_model,
        temperature=payload.temperature,
    )


def apply_llm_config(payload: LlmConfigPayload | None) -> LlmRuntimeConfig:
    cfg = _from_payload(payload) if payload else _default_runtime()
    _llm_ctx.set(cfg)
    return cfg


def get_llm_config() -> LlmRuntimeConfig:
    cfg = _llm_ctx.get()
    return cfg if cfg else _default_runtime()


def reset_llm_config() -> None:
    _llm_ctx.set(None)
