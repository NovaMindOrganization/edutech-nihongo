from dotenv import load_dotenv
from fastapi_offline import FastAPIOffline

load_dotenv()

from starlette.requests import Request

from app.api.v1.router import api_router
from app.core.llm_runtime import reset_llm_config


def create_app() -> FastAPIOffline:
    application = FastAPIOffline(title="AI Service")

    @application.middleware('http')
    async def clear_llm_runtime(_request: Request, call_next):
        try:
            return await call_next(_request)
        finally:
            reset_llm_config()

    application.include_router(api_router)
    return application


app = create_app()
