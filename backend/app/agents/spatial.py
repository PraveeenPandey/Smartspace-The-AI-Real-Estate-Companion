from backend.app.agents.base import BaseAgent
from backend.app.models.models import Property


class SpatialAgent(BaseAgent):
    agent_name = "spatial_agent"

    def score_property(self, property_item: Property, commute_anchor: str | None) -> tuple[float, str]:
        amenity_bonus = 0.08 if property_item.amenities.get("metro") else 0.03
        commute_bonus = 0.05 if commute_anchor else 0.0
        score = round(0.7 + amenity_bonus + commute_bonus, 2)
        rationale = "Strong metro and family amenity fit." if property_item.amenities.get("metro") else "Good locality utility fit."
        return score, rationale

