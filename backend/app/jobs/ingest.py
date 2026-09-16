import uuid
import logging
from datetime import datetime

import httpx
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Point

from app.core.database import SessionLocal
from app.models.models import City, AQIReading, WeatherData
from app.api.aqi import fetch_aqi_for_location

logger = logging.getLogger("ingest")


async def ingest_aqi():
    db = SessionLocal()
    try:
        cities = db.query(City).all()
        for city in cities:
            point = to_shape(city.location)
            try:
                result = await fetch_aqi_for_location(point.y, point.x)
                if result["aqi"] is None:
                    continue

                reading = AQIReading(
                    id=str(uuid.uuid4()),
                    city_id=city.id,
                    station_name=result["station"],
                    location=from_shape(Point(point.x, point.y), srid=4326),
                    aqi=result["aqi"],
                    recorded_at=datetime.utcnow(),
                    ingested_at=datetime.utcnow(),
                )
                db.add(reading)
                logger.info(f"Ingested AQI for {city.name}: {result['aqi']}")
            except Exception as e:
                logger.warning(f"AQI ingestion failed for {city.name}: {e}")
        db.commit()
    finally:
        db.close()


async def ingest_weather():
    db = SessionLocal()
    try:
        cities = db.query(City).all()
        async with httpx.AsyncClient(timeout=10.0) as client:
            for city in cities:
                point = to_shape(city.location)
                try:
                    resp = await client.get(
                        "https://api.open-meteo.com/v1/forecast",
                        params={
                            "latitude": point.y,
                            "longitude": point.x,
                            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation",
                        },
                    )
                    if resp.status_code != 200:
                        continue
                    current = resp.json().get("current", {})
                    if not current:
                        continue

                    weather = WeatherData(
                        id=str(uuid.uuid4()),
                        city_id=city.id,
                        location=from_shape(Point(point.x, point.y), srid=4326),
                        temperature_c=current.get("temperature_2m"),
                        humidity_pct=current.get("relative_humidity_2m"),
                        wind_speed_kmh=current.get("wind_speed_10m"),
                        wind_direction_deg=current.get("wind_direction_10m"),
                        precipitation_mm=current.get("precipitation"),
                        recorded_at=datetime.utcnow(),
                        ingested_at=datetime.utcnow(),
                    )
                    db.add(weather)
                    logger.info(f"Ingested weather for {city.name}")
                except Exception as e:
                    logger.warning(f"Weather ingestion failed for {city.name}: {e}")
        db.commit()
    finally:
        db.close()


async def ingest_satellite():
    """Stub — requires a NASA FIRMS API key. Wire this in later when convenient."""
    logger.info("Satellite ingestion skipped (no FIRMS key configured).")


async def run_all_ingestion():
    await ingest_aqi()
    await ingest_weather()
    await ingest_satellite()