import os
import asyncio
import google.generativeai as genai
from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.ai_hotspots import ai_hotspots
from app.api.attribution import get_attribution
from app.api.predictions import predict_spike
from app.api.history import aqi_history

router = APIRouter(prefix="/intelligence", tags=["intelligence"])

GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# Tried in order; first one that actually succeeds is used and cached.
CANDIDATE_MODELS = [
    "gemini-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-pro-latest",
    "gemini-1.5-pro",
]

_working_model_name = None


def _generate_with_fallback(prompt: str) -> str:
    global _working_model_name
    if _working_model_name:
        try:
            model = genai.GenerativeModel(_working_model_name)
            return model.generate_content(prompt).text.strip()
        except Exception:
            _working_model_name = None  # cached one stopped working, re-discover

    last_error = None
    for name in CANDIDATE_MODELS:
        try:
            model = genai.GenerativeModel(name)
            result = model.generate_content(prompt).text.strip()
            _working_model_name = name
            return result
        except Exception as e:
            last_error = e
            continue
    raise last_error or RuntimeError("No Gemini model available")


@router.get("/briefing")
async def briefing(lat: float = Query(...), lon: float = Query(...), db: Session = Depends(get_db)):
    history = aqi_history(lat=lat, lon=lon, db=db)
    if not history.get("available") or not history.get("city_id"):
        return {"available": False, "text": "Not enough data yet for an AI briefing."}

    city_id = history["city_id"]
    hotspots = ai_hotspots(db=db)
    attribution = get_attribution(city_id, db=db)
    prediction = predict_spike(city_id, db=db)
    is_hotspot = any(h["city"] == history["city_name"] for h in hotspots["hotspots"])

    if not GEMINI_KEY:
        return {
            "available": True,
            "text": (
                f"Current probable cause: {attribution['probable_cause']}. "
                f"Trend: {prediction.get('trend_per_reading', 'N/A')} per reading. "
                f"{'A statistical hotspot was detected nearby.' if is_hotspot else 'No statistical anomaly detected nearby.'}"
            ),
            "source": "rule-based (Gemini key not configured)",
        }

    prompt = f"""You are an air-quality analyst writing a short, plain-language briefing for a citizen app.
Do not invent numbers. Use only the facts given below. Write 2-3 short sentences, no headers, no bullet points.

City: {history['city_name']}
Recent AQI trend per reading: {prediction.get('trend_per_reading', 'unknown')}
Forecast next reading: {prediction.get('forecast_next_reading', 'unknown')}
Spike warning: {prediction.get('spike_warning', False)}
Statistical hotspot detected here: {is_hotspot}
Probable pollution cause (rule-based on citizen reports + wind): {attribution['probable_cause']}
"""

    try:
        text = await asyncio.to_thread(_generate_with_fallback, prompt)
        return {"available": True, "text": text, "source": _working_model_name}
    except Exception as e:
        return {"available": True, "text": f"AI briefing unavailable right now ({str(e)[:100]}).", "source": "error"}