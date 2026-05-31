from pydantic import BaseModel, Field


class AgentRunSummary(BaseModel):
    agent_name: str
    status: str
    confidence: float
    created_at: str


class AdminOverviewResponse(BaseModel):
    queued_reviews: int
    active_sessions: int
    total_properties: int
    llm_mode: str
    recent_agent_runs: list[AgentRunSummary] = Field(default_factory=list)
