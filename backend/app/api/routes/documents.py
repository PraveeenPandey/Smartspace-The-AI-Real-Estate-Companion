from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.documents import DocumentAnalysisRequest, DocumentAnalysisResponse
from backend.app.services.orchestrator import OrchestratorService


router = APIRouter()


@router.post("/analyze", response_model=DocumentAnalysisResponse)
def analyze_document(
    payload: DocumentAnalysisRequest, db: Session = Depends(get_db)
) -> DocumentAnalysisResponse:
    orchestrator = OrchestratorService(db)
    return orchestrator.analyze_document(payload)

