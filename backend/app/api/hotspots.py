from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
from app.core.database import get_db
from app.models.models import AQIReading, City

router = APIRouter(prefix="/hotspots", tags=["hotspots"])

THRESHOLD = 150  # AQI above this counts as a hotspot
CLUSTER_RADIUS_KM = 60


def _dist_km(lat1, lon1, lat2, lon2):
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5 * 111


@router.get("")
def get_hotspots(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    latest = {}
    for city in cities:
        reading = (
            db.query(AQIReading)
            .filter(AQIReading.city_id == city.id)
            .order_by(AQIReading.recorded_at.desc())
            .first()
        )
        if reading and reading.aqi >= THRESHOLD:
            point = to_shape(city.location)
            latest[city.id] = {"city": city.name, "aqi": reading.aqi, "lat": point.y, "lon": point.x}

    points = list(latest.values())
    clusters = []
    used = set()
    for i, p in enumerate(points):
        if i in used:
            continue
        cluster = [p]
        used.add(i)
        for j, q in enumerate(points):
            if j in used:
                continue
            if _dist_km(p["lat"], p["lon"], q["lat"], q["lon"]) <= CLUSTER_RADIUS_KM:
                cluster.append(q)
                used.add(j)
        avg_lat = sum(c["lat"] for c in cluster) / len(cluster)
        avg_lon = sum(c["lon"] for c in cluster) / len(cluster)
        max_aqi = max(c["aqi"] for c in cluster)
        clusters.append({
            "cities": [c["city"] for c in cluster],
            "lat": avg_lat, "lon": avg_lon,
            "max_aqi": max_aqi, "severity": "severe" if max_aqi >= 300 else "high",
        })
    return {"threshold": THRESHOLD, "hotspots": clusters}