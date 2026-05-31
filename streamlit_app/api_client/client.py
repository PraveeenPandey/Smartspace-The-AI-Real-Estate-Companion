from __future__ import annotations

import os

import httpx


API_BASE_URL = os.getenv("SMARTSPACE_API_BASE_URL", "http://localhost:8000/api")


class SmartSpaceApiClient:
    def __init__(self, base_url: str = API_BASE_URL) -> None:
        self.base_url = base_url.rstrip("/")

    def send_chat_message(self, payload: dict) -> dict:
        return self._post("/chat/message", payload)

    def search_recommendations(self, payload: dict) -> dict:
        return self._post("/recommendations/search", payload)

    def create_listing(self, payload: dict) -> dict:
        return self._post("/listings/create", payload)

    def analyze_document(self, payload: dict) -> dict:
        return self._post("/documents/analyze", payload)

    def get_session_detail(self, session_id: int) -> dict:
        return self._get(f"/chat/sessions/{session_id}")

    def get_admin_overview(self) -> dict:
        return self._get("/admin/overview")

    def _post(self, path: str, payload: dict) -> dict:
        with httpx.Client(timeout=20.0) as client:
            response = client.post(f"{self.base_url}{path}", json=payload)
            response.raise_for_status()
            return response.json()

    def _get(self, path: str) -> dict:
        with httpx.Client(timeout=20.0) as client:
            response = client.get(f"{self.base_url}{path}")
            response.raise_for_status()
            return response.json()
