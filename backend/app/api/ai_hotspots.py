from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from geoalchemy2.shape import to_shape
import numpy as np

from app.core.database import get_db
from app.models.models import City, AQIReading

router = APIRouter(prefix="/hotspots", tags=["hotspots"])


@router.get("/ai")
def ai_hotspots(db: Session = Depends(get_db)):
    cities = db.query(City).all()
    data = []
    for city in cities:
        reading = (
            db.query(AQIReading)
            .filter(AQIReading.city_id == city.id)
            .order_by(AQIReading.recorded_at.desc())
            .first()
        )
        if reading:
            point = to_shape(city.location)
            data.append({"city": city.name, "city_id": city.id, "aqi": reading.aqi, "lat": point.y, "lon": point.x})

    if len(data) < 4:
        return {"available": False, "reason": "Not enough cities with data yet.", "hotspots": []}

    values = np.array([d["aqi"] for d in data], dtype=float)
    mean = values.mean()
    std = values.std()

    if std == 0:
        return {"available": True, "method": "zscore", "hotspots": []}

    results = []
    for d in data:
        z = (d["aqi"] - mean) / std
        # A city meaningfully above the current average AND polluted in absolute terms
        if z >= 1.0 and d["aqi"] >= 100:
            results.append({
                "city": d["city"],
                "city_id": d["city_id"],
                "aqi": d["aqi"],
                "lat": d["lat"],
                "lon": d["lon"],
                "anomaly_score": round(float(z), 2),
            })

    results.sort(key=lambda r: r["anomaly_score"], reverse=True)

    return {
        "available": True,
        "method": "zscore",
        "baseline_mean_aqi": round(float(mean), 1),
        "hotspots": results,
    }