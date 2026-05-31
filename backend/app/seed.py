from __future__ import annotations

import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.app.models.models import Property, PropertyMedia


DATASET_PATH = Path(__file__).resolve().parents[1] / "data" / "sample_properties.json"


def seed_properties(session: Session) -> None:
    dataset = json.loads(DATASET_PATH.read_text(encoding="utf-8"))

    for record in dataset:
        property_record = session.scalar(
            select(Property).where(
                Property.title == record["title"],
                Property.address == record["address"],
            )
        )
        if property_record is None:
            property_record = Property(
                title=record["title"],
                description=record["description"],
                city=record["city"],
                locality=record["locality"],
                address=record["address"],
                lat=record["lat"],
                lng=record["lng"],
                property_type=record["property_type"],
                bhk=record["bhk"],
                bathrooms=record["bathrooms"],
                area_sqft=record["area_sqft"],
                price=record["price"],
                furnishing=record["furnishing"],
                status=record.get("status", "active"),
                amenities=record.get("amenities", {}),
                features_embedding=record.get("features_embedding"),
            )
            session.add(property_record)
            session.flush()
        else:
            property_record.description = record["description"]
            property_record.city = record["city"]
            property_record.locality = record["locality"]
            property_record.lat = record["lat"]
            property_record.lng = record["lng"]
            property_record.property_type = record["property_type"]
            property_record.bhk = record["bhk"]
            property_record.bathrooms = record["bathrooms"]
            property_record.area_sqft = record["area_sqft"]
            property_record.price = record["price"]
            property_record.furnishing = record["furnishing"]
            property_record.status = record.get("status", "active")
            property_record.amenities = record.get("amenities", {})
            property_record.features_embedding = record.get("features_embedding")

        existing_media = {
            media.file_url
            for media in session.scalars(
                select(PropertyMedia).where(PropertyMedia.property_id == property_record.id)
            ).all()
        }
        for file_url in record.get("media_urls", []):
            if file_url not in existing_media:
                session.add(PropertyMedia(property_id=property_record.id, file_url=file_url))

    session.commit()
