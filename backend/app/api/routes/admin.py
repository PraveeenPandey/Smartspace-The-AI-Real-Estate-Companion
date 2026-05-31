from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.admin import AdminOverviewResponse
from backend.app.services.orchestrator import OrchestratorService


router = APIRouter()


@router.get("/overview", response_model=AdminOverviewResponse)
def get_overview(db: Session = Depends(get_db)) -> AdminOverviewResponse:
    orchestrator = OrchestratorService(db)
    return orchestrator.get_admin_overview()
