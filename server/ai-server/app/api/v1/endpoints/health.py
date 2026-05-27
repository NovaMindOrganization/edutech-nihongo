from fastapi import APIRouter, Query

from app.core.config import settings
from app.core.llm import _gemini_generate

router = APIRouter()


@router.get('/health', summary='Liveness')
def health() -> dict[str, str]:
    return {'status': 'ok'}


@router.get('/ai/status', summary='AI providers status')
def ai_status(probe: bool = Query(False, description='Ping Gemini with a tiny prompt')) -> dict:
    gemini: dict = {
        'configured': bool(settings.gemini_key),
        'model': settings.gemini_model,
        'reachable': None,
    }
    if probe and settings.gemini_key:
        text = _gemini_generate([{'text': 'Reply with exactly: OK'}])
        gemini['reachable'] = bool(text and 'OK' in text.upper())

    return {
        'gemini': gemini,
        'openai': {
            'configured': bool(settings.openai_api_key),
            'model': settings.llm_model,
        },
    }
