import os
from collections.abc import Callable
from contextvars import ContextVar, copy_context
from dataclasses import dataclass
from typing import TypeVar

from app.core.config import settings
from app.schemas.llm_config import LlmConfigPayload

T = TypeVar('T')

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
    ocr_agent_router_vision_model: str
    ocr_gemini_fallback_model: str


def _default_runtime() -> LlmRuntimeConfig:
    return LlmRuntimeConfig(
        provider='gemini',
        gemini_api_key=settings.gemini_key,
        gemini_model=settings.gemini_model,
        openai_api_key=settings.openai_api_key,
        openai_base_url='https://agentrouter.org/v1',
        openai_model=settings.llm_model,
        temperature=0.4,
        ocr_agent_router_vision_model=os.getenv(
            'OCR_AGENTROUTER_VISION_MODEL', 'claude-opus-4-6',
        ),
        ocr_gemini_fallback_model=os.getenv(
            'OCR_GEMINI_FALLBACK_MODEL', 'gemini-2.5-flash-lite',
        ),
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
        ocr_agent_router_vision_model=(
            payload.ocr_agent_router_vision_model or 'claude-opus-4-6'
        ),
        ocr_gemini_fallback_model=(
            payload.ocr_gemini_fallback_model or 'gemini-2.5-flash-lite'
        ),
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


def run_in_request_context(fn: Callable[[], T]) -> T:
    """Run fn with the current contextvars (e.g. llm_runtime) — required for ThreadPoolExecutor."""
    return copy_context().run(fn)
