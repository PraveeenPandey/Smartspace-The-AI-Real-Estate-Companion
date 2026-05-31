from pydantic import BaseModel, Field


class ListingCreateRequest(BaseModel):
    owner_name: str
    title: str
    city: str
    locality: str
    property_type: str
    bhk: int
    bathrooms: int
    area_sqft: int
    price: float
    furnishing: str
    amenities: dict = Field(default_factory=dict)
    description: str | None = None


class ListingCreateResponse(BaseModel):
    property_id: int
    generated_title: str
    generated_description: str
    pricing_guidance: str
    missing_fields: list[str] = Field(default_factory=list)

