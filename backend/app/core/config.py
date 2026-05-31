from functools import lru_cache

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="SMARTSPACE_", extra="ignore")

    environment: str = "development"
    debug: bool = True
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    ui_port: int = 8501
    database_url: str = "sqlite:///./smartspace.db"
    allowed_origins: str = "http://localhost:8501,http://127.0.0.1:8501"
    llm_provider: str = "mock"
    gemini_model: str = "gemini-2.5-flash"
    gemini_api_key: str | None = None

    @computed_field
    @property
    def allowed_origins_list(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
