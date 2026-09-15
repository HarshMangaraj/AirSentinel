import os
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/aqi", tags=["aqi"])

WAQI_TOKEN = os.getenv("WAQI_API_TOKEN")
transport = httpx.AsyncHTTPTransport(local_address="0.0.0.0")

# Hard cutoff: never present a reading from further than this as if it applies
# to the searched location. Better to say "unavailable" than mislead.
MAX_DISTANCE_KM = 100


def _distance_km(lat1, lon1, lat2, lon2):
    # Rough but good-enough conversion for short/medium distances in India's latitude band
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5 * 111


async def _try_direct(client: httpx.AsyncClient, lat: float, lon: float):
    url = f"https://api.waqi.info/feed/geo:{lat};{lon}/"
    resp = await client.get(url, params={"token": WAQI_TOKEN})
    data = resp.json()
    if data.get("status") == "ok":
        d = data["data"]
        geo = d.get("city", {}).get("geo", [lat, lon])
        dist = _distance_km(lat, lon, geo[0], geo[1])
        if dist > MAX_DISTANCE_KM:
            return None
        return {
            "aqi": d.get("aqi"),
            "station": d.get("city", {}).get("name"),
            "lat": geo[0],
            "lon": geo[1],
            "updated_at": d.get("time", {}).get("s"),
            "dominant_pollutant": d.get("dominentpol"),
            "distance_km": round(dist),
        }
    return None


async def _try_bounds(client: httpx.AsyncClient, lat: float, lon: float, radius: float):
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

    scored = [
        (s, _distance_km(lat, lon, s["lat"], s["lon"]))
        for s in candidates
    ]
    scored = [pair for pair in scored if pair[1] <= MAX_DISTANCE_KM]
    if not scored:
        return None

    best, dist_km = min(scored, key=lambda pair: pair[1])
    return {
        "aqi": int(best["aqi"]),
        "station": best.get("station", {}).get("name", "Nearby station"),
        "lat": best["lat"],
        "lon": best["lon"],
        "updated_at": best.get("station", {}).get("time"),
        "dominant_pollutant": None,
        "distance_km": round(dist_km),
    }


@router.get("/current")
async def current_aqi(
    lat: float = Query(...),
    lon: float = Query(...),
    place: str | None = Query(None),
):
    try:
        async with httpx.AsyncClient(timeout=8.0, transport=transport) as client:
            result = await _try_direct(client, lat, lon)
            if result:
                return result

            for radius in (1.0, 2.5):  # ~110km, ~275km search box, still filtered by MAX_DISTANCE_KM
                result = await _try_bounds(client, lat, lon, radius)
                if result:
                    return result

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AQI request timed out")

    raise HTTPException(
        status_code=502,
        detail=f"No AQI station within {MAX_DISTANCE_KM}km of this location",
    )