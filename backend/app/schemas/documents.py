from pydantic import BaseModel, Field


class DocumentAnalysisRequest(BaseModel):
    user_id: int | None = None
    property_id: int | None = None
    document_type: str
    file_url: str
    raw_text: str | None = None


class DocumentAnalysisResponse(BaseModel):
    document_id: int
    summary: str
    extracted_fields: dict = Field(default_factory=dict)
    missing_items: list[str] = Field(default_factory=list)
    confidence: float
    requires_human_review: bool

