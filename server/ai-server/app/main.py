import logging
import warnings
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi_offline import FastAPIOffline

load_dotenv()

# Paddle import noise (harmless; ccache optional on dev machines).
warnings.filterwarnings('ignore', message='.*ccache.*', category=UserWarning)

from starlette.requests import Request

from app.api.v1.router import api_router
from app.core.llm_runtime import reset_llm_config

logger = logging.getLogger(__name__)


@asynccontextmanager
async def _app_lifespan(application: FastAPIOffline):
    from app.ocr.paddle_engine import warmup_paddle_ocr

    if warmup_paddle_ocr():
        logger.info('OCR: models loaded from local cache (see ~/.paddlex/official_models)')
    yield


def create_app() -> FastAPIOffline:
    application = FastAPIOffline(title='AI Service', lifespan=_app_lifespan)

    @application.middleware('http')
    async def clear_llm_runtime(_request: Request, call_next):
        try:
            return await call_next(_request)
        finally:
            reset_llm_config()

    application.include_router(api_router)
    return application


app = create_app()
