from pydantic import BaseModel, Field


class RecommendationRequest(BaseModel):
    city: str
    budget_min: float
    budget_max: float
    bhk: int = 2
    property_type: str = "apartment"
    preferred_localities: list[str] = Field(default_factory=list)
    purpose: str = "self_use"
    commute_anchor: str | None = None


class PropertyCard(BaseModel):
    property_id: int
    title: str
    city: str
    locality: str
    price: float
    bhk: int
    area_sqft: int
    match_score: float
    explanation: str


class RecommendationResponse(BaseModel):
    query_summary: str
    properties: list[PropertyCard] = Field(default_factory=list)
    market_summary: str
    next_actions: list[str] = Field(default_factory=list)

