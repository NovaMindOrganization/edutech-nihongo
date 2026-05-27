from dotenv import load_dotenv
from fastapi_offline import FastAPIOffline

load_dotenv()

from app.api.v1.router import api_router


def create_app() -> FastAPIOffline:
    application = FastAPIOffline(title="AI Service")
    application.include_router(api_router)
    return application


app = create_app()
