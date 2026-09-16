import os
import asyncio
import httpx
from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/aqi", tags=["aqi"])

WAQI_TOKEN = os.getenv("WAQI_API_TOKEN")
IQAIR_KEY = os.getenv("IQAIR_API_KEY")
OPENAQ_KEY = os.getenv("OPENAQ_API_KEY")
OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")
CPCB_KEY = os.getenv("CPCB_API_KEY")
CPCB_RESOURCE_ID = "3b01bcb8-0b14-4abf-b6f2-c1bfd384ba69"

transport = httpx.AsyncHTTPTransport(local_address="0.0.0.0")
MAX_DISTANCE_KM = 100
PER_SOURCE_TIMEOUT = 5.0


def _distance_km(lat1, lon1, lat2, lon2):
    return ((lat1 - lat2) ** 2 + (lon1 - lon2) ** 2) ** 0.5 * 111


def _pm25_to_aqi(pm25: float) -> int:
    breakpoints = [
        (0.0, 12.0, 0, 50), (12.1, 35.4, 51, 100), (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200), (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400), (350.5, 500.4, 401, 500),
    ]
    for c_lo, c_hi, i_lo, i_hi in breakpoints:
        if c_lo <= pm25 <= c_hi:
            return round(((i_hi - i_lo) / (c_hi - c_lo)) * (pm25 - c_lo) + i_lo)
    return 500


def _empty(name):
    return {"source": name, "aqi": None, "station": None, "distance_km": None}


# ---------- WAQI ----------

async def _waqi_direct(client, lat, lon):
    resp = await client.get(f"https://api.waqi.info/feed/geo:{lat};{lon}/", params={"token": WAQI_TOKEN})
    data = resp.json()
    if data.get("status") != "ok":
        return None
    d = data["data"]
    geo = d.get("city", {}).get("geo", [lat, lon])
    dist = _distance_km(lat, lon, geo[0], geo[1])
    if dist > MAX_DISTANCE_KM:
        return None
    return {"aqi": d.get("aqi"), "station": d.get("city", {}).get("name"), "distance_km": round(dist)}


async def _waqi_bounds(client, lat, lon, radius):
    box = f"{lat - radius},{lon - radius},{lat + radius},{lon + radius}"
    resp = await client.get("https://api.waqi.info/map/bounds/", params={"latlng": box, "token": WAQI_TOKEN})
    data = resp.json()
    if data.get("status") != "ok":
        return None
    candidates = [s for s in data.get("data", []) if str(s.get("aqi", "-")).lstrip("-").isdigit() and str(s.get("aqi")) != "-"]
    scored = [(s, _distance_km(lat, lon, s["lat"], s["lon"])) for s in candidates]
    scored = [p for p in scored if p[1] <= MAX_DISTANCE_KM]
    if not scored:
        return None
    best, dist_km = min(scored, key=lambda p: p[1])
    return {"aqi": int(best["aqi"]), "station": best.get("station", {}).get("name", "Nearby station"), "distance_km": round(dist_km)}


async def _get_waqi(client, lat, lon):
    try:
        result = await asyncio.wait_for(_waqi_direct(client, lat, lon), PER_SOURCE_TIMEOUT)
        if result:
            return {"source": "WAQI", **result}
        for radius in (1.0, 2.5):
            result = await asyncio.wait_for(_waqi_bounds(client, lat, lon, radius), PER_SOURCE_TIMEOUT)
            if result:
                return {"source": "WAQI", **result}
    except (asyncio.TimeoutError, httpx.HTTPError):
        pass
    return _empty("WAQI")


# ---------- Open-Meteo ----------

async def _get_open_meteo(client, lat, lon):
    try:
        resp = await asyncio.wait_for(
            client.get("https://air-quality-api.open-meteo.com/v1/air-quality",
                       params={"latitude": lat, "longitude": lon, "current": "us_aqi"}),
            PER_SOURCE_TIMEOUT,
        )
        if resp.status_code == 200:
            current = resp.json().get("current")
            if current and current.get("us_aqi") is not None:
                return {"source": "Open-Meteo", "aqi": round(current["us_aqi"]), "station": "Model estimate", "distance_km": 0}
    except (asyncio.TimeoutError, httpx.HTTPError):
        pass
    return _empty("Open-Meteo")


# ---------- IQAir ----------

async def _get_iqair(client, lat, lon):
    if not IQAIR_KEY:
        return _empty("IQAir")
    try:
        resp = await asyncio.wait_for(
            client.get("http://api.airvisual.com/v2/nearest_city", params={"lat": lat, "lon": lon, "key": IQAIR_KEY}),
            PER_SOURCE_TIMEOUT,
        )
        if resp.status_code == 200:
            data = resp.json()
            if data.get("status") == "success":
                d = data["data"]
                aqi = d.get("current", {}).get("pollution", {}).get("aqius")
                if aqi is not None:
                    return {"source": "IQAir", "aqi": aqi, "station": f"{d.get('city')}, {d.get('state')}", "distance_km": None}
    except (asyncio.TimeoutError, httpx.HTTPError):
        pass
    return _empty("IQAir")


# ---------- OpenAQ ----------

async def _get_openaq(client, lat, lon):
    if not OPENAQ_KEY:
        return _empty("OpenAQ")
    headers = {"X-API-Key": OPENAQ_KEY}
    try:
        loc_resp = await asyncio.wait_for(
            client.get("https://api.openaq.org/v3/locations",
                       params={"coordinates": f"{lat},{lon}", "radius": 25000, "limit": 1}, headers=headers),
            PER_SOURCE_TIMEOUT,
        )
        if loc_resp.status_code != 200:
            return _empty("OpenAQ")
        results = loc_resp.json().get("results", [])
        if not results:
            return _empty("OpenAQ")
        location = results[0]
        coords = location.get("coordinates", {})
        dist = _distance_km(lat, lon, coords.get("latitude", lat), coords.get("longitude", lon))

        latest_resp = await asyncio.wait_for(
            client.get(f"https://api.openaq.org/v3/locations/{location['id']}/latest", headers=headers),
            PER_SOURCE_TIMEOUT,
        )
        if latest_resp.status_code != 200:
            return _empty("OpenAQ")
        measurements = latest_resp.json().get("results", [])
        pm25 = next((m.get("value") for m in measurements if m.get("parameter", {}).get("name") == "pm25"), None)
        if pm25 is not None:
            return {"source": "OpenAQ", "aqi": _pm25_to_aqi(pm25), "station": location.get("name", "OpenAQ station"), "distance_km": round(dist)}
    except (asyncio.TimeoutError, httpx.HTTPError):
        pass
    return _empty("OpenAQ")


# ---------- OpenWeather ----------

async def _get_openweather(client, lat, lon):
    if not OPENWEATHER_KEY:
        return _empty("OpenWeather")
    try:
        resp = await asyncio.wait_for(
            client.get("https://api.openweathermap.org/data/2.5/air_pollution",
                       params={"lat": lat, "lon": lon, "appid": OPENWEATHER_KEY}),
            PER_SOURCE_TIMEOUT,
        )
        if resp.status_code == 200:
            items = resp.json().get("list", [])
            if items:
                pm25 = items[0].get("components", {}).get("pm2_5")
                if pm25 is not None:
                    return {"source": "OpenWeather", "aqi": _pm25_to_aqi(pm25), "station": "Model estimate", "distance_km": 0}
    except (asyncio.TimeoutError, httpx.HTTPError):
        pass
    return _empty("OpenWeather")


# ---------- CPCB ----------

async def _get_cpcb(client, lat, lon):
    if not CPCB_KEY:
        return _empty("CPCB (Govt. of India)")
    try:
        resp = await asyncio.wait_for(
            client.get(f"https://api.data.gov.in/resource/{CPCB_RESOURCE_ID}",
                       params={"api-key": CPCB_KEY, "format": "json", "limit": 2000}),
            PER_SOURCE_TIMEOUT,
        )
        if resp.status_code != 200:
            return _empty("CPCB (Govt. of India)")

        records = resp.json().get("records", [])
        best, best_dist = None, None
        for r in records:
            try:
                r_lat = float(r.get("latitude", ""))
                r_lon = float(r.get("longitude", ""))
            except (TypeError, ValueError):
                continue
            if str(r.get("pollutant_id", "")).upper().replace(".", "") != "PM25":
                continue
            try:
                avg = float(r.get("pollutant_avg"))
            except (TypeError, ValueError):
                continue
            dist = _distance_km(lat, lon, r_lat, r_lon)
            if dist > MAX_DISTANCE_KM:
                continue
            if best_dist is None or dist < best_dist:
                best_dist = dist
                best = {"station": r.get("station", "CPCB station"), "pm25": avg}

        if best:
            return {"source": "CPCB (Govt. of India)", "aqi": _pm25_to_aqi(best["pm25"]), "station": best["station"], "distance_km": round(best_dist)}
    except (asyncio.TimeoutError, httpx.HTTPError):
        pass
    return _empty("CPCB (Govt. of India)")


async def fetch_aqi_for_location(lat: float, lon: float):
    """Core multi-source fetch, reusable by both the live endpoint and the scheduled ingestion job."""
    async with httpx.AsyncClient(timeout=PER_SOURCE_TIMEOUT + 1, transport=transport) as client:
        sources = await asyncio.gather(
            _get_waqi(client, lat, lon),
            _get_open_meteo(client, lat, lon),
            _get_iqair(client, lat, lon),
            _get_openaq(client, lat, lon),
            _get_openweather(client, lat, lon),
            _get_cpcb(client, lat, lon),
        )

    valid = [s for s in sources if s["aqi"] is not None]

    if not valid:
        return {"aqi": None, "station": "N/A", "distance_km": None, "sources": sources, "source_count": 0}

    averaged_aqi = round(sum(s["aqi"] for s in valid) / len(valid))
    ground_source = next((s for s in valid if s.get("distance_km") not in (None, 0)), valid[0])

    return {
        "aqi": averaged_aqi,
        "station": ground_source["station"],
        "distance_km": ground_source.get("distance_km") or 0,
        "sources": sources,
        "source_count": len(valid),
    }


@router.get("/current")
async def current_aqi(lat: float = Query(...), lon: float = Query(...)):
    return await fetch_aqi_for_location(lat, lon)