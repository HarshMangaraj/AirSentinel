from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import AQIReading, City

router = APIRouter(prefix="/predict", tags=["predictions"])


@router.get("/spike/{city_id}")
def predict_spike(city_id: str, db: Session = Depends(get_db)):
    readings = (
        db.query(AQIReading)
        .filter(AQIReading.city_id == city_id)
        .order_by(AQIReading.recorded_at.desc())
        .limit(10)
        .all()
    )
    if len(readings) < 3:
        return {"prediction": "insufficient_data"}

    values = [r.aqi for r in reversed(readings)]
    # simple linear trend: average delta between consecutive readings
    deltas = [values[i + 1] - values[i] for i in range(len(values) - 1)]
    avg_delta = sum(deltas) / len(deltas)
    current = values[-1]
    forecast_next = round(current + avg_delta)

    spike_warning = avg_delta > 5 and forecast_next >= 150

    return {
        "current_aqi": current,
        "trend_per_reading": round(avg_delta, 1),
        "forecast_next_reading": forecast_next,
        "spike_warning": spike_warning,
    }