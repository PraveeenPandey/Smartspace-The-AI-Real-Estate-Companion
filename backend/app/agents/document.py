from backend.app.agents.base import BaseAgent


class DocumentAgent(BaseAgent):
    agent_name = "document_agent"

    def run(self, payload: dict) -> dict:
        raw_text = payload.get("raw_text") or ""
        requires_human_review = len(raw_text.strip()) < 80
        extracted_fields = {
            "document_type": payload["document_type"],
            "owner_name_present": "owner" in raw_text.lower(),
            "property_reference_present": "property" in raw_text.lower(),
        }
        return {
            "summary": (
                "This is a scaffolded document summary. Replace with OCR + structured extraction "
                "once the document pipeline is connected."
            ),
            "extracted_fields": extracted_fields,
            "missing_items": ["signed_pages", "registration_number"] if requires_human_review else [],
            "confidence": 0.52 if requires_human_review else 0.81,
            "requires_human_review": requires_human_review,
        }
