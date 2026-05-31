from __future__ import annotations

import json
from typing import Any

import httpx

from backend.app.core.config import get_settings


class GeminiService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def is_configured(self) -> bool:
        return bool(self.settings.gemini_api_key)

    @property
    def active_provider(self) -> str:
        return "gemini" if self.is_configured else "mock"

    def extract_buyer_intent(self, message: str, language: str = "en") -> dict[str, Any]:
        prompt = f"""
You are the conversation agent for SmartSpace, an AI real-estate companion.
Analyze the buyer message and return only valid JSON.

Required JSON shape:
{{
  "intent": "property_search | seller_listing | document_analysis",
  "reply": "short professional reply for the user",
  "extracted_preferences": {{
    "city": "string or empty",
    "bhk": 0,
    "priority": "string or empty",
    "budget_min": 0,
    "budget_max": 0,
    "property_type": "string or empty",
    "purpose": "self_use | investment | empty"
  }},
  "next_actions": ["string", "string", "string"],
  "confidence": 0.0
}}

Rules:
- Keep reply concise and operational.
- If a field is unknown, use empty string or 0.
- Confidence must be between 0 and 1.
- Message language hint: {language}

Buyer message:
{message}
"""
        fallback = {
            "intent": "property_search",
            "reply": "I can help structure this requirement into a property shortlist.",
            "extracted_preferences": {
                "city": "",
                "bhk": 0,
                "priority": "",
                "budget_min": 0,
                "budget_max": 0,
                "property_type": "",
                "purpose": "",
            },
            "next_actions": ["Add budget range", "Share preferred localities", "Set commute anchor"],
            "confidence": 0.45,
        }
        result = self.generate_json(prompt, fallback)
        result["confidence"] = self._clamp_score(result.get("confidence", 0.45))
        result["extracted_preferences"] = result.get("extracted_preferences") or fallback[
            "extracted_preferences"
        ]
        result["next_actions"] = result.get("next_actions") or fallback["next_actions"]
        return result

    def score_match(self, requirement: dict[str, Any], property_payload: dict[str, Any]) -> dict[str, Any]:
        prompt = f"""
You are the matchmaker agent for SmartSpace.
Evaluate how well a property matches the buyer requirement.
Return only valid JSON.

Required JSON shape:
{{
  "score": 0.0,
  "rationale": "short explanation",
  "confidence": 0.0
}}

Scoring rules:
- Score must be between 0 and 1.
- Focus on city, budget fit, property type, bedroom fit, and locality preference.
- Keep rationale under 30 words.

Buyer requirement:
{json.dumps(requirement, ensure_ascii=True)}

Property facts:
{json.dumps(property_payload, ensure_ascii=True)}
"""
        fallback = {
            "score": 0.75,
            "rationale": "Reasonable fit for the current requirement set.",
            "confidence": 0.4,
        }
        result = self.generate_json(prompt, fallback)
        result["score"] = self._clamp_score(result.get("score", fallback["score"]))
        result["confidence"] = self._clamp_score(result.get("confidence", fallback["confidence"]))
        result["rationale"] = result.get("rationale") or fallback["rationale"]
        return result

    def score_spatial(self, commute_anchor: str | None, property_payload: dict[str, Any]) -> dict[str, Any]:
        prompt = f"""
You are the spatial intelligence agent for SmartSpace.
Evaluate spatial suitability using only the provided facts.
Return only valid JSON.

Required JSON shape:
{{
  "score": 0.0,
  "rationale": "short explanation",
  "confidence": 0.0
}}

Rules:
- Score must be between 0 and 1.
- Consider commute anchor, metro, school, hospital, gated amenities, and family utility.
- Keep rationale under 30 words.

Commute anchor:
{commute_anchor or ""}

Property facts:
{json.dumps(property_payload, ensure_ascii=True)}
"""
        fallback = {
            "score": 0.73,
            "rationale": "Solid spatial utility for a general family-oriented search.",
            "confidence": 0.4,
        }
        result = self.generate_json(prompt, fallback)
        result["score"] = self._clamp_score(result.get("score", fallback["score"]))
        result["confidence"] = self._clamp_score(result.get("confidence", fallback["confidence"]))
        result["rationale"] = result.get("rationale") or fallback["rationale"]
        return result

    def score_market(self, purpose: str, property_payload: dict[str, Any]) -> dict[str, Any]:
        prompt = f"""
You are the market intelligence agent for SmartSpace.
Evaluate market suitability from the supplied facts only.
Return only valid JSON.

Required JSON shape:
{{
  "score": 0.0,
  "rationale": "short explanation",
  "confidence": 0.0
}}

Rules:
- Score must be between 0 and 1.
- Consider price level, BHK, area, furnishing, stated purpose, and any rental/investment signals in amenities.
- Keep rationale under 30 words.

Buyer purpose:
{purpose}

Property facts:
{json.dumps(property_payload, ensure_ascii=True)}
"""
        fallback = {
            "score": 0.74,
            "rationale": "Pricing and layout are acceptable for early shortlist review.",
            "confidence": 0.4,
        }
        result = self.generate_json(prompt, fallback)
        result["score"] = self._clamp_score(result.get("score", fallback["score"]))
        result["confidence"] = self._clamp_score(result.get("confidence", fallback["confidence"]))
        result["rationale"] = result.get("rationale") or fallback["rationale"]
        return result

    def summarize_recommendations(
        self, requirement: dict[str, Any], shortlisted_properties: list[dict[str, Any]]
    ) -> dict[str, Any]:
        prompt = f"""
You are the recommendation composer agent for SmartSpace.
Summarize the shortlist for the buyer. Return only valid JSON.

Required JSON shape:
{{
  "query_summary": "one sentence summary",
  "market_summary": "one sentence market perspective",
  "next_actions": ["string", "string", "string"]
}}

Buyer requirement:
{json.dumps(requirement, ensure_ascii=True)}

Shortlisted properties:
{json.dumps(shortlisted_properties, ensure_ascii=True)}
"""
        fallback = {
            "query_summary": "Shortlisted properties aligned to the current buyer criteria.",
            "market_summary": "Use this shortlist as a guided screen before live market validation.",
            "next_actions": [
                "Add a more precise commute anchor",
                "Review tradeoffs across locality and price",
                "Upload visual references for preference matching",
            ],
        }
        result = self.generate_json(prompt, fallback)
        result["query_summary"] = result.get("query_summary") or fallback["query_summary"]
        result["market_summary"] = result.get("market_summary") or fallback["market_summary"]
        result["next_actions"] = result.get("next_actions") or fallback["next_actions"]
        return result

    def generate_json(self, prompt: str, fallback: dict[str, Any]) -> dict[str, Any]:
        if not self.is_configured:
            return fallback

        try:
            response = httpx.post(
                self._endpoint(),
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "responseMimeType": "application/json",
                        "temperature": 0.2,
                    },
                },
                timeout=45.0,
            )
            response.raise_for_status()
            payload = response.json()
            text = self._extract_text(payload)
            return json.loads(text)
        except Exception:
            return fallback

    def _endpoint(self) -> str:
        model = self.settings.gemini_model
        key = self.settings.gemini_api_key
        return f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

    def _extract_text(self, payload: dict[str, Any]) -> str:
        candidates = payload.get("candidates") or []
        if not candidates:
            raise ValueError("No Gemini candidates returned.")
        content = candidates[0].get("content") or {}
        parts = content.get("parts") or []
        if not parts or "text" not in parts[0]:
            raise ValueError("Gemini response did not contain text output.")
        return parts[0]["text"]

    def _clamp_score(self, value: Any) -> float:
        try:
            numeric = float(value)
        except (TypeError, ValueError):
            numeric = 0.0
        return max(0.0, min(1.0, round(numeric, 2)))
