from backend.app.agents.base import BaseAgent
from backend.app.models.models import Property
from backend.app.services.gemini import GeminiService


class MarketIntelligenceAgent(BaseAgent):
    agent_name = "market_intelligence_agent"

    def __init__(self, gemini: GeminiService) -> None:
        self.gemini = gemini

    def score_property(self, property_item: Property, purpose: str) -> tuple[float, str, float]:
        if self.gemini.is_configured:
            result = self.gemini.score_market(purpose, self._property_payload(property_item))
            return result["score"], result["rationale"], result["confidence"]

        investment_bonus = 0.08 if purpose == "investment" and property_item.price < 10000000 else 0.04
        family_bonus = 0.07 if purpose == "self_use" and property_item.bhk >= 3 else 0.03
        score = round(0.7 + investment_bonus + family_bonus, 2)
        if purpose == "investment":
            note = "Favorable entry price for early investment screening."
        else:
            note = "Price aligns reasonably for family-use shortlist screening."
        return score, note, 0.43

    def _property_payload(self, property_item: Property) -> dict:
        return {
            "title": property_item.title,
            "city": property_item.city,
            "locality": property_item.locality,
            "price": property_item.price,
            "bhk": property_item.bhk,
            "area_sqft": property_item.area_sqft,
            "furnishing": property_item.furnishing,
            "amenities": property_item.amenities,
        }
