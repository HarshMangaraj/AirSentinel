from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
from app.core.database import get_db
from app.models.models import City, AQIReading

router = APIRouter(prefix="/aqi", tags=["aqi"])


def _distance_km(lat1, lon1, lat2, lon2):
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5 * 111


@router.get("/history")
def aqi_history(lat: float = Query(...), lon: float = Query(...), db: Session = Depends(get_db)):
    cities = db.query(City).all()
    nearest = None
    nearest_dist = None
    for c in cities:
        point = to_shape(c.location)
        dist = _distance_km(lat, lon, point.y, point.x)
        if nearest_dist is None or dist < nearest_dist:
            nearest_dist = dist
            nearest = c

    if not nearest or nearest_dist > 50:
        return {"available": False, "readings": []}

    readings = (
        db.query(AQIReading)
        .filter(AQIReading.city_id == nearest.id)
        .order_by(AQIReading.recorded_at.desc())
        .limit(20)
        .all()
    )
    readings = list(reversed(readings))

    return {
        "available": len(readings) > 0,
        "city_id": nearest.id,
        "city_name": nearest.name,
        "readings": [
            {"aqi": r.aqi, "recorded_at": r.recorded_at.isoformat() if r.recorded_at else None}
            for r in readings
        ],
    }