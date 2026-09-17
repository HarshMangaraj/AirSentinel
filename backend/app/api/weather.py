import httpx
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/weather", tags=["weather"])


@router.get("/current")
async def current_weather(lat: float = Query(...), lon: float = Query(...)):
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            "https://api.open-meteo.com/v1/forecast",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation",
            },
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Weather data unavailable")

    current = resp.json().get("current", {})
    if not current:
        raise HTTPException(status_code=502, detail="Weather data unavailable")

    deg = current.get("wind_direction_10m", 0)
    dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
    compass = dirs[round(deg / 45) % 8]

    return {
        "temperature_c": current.get("temperature_2m"),
        "humidity_pct": current.get("relative_humidity_2m"),
        "wind_speed_kmh": current.get("wind_speed_10m"),
        "wind_direction_deg": deg,
        "wind_direction_compass": compass,
        "precipitation_mm": current.get("precipitation"),
    }