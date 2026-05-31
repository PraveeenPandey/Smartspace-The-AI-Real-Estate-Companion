from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    session_id: int | None = None
    user_id: int | None = None
    language: str = "en"
    message: str
    attachments: list[str] = Field(default_factory=list)


class ChatResponse(BaseModel):
    session_id: int | None = None
    reply: str
    intent: str
    extracted_preferences: dict = Field(default_factory=dict)
    next_actions: list[str] = Field(default_factory=list)
    requires_human_review: bool = False


class SessionMessage(BaseModel):
    sender_type: str
    message_type: str
    content_text: str
    extracted_entities: dict = Field(default_factory=dict)
    created_at: str


class SessionDetailResponse(BaseModel):
    session_id: int
    workflow_stage: str
    messages: list[SessionMessage] = Field(default_factory=list)
