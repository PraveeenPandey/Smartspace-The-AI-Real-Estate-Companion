from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.session import get_db
from backend.app.schemas.chat import ChatRequest, ChatResponse, SessionDetailResponse
from backend.app.services.orchestrator import OrchestratorService


router = APIRouter()


@router.post("/message", response_model=ChatResponse)
def send_message(payload: ChatRequest, db: Session = Depends(get_db)) -> ChatResponse:
    orchestrator = OrchestratorService(db)
    return orchestrator.handle_chat(payload)


@router.get("/sessions/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(session_id: int, db: Session = Depends(get_db)) -> SessionDetailResponse:
    orchestrator = OrchestratorService(db)
    return orchestrator.get_session_detail(session_id)
