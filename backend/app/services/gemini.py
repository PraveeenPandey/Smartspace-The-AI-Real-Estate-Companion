from backend.app.core.config import get_settings


class GeminiService:
    def __init__(self) -> None:
        self.settings = get_settings()

    @property
    def is_configured(self) -> bool:
        return bool(self.settings.gemini_api_key) and self.settings.llm_provider == "gemini"

    def summarize(self, prompt: str) -> str:
        if not self.is_configured:
            return (
                "Gemini is not configured yet. Running in mock mode with production-shaped fallback."
            )
        return f"Gemini summary placeholder for prompt: {prompt[:120]}"

