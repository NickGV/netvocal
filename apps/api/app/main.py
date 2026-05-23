from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.intent import router as intent_router
from app.api.routes.meetings import router as meetings_router
from app.api.routes.tasks import router as tasks_router
from app.api.routes.voice import router as voice_router
from app.core.settings import Settings


def create_app() -> FastAPI:
    settings = Settings()
    app = FastAPI(title="Voice Assistant API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health_router)
    app.include_router(voice_router, prefix="/voice", tags=["voice"])
    app.include_router(tasks_router, prefix="/tasks", tags=["tasks"])
    app.include_router(meetings_router, prefix="/meetings", tags=["meetings"])
    app.include_router(intent_router, prefix="/intent", tags=["intent"])

    return app


app = create_app()
