from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.core.database import get_db
from app.models.models import City, AQIReading, Report
from app.api.hotspots import get_hotspots

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def get_alerts(db: Session = Depends(get_db)):
    alerts = []

    hotspot_data = get_hotspots(db)
    for h in hotspot_data["hotspots"]:
        alerts.append({
            "id": f"hotspot-{'-'.join(h['cities'])}",
            "category": "air_quality",
            "severity": "high" if h["severity"] == "severe" else "moderate",
            "title": "High Pollution Alert",
            "message": f"AQI reached {h['max_aqi']} near {', '.join(h['cities'])}. Limit outdoor activities.",
        })

    cities = db.query(City).all()
    for city in cities:
        readings = (
            db.query(AQIReading)
            .filter(AQIReading.city_id == city.id)
            .order_by(AQIReading.recorded_at.desc())
            .limit(2)
            .all()
        )
        if len(readings) == 2 and readings[1].aqi > 0:
            change = readings[0].aqi - readings[1].aqi
            if change <= -20:
                alerts.append({
                    "id": f"improving-{city.id}",
                    "category": "air_quality",
                    "severity": "good",
                    "title": "Air Quality Improving",
                    "message": f"AQI in {city.name} dropped by {abs(change)} points. Expected to remain favorable.",
                })

    recent_reports = db.query(Report).order_by(Report.created_at.desc()).limit(5).all()
    for r in recent_reports:
        alerts.append({
            "id": f"report-{r.id}",
            "category": "reports",
            "severity": "info",
            "title": "New Report Nearby",
            "message": r.description or "A pollution event was reported nearby. Under verification.",
        })

    return {"alerts": alerts}