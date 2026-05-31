from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.recommendations import RecommendationRequest, RecommendationResponse
from backend.app.services.orchestrator import OrchestratorService


router = APIRouter()


@router.post("/search", response_model=RecommendationResponse)
def search_recommendations(
    payload: RecommendationRequest, db: Session = Depends(get_db)
) -> RecommendationResponse:
    orchestrator = OrchestratorService(db)
    return orchestrator.build_recommendations(payload)

