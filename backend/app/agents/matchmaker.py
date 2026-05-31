from backend.app.agents.base import BaseAgent
from backend.app.models.models import Property


class MatchmakerAgent(BaseAgent):
    agent_name = "matchmaker_agent"

    def score_property(self, property_item: Property, preferred_localities: list[str]) -> float:
        locality_bonus = 0.1 if property_item.locality in preferred_localities else 0.0
        return round(0.75 + locality_bonus, 2)

