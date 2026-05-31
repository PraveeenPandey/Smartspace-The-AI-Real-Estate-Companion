from fastapi import APIRouter

from backend.app.api.routes import admin, chat, documents, health, ingestion, listings, recommendations


api_router = APIRouter()
api_router.include_router(health.router, prefix="/health", tags=["health"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["recommendations"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(documents.router, prefix="/documents", tags=["documents"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
