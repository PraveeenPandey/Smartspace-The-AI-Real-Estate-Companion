from fastapi import APIRouter

from backend.app.core.config import get_settings


router = APIRouter()


@router.get("")
def health_check() -> dict[str, str]:
    settings = get_settings()
    return {
        "status": "ok",
        "environment": settings.environment,
        "llm_provider": settings.llm_provider,
    }

