import os
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/aqi", tags=["aqi"])

WAQI_TOKEN = os.getenv("WAQI_API_TOKEN")
transport = httpx.AsyncHTTPTransport(local_address="0.0.0.0")


def _distance(lat1, lon1, lat2, lon2):
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5


async def _try_direct(client: httpx.AsyncClient, lat: float, lon: float):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    resp = await client.get(url, params={"token": WAQI_TOKEN})
    data = resp.json()
    if data.get("status") == "ok":
        d = data["data"]
        return {
            "aqi": d.get("aqi"),
            "station": d.get("city", {}).get("name"),
            "lat": d.get("city", {}).get("geo", [lat, lon])[0],
            "lon": d.get("city", {}).get("geo", [lat, lon])[1],
            "updated_at": d.get("time", {}).get("s"),
            "dominant_pollutant": d.get("dominentpol"),
        }
    return None


async def _try_bounds(client: httpx.AsyncClient, lat: float, lon: float):
    # Single generous search box (~330km) instead of multiple staged radii
    radius = 3.0
    box = f"{lat - radius},{lon - radius},{lat + radius},{lon + radius}"
    url = "https://api.waqi.info/map/bounds/"
    resp = await client.get(url, params={"latlng": box, "token": WAQI_TOKEN})
    data = resp.json()
    if data.get("status") != "ok":
        return None

    candidates = [
        s for s in data.get("data", [])
        if str(s.get("aqi", "-")).lstrip("-").isdigit() and str(s.get("aqi")) != "-"
    ]
    if not candidates:
        return None

    best = min(candidates, key=lambda s: _distance(lat, lon, s["lat"], s["lon"]))
    return {
        "aqi": int(best["aqi"]),
        "station": best.get("station", {}).get("name", "Nearby station"),
        "lat": best["lat"],
        "lon": best["lon"],
        "updated_at": None,
        "dominant_pollutant": None,
    }


@router.get("/current")
async def current_aqi(lat: float = Query(...), lon: float = Query(...)):
    try:
        async with httpx.AsyncClient(timeout=8.0, transport=transport) as client:
            result = await _try_direct(client, lat, lon)
            if result:
                return result

            result = await _try_bounds(client, lat, lon)
            if result:
                return result

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AQI request timed out")

    raise HTTPException(status_code=502, detail="No AQI stations found near this location")