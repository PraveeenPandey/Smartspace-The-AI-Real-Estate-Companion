from backend.app.agents.base import BaseAgent
from backend.app.models.models import Property


class MarketIntelligenceAgent(BaseAgent):
    agent_name = "market_intelligence_agent"

    def score_property(self, property_item: Property, purpose: str) -> tuple[float, str]:
        investment_bonus = 0.08 if purpose == "investment" and property_item.price < 10000000 else 0.04
        family_bonus = 0.07 if purpose == "self_use" and property_item.bhk >= 3 else 0.03
        score = round(0.7 + investment_bonus + family_bonus, 2)
        if purpose == "investment":
            note = "Favorable entry price for early investment screening."
        else:
            note = "Price aligns reasonably for family-use shortlist screening."
        return score, note

