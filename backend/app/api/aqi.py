import os
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/aqi", tags=["aqi"])

WAQI_TOKEN = os.getenv("WAQI_API_TOKEN")


@router.get("/current")
async def current_aqi(lat: float = Query(...), lon: float = Query(...)):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params={"token": WAQI_TOKEN})

    data = resp.json()
    if data.get("status") != "ok":
        raise HTTPException(status_code=502, detail="AQI data unavailable for this location")

    d = data["data"]
    return {
        "aqi": d.get("aqi"),
        "station": d.get("city", {}).get("name"),
        "lat": d.get("city", {}).get("geo", [lat, lon])[0],
        "lon": d.get("city", {}).get("geo", [lat, lon])[1],
        "updated_at": d.get("time", {}).get("s"),
        "dominant_pollutant": d.get("dominentpol"),
    }