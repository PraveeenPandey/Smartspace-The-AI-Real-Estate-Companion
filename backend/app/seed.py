from sqlalchemy.orm import Session

from backend.app.models.models import Property, PropertyMedia


def seed_properties(session: Session) -> None:
    sample_properties = [
        Property(
            title="3 BHK Family Apartment near Whitefield Metro",
            description="Large family-ready apartment with clubhouse access and metro connectivity.",
            city="Bangalore",
            locality="Whitefield",
            address="ECC Road, Whitefield",
            lat=12.9698,
            lng=77.7499,
            property_type="apartment",
            bhk=3,
            bathrooms=3,
            area_sqft=1680,
            price=14500000,
            furnishing="semi-furnished",
            amenities={"metro": True, "school": True, "clubhouse": True},
            features_embedding=[0.2, 0.1, 0.4, 0.8, 0.3, 0.6, 0.5, 0.1],
        ),
        Property(
            title="2 BHK Investment Apartment in Sarjapur",
            description="Strong rental pocket with good school access and tech corridor demand.",
            city="Bangalore",
            locality="Sarjapur Road",
            address="Kasavanahalli, Sarjapur Road",
            lat=12.9008,
            lng=77.6846,
            property_type="apartment",
            bhk=2,
            bathrooms=2,
            area_sqft=1240,
            price=9800000,
            furnishing="unfurnished",
            amenities={"school": True, "rental_demand": True},
            features_embedding=[0.4, 0.5, 0.2, 0.6, 0.2, 0.7, 0.1, 0.4],
        ),
        Property(
            title="3 BHK Premium Apartment in Indirapuram",
            description="Well-connected gated community with strong family living amenities.",
            city="Noida",
            locality="Indirapuram",
            address="Nyay Khand, Indirapuram",
            lat=28.6443,
            lng=77.3693,
            property_type="apartment",
            bhk=3,
            bathrooms=3,
            area_sqft=1725,
            price=13200000,
            furnishing="furnished",
            amenities={"school": True, "hospital": True, "gated": True},
            features_embedding=[0.3, 0.2, 0.5, 0.7, 0.4, 0.5, 0.2, 0.3],
        ),
    ]
    session.add_all(sample_properties)
    session.flush()

    media = [
        PropertyMedia(property_id=sample_properties[0].id, file_url="https://example.com/p1.jpg"),
        PropertyMedia(property_id=sample_properties[1].id, file_url="https://example.com/p2.jpg"),
        PropertyMedia(property_id=sample_properties[2].id, file_url="https://example.com/p3.jpg"),
    ]
    session.add_all(media)
    session.commit()

