from fastapi import APIRouter

from app.api.v1.endpoints import community, health, ocr, speaking, speech

api_router = APIRouter(prefix='/api/v1')
api_router.include_router(health.router, tags=['health'])
api_router.include_router(speaking.router)
api_router.include_router(speech.router)
api_router.include_router(community.router)
api_router.include_router(ocr.router)
