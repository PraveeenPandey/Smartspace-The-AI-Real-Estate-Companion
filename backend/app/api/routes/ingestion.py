from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.seed import seed_properties


router = APIRouter()


@router.post("/sample-properties")
def ingest_sample_properties(db: Session = Depends(get_db)) -> dict[str, str]:
    seed_properties(db)
    return {"status": "ok", "message": "Sample properties ingested successfully."}
