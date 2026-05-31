from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.listings import ListingCreateRequest, ListingCreateResponse
from backend.app.services.orchestrator import OrchestratorService


router = APIRouter()


@router.post("/create", response_model=ListingCreateResponse)
def create_listing(
    payload: ListingCreateRequest, db: Session = Depends(get_db)
) -> ListingCreateResponse:
    orchestrator = OrchestratorService(db)
    return orchestrator.create_listing(payload)

