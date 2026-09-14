import uuid
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    DateTime,
    ForeignKey,
    Text,
    Enum,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from app.core.database import Base


def gen_uuid():
    return str(uuid.uuid4())


class City(Base):
    __tablename__ = "cities"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    name = Column(String, nullable=False)
    state = Column(String, nullable=False)
    country = Column(String, nullable=False, default="India")
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="city")
    aqi_readings = relationship("AQIReading", back_populates="city")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(Enum("citizen", "admin", name="user_role"), default="citizen", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="user")


class Report(Base):
    """Citizen-submitted pollution event report."""
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    user_id = Column(UUID(as_uuid=False), ForeignKey("users.id"), nullable=False)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=True)

    description = Column(Text, nullable=True)
    media_url = Column(String, nullable=True)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    status = Column(
        Enum("pending", "reviewed", "verified", "dismissed", name="report_status"),
        default="pending",
        nullable=False,
    )
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")
    city = relationship("City", back_populates="reports")


class AQIReading(Base):
    """Reading from a public/official AQI monitoring station."""
    __tablename__ = "aqi_readings"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=True)

    station_name = Column(String, nullable=True)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    aqi = Column(Integer, nullable=False)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)

    recorded_at = Column(DateTime, nullable=False)
    ingested_at = Column(DateTime, default=datetime.utcnow)

    city = relationship("City", back_populates="aqi_readings")


class SatelliteEvent(Base):
    """Fire/hotspot/aerosol event pulled from public satellite products."""
    __tablename__ = "satellite_events"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    source = Column(String, nullable=False)
    event_type = Column(String, nullable=False)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    confidence = Column(Float, nullable=True)
    intensity = Column(Float, nullable=True)

    detected_at = Column(DateTime, nullable=False)
    ingested_at = Column(DateTime, default=datetime.utcnow)


class WeatherData(Base):
    """Weather snapshot used for prediction/attribution."""
    __tablename__ = "weather_data"

    id = Column(UUID(as_uuid=False), primary_key=True, default=gen_uuid)
    city_id = Column(UUID(as_uuid=False), ForeignKey("cities.id"), nullable=True)
    location = Column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    temperature_c = Column(Float, nullable=True)
    humidity_pct = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    wind_direction_deg = Column(Float, nullable=True)
    precipitation_mm = Column(Float, nullable=True)

    recorded_at = Column(DateTime, nullable=False)
    ingested_at = Column(DateTime, default=datetime.utcnow)