from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import WeatherData, Report

router = APIRouter(prefix="/attribution", tags=["attribution"])

BURN_KEYWORDS = ["burn", "fire", "smoke", "stubble"]
DUST_KEYWORDS = ["dust", "construction", "demolition"]
TRAFFIC_KEYWORDS = ["traffic", "vehicle", "exhaust", "congestion"]


@router.get("/{city_id}")
def get_attribution(city_id: str, db: Session = Depends(get_db)):
    weather = (
        db.query(WeatherData)
        .filter(WeatherData.city_id == city_id)
        .order_by(WeatherData.recorded_at.desc())
        .first()
    )
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(20).all()

    scores = {"burning": 0, "dust": 0, "traffic": 0, "industry": 0}
    for r in reports:
        text = (r.description or "").lower()
        if any(k in text for k in BURN_KEYWORDS):
            scores["burning"] += 1
        if any(k in text for k in DUST_KEYWORDS):
            scores["dust"] += 1
        if any(k in text for k in TRAFFIC_KEYWORDS):
            scores["traffic"] += 1

    if weather and weather.wind_speed_kmh and weather.wind_speed_kmh < 5:
        scores["traffic"] += 1  # low wind lets local traffic pollution accumulate

    if not any(scores.values()):
        probable_cause = "unknown"
    else:
        probable_cause = max(scores, key=scores.get)

    explanation = f"Based on {len(reports)} recent citizen reports and current wind conditions, {probable_cause} is the most likely contributing factor."

    return {"probable_cause": probable_cause, "scores": scores, "explanation": explanation}