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

_cached_model_name = None


def _pick_available_model():
    global _cached_model_name
    if _cached_model_name:
        return _cached_model_name
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods and "flash" in m.name.lower():
            _cached_model_name = m.name
            return m.name
    for m in genai.list_models():
        if "generateContent" in m.supported_generation_methods:
            _cached_model_name = m.name
            return m.name
    raise RuntimeError("No usable Gemini model found for this API key")


@router.get("/briefing")
async def briefing(lat: float = Query(...), lon: float = Query(...), db: Session = Depends(get_db)):
    history = aqi_history(lat=lat, lon=lon, db=db)
    if not history.get("available") or not history.get("city_id"):
        return {"available": False, "text": "Not enough data yet for an AI briefing."}

    city_id = history["city_id"]
    hotspots = ai_hotspots(db=db)
    attribution = get_attribution(city_id, db=db)
    prediction = predict_spike(city_id, db=db)

    if not GEMINI_KEY:
        return {
            "available": True,
            "text": (
                f"Current probable cause: {attribution['probable_cause']}. "
                f"Trend: {prediction.get('trend_per_reading', 'N/A')} per reading. "
                f"{'A statistical hotspot was detected nearby.' if any(h['city'] == history['city_name'] for h in hotspots['hotspots']) else 'No statistical anomaly detected nearby.'}"
            ),
            "source": "rule-based (Gemini key not configured)",
        }

    is_hotspot = any(h["city"] == history["city_name"] for h in hotspots["hotspots"])

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
        model_name = await asyncio.to_thread(_pick_available_model)
        model = genai.GenerativeModel(model_name)
        response = await asyncio.to_thread(model.generate_content, prompt)
        text = response.text.strip()
    except Exception as e:
        text = f"AI briefing unavailable right now ({str(e)[:80]})."

    return {"available": True, "text": text, "source": "gemini"}