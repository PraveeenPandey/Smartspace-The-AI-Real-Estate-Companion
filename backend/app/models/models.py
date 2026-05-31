from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    role: Mapped[str] = mapped_column(String(40), default="buyer")
    preferred_language: Mapped[str] = mapped_column(String(20), default="en")


class SessionRecord(TimestampMixin, Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="active")
    workflow_stage: Mapped[str] = mapped_column(String(80), default="property_discovery")


class Message(TimestampMixin, Base):
    __tablename__ = "messages"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int | None] = mapped_column(ForeignKey("sessions.id"), nullable=True)
    sender_type: Mapped[str] = mapped_column(String(20))
    message_type: Mapped[str] = mapped_column(String(20), default="text")
    content_text: Mapped[str] = mapped_column(Text)
    translated_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    media_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    extracted_entities: Mapped[dict] = mapped_column(JSON, default=dict)


class Property(TimestampMixin, Base):
    __tablename__ = "properties"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    city: Mapped[str] = mapped_column(String(120), index=True)
    locality: Mapped[str] = mapped_column(String(120), index=True)
    address: Mapped[str] = mapped_column(String(255))
    lat: Mapped[float] = mapped_column(Float)
    lng: Mapped[float] = mapped_column(Float)
    property_type: Mapped[str] = mapped_column(String(40), index=True)
    bhk: Mapped[int] = mapped_column(Integer, index=True)
    bathrooms: Mapped[int] = mapped_column(Integer)
    area_sqft: Mapped[int] = mapped_column(Integer)
    price: Mapped[float] = mapped_column(Float, index=True)
    furnishing: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(40), default="active")
    amenities: Mapped[dict] = mapped_column(JSON, default=dict)
    features_embedding: Mapped[list[float] | None] = mapped_column(JSON, nullable=True)

    media: Mapped[list["PropertyMedia"]] = relationship(back_populates="property")


class PropertyMedia(TimestampMixin, Base):
    __tablename__ = "property_media"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"))
    media_type: Mapped[str] = mapped_column(String(20), default="image")
    file_url: Mapped[str] = mapped_column(String(500))

    property: Mapped[Property] = relationship(back_populates="media")


class UserPreference(TimestampMixin, Base):
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    city: Mapped[str] = mapped_column(String(120))
    budget_min: Mapped[float] = mapped_column(Float)
    budget_max: Mapped[float] = mapped_column(Float)
    preferred_localities: Mapped[list[str]] = mapped_column(JSON, default=list)
    property_type: Mapped[str] = mapped_column(String(40))
    bhk: Mapped[int] = mapped_column(Integer)
    purpose: Mapped[str] = mapped_column(String(40), default="self_use")
    language: Mapped[str] = mapped_column(String(20), default="en")
    commute_anchor_text: Mapped[str | None] = mapped_column(String(255), nullable=True)
    commute_anchor_lat: Mapped[float | None] = mapped_column(Float, nullable=True)
    commute_anchor_lng: Mapped[float | None] = mapped_column(Float, nullable=True)
    preferences_embedding: Mapped[list[float] | None] = mapped_column(JSON, nullable=True)


class RecommendationRun(Base):
    __tablename__ = "recommendation_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int | None] = mapped_column(ForeignKey("sessions.id"), nullable=True)
    query_json: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class RecommendationResult(Base):
    __tablename__ = "recommendation_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("recommendation_runs.id"))
    property_id: Mapped[int] = mapped_column(ForeignKey("properties.id"))
    match_score: Mapped[float] = mapped_column(Float)
    spatial_score: Mapped[float] = mapped_column(Float)
    market_score: Mapped[float] = mapped_column(Float)
    final_score: Mapped[float] = mapped_column(Float)
    reason_json: Mapped[dict] = mapped_column(JSON, default=dict)


class Document(TimestampMixin, Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    property_id: Mapped[int | None] = mapped_column(ForeignKey("properties.id"), nullable=True)
    document_type: Mapped[str] = mapped_column(String(80))
    file_url: Mapped[str] = mapped_column(String(500))
    ocr_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_fields: Mapped[dict] = mapped_column(JSON, default=dict)
    review_status: Mapped[str] = mapped_column(String(40), default="pending")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int | None] = mapped_column(ForeignKey("sessions.id"), nullable=True)
    agent_name: Mapped[str] = mapped_column(String(80))
    input_json: Mapped[dict] = mapped_column(JSON, default=dict)
    output_json: Mapped[dict] = mapped_column(JSON, default=dict)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    latency_ms: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(40), default="completed")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
