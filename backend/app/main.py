from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.router import api_router
from backend.app.core.config import get_settings
from backend.app.db.session import initialize_database


settings = get_settings()

app = FastAPI(
    title="SmartSpace API",
    version="0.1.0",
    description="Backend API for the SmartSpace real-estate companion.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    initialize_database()


@app.get("/", tags=["system"])
def root() -> dict[str, str]:
    return {"message": "SmartSpace API is running"}


app.include_router(api_router, prefix="/api")

