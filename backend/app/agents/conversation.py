from backend.app.agents.base import BaseAgent


class ConversationAgent(BaseAgent):
    agent_name = "conversation_agent"

    def run(self, payload: dict) -> dict:
        message = payload["message"].lower()
        if "sell" in message or "listing" in message:
            intent = "seller_listing"
        elif "document" in message or "agreement" in message:
            intent = "document_analysis"
        else:
            intent = "property_search"

        preferences = {}
        if "bangalore" in message:
            preferences["city"] = "Bangalore"
        if "3 bhk" in message or "3bhk" in message:
            preferences["bhk"] = 3
        if "2 bhk" in message or "2bhk" in message:
            preferences["bhk"] = 2
        if "metro" in message:
            preferences["priority"] = "metro_access"

        if intent == "seller_listing":
            reply = "I can help turn your property details into a production-ready listing draft."
            next_actions = ["Share property details", "Upload 3 to 5 property images"]
        elif intent == "document_analysis":
            reply = "Upload the document text or file reference and I will extract the key fields to review."
            next_actions = ["Provide OCR text", "Select document type"]
        else:
            city = preferences.get("city", "your target city")
            reply = f"I can shortlist properties in {city}. Add budget, BHK, and preferred locality next."
            next_actions = ["Add budget range", "Share preferred localities", "Set commute anchor"]

        return {
            "intent": intent,
            "reply": reply,
            "extracted_preferences": preferences,
            "next_actions": next_actions,
            "confidence": 0.81,
        }

