import os
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/aqi", tags=["aqi"])

WAQI_TOKEN = os.getenv("WAQI_API_TOKEN")

# Force IPv4 — avoids slow IPv6-then-fallback delays on some Windows networks
transport = httpx.AsyncHTTPTransport(local_address="0.0.0.0")


@router.get("/current")
async def current_aqi(lat: float = Query(...), lon: float = Query(...)):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    try:
        async with httpx.AsyncClient(timeout=15.0, transport=transport) as client:
            resp = await client.get(url, params={"token": WAQI_TOKEN})
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="WAQI request timed out")

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