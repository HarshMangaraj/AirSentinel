import httpx
from fastapi import APIRouter, Query, HTTPException

router = APIRouter(prefix="/pollutants", tags=["pollutants"])


@router.get("/current")
async def current_pollutants(lat: float = Query(...), lon: float = Query(...)):
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(
            "https://air-quality-api.open-meteo.com/v1/air-quality",
            params={
                "latitude": lat,
                "longitude": lon,
                "current": "pm2_5,pm10,nitrogen_dioxide,sulphur_dioxide,ozone,carbon_monoxide",
            },
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Pollutant data unavailable")

    current = resp.json().get("current", {})
    if not current:
        raise HTTPException(status_code=502, detail="Pollutant data unavailable")

    return {
        "pm2_5": current.get("pm2_5"),
        "pm10": current.get("pm10"),
        "no2": current.get("nitrogen_dioxide"),
        "so2": current.get("sulphur_dioxide"),
        "o3": current.get("ozone"),
        "co": current.get("carbon_monoxide"),
        "unit": "µg/m³ (CO in mg/m³)",
    }