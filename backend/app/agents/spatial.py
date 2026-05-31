from backend.app.agents.base import BaseAgent
from backend.app.models.models import Property
from backend.app.services.gemini import GeminiService


class SpatialAgent(BaseAgent):
    agent_name = "spatial_agent"

    def __init__(self, gemini: GeminiService) -> None:
        self.gemini = gemini

    def score_property(
        self, property_item: Property, commute_anchor: str | None
    ) -> tuple[float, str, float]:
        if self.gemini.is_configured:
            result = self.gemini.score_spatial(commute_anchor, self._property_payload(property_item))
            return result["score"], result["rationale"], result["confidence"]

        amenity_bonus = 0.08 if property_item.amenities.get("metro") else 0.03
        commute_bonus = 0.05 if commute_anchor else 0.0
        score = round(0.7 + amenity_bonus + commute_bonus, 2)
        rationale = (
            "Strong metro and family amenity fit."
            if property_item.amenities.get("metro")
            else "Good locality utility fit."
        )
        return score, rationale, 0.43

    def _property_payload(self, property_item: Property) -> dict:
        return {
            "title": property_item.title,
            "city": property_item.city,
            "locality": property_item.locality,
            "address": property_item.address,
            "bhk": property_item.bhk,
            "amenities": property_item.amenities,
        }
