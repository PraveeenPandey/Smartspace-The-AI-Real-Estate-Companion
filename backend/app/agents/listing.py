from backend.app.agents.base import BaseAgent


class ListingCopilotAgent(BaseAgent):
    agent_name = "listing_copilot_agent"

    def run(self, payload: dict) -> dict:
        return {
            "generated_title": f"{payload['bhk']} BHK in {payload['locality']} with strong family appeal",
            "generated_description": (
                f"Located in {payload['locality']}, this {payload['area_sqft']} sqft "
                f"{payload['property_type']} is positioned for buyers seeking {payload['furnishing']} comfort."
            ),
            "pricing_guidance": (
                "Current guidance is rule-based. Add locality comps before surfacing this externally."
            ),
            "missing_fields": ["latitude", "longitude", "property_images"],
            "confidence": 0.74,
        }

