from pydantic import BaseModel, Field


class LlmConfigPayload(BaseModel):
    provider: str = 'gemini'
    gemini_api_key: str | None = None
    gemini_model: str = 'gemini-2.5-flash'
    openai_api_key: str | None = None
    openai_base_url: str = 'https://agentrouter.org/v1'
    openai_model: str = 'claude-opus-4-6'
    temperature: float = Field(default=0.4, ge=0, le=2)
    ocr_agent_router_vision_model: str = 'claude-opus-4-6'
    ocr_gemini_fallback_model: str = 'gemini-2.5-flash-lite'
