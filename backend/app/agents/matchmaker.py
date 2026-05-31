from backend.app.agents.base import BaseAgent
from backend.app.models.models import Property
from backend.app.services.gemini import GeminiService


class MatchmakerAgent(BaseAgent):
    agent_name = "matchmaker_agent"

    def __init__(self, gemini: GeminiService) -> None:
        self.gemini = gemini

    def score_property(self, requirement: dict, property_item: Property) -> tuple[float, str, float]:
        if self.gemini.is_configured:
            result = self.gemini.score_match(requirement, self._property_payload(property_item))
            return result["score"], result["rationale"], result["confidence"]

        locality_bonus = 0.1 if property_item.locality in requirement.get("preferred_localities", []) else 0.0
        score = round(0.75 + locality_bonus, 2)
        return score, "Reasonable fit for the current requirement set.", 0.44

    def _property_payload(self, property_item: Property) -> dict:
        return {
            "title": property_item.title,
            "city": property_item.city,
            "locality": property_item.locality,
            "property_type": property_item.property_type,
            "bhk": property_item.bhk,
            "bathrooms": property_item.bathrooms,
            "area_sqft": property_item.area_sqft,
            "price": property_item.price,
            "furnishing": property_item.furnishing,
            "amenities": property_item.amenities,
        }
