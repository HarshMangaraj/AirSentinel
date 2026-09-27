import { supabase } from './supabase';
import Constants from 'expo-constants';

function resolveApiBase(): string {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:8000`;
  }
  return 'http://192.168.29.148:8000';
}

const API_BASE = resolveApiBase();

async function authedFetch(path: string) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export type City = {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
};

export type AqiSource = {
  source: string;
  aqi: number | null;
  station: string | null;
  distance_km: number | null;
};

export type AqiReading = {
  aqi: number | null;
  station: string;
  distance_km: number | null;
  sources: AqiSource[];
  source_count: number;
};

export function getCities(): Promise<City[]> {
  return authedFetch('/cities');
}

export async function getCurrentAqi(lat: number, lon: number): Promise<AqiReading> {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`);
    if (!res.ok) throw new Error('AQI fetch failed');
    const data = await res.json();
    return {
      aqi: data.current.us_aqi,
      station: 'Local (Open-Meteo)',
      distance_km: 0,
      sources: [],
      source_count: 1,
    };
  } catch (err) {
    console.error('AQI fetch error:', err);
    throw err;
  }
}

export type LatestCityAqi = {
  available: boolean;
  aqi?: number;
  station?: string;
  recorded_at?: string | null;
};

export function getLatestCityAqi(cityId: string): Promise<LatestCityAqi> {
  return authedFetch(`/aqi/latest/${cityId}`);
}

export type ReportInput = {
  description?: string;
  category?: string;
  media_url?: string;
  lat: number;
  lon: number;
};

export async function submitReport(payload: ReportInput) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  const res = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Report submission failed: ${res.status}`);
  return res.json();
}

export type NearbyReport = {
  id: string;
  description: string | null;
  category: string | null;
  media_url: string | null;
  lat: number;
  lon: number;
  status: string;
  created_at: string | null;
  status_updated_at?: string | null;
  distance_km?: number;
};

export async function getNearbyReports(lat: number, lon: number): Promise<NearbyReport[]> {
  try {
    // Attempt backend fetch
    const data = await authedFetch(`/reports/nearby?lat=${lat}&lon=${lon}`);
    if (Array.isArray(data) && data.length > 0) return data;
    if (data?.reports && Array.isArray(data.reports) && data.reports.length > 0) return data.reports;
  } catch (e) {
    console.log('Backend reports failed, using mock data');
  }

  // Fallback to generated dummy hotspots
  return [
    {
      id: 'mock-1',
      description: 'Industrial emissions observed',
      category: 'Factory Smoke',
      media_url: null,
      lat: lat + 0.015,
      lon: lon + 0.02,
      status: 'Under Review',
      created_at: new Date().toISOString(),
      distance_km: 1.2
    },
    {
      id: 'mock-2',
      description: 'Heavy construction dust in the area',
      category: 'Construction Dust',
      media_url: null,
      lat: lat - 0.02,
      lon: lon + 0.01,
      status: 'Verified',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      distance_km: 2.5
    },
    {
      id: 'mock-3',
      description: 'Vehicle congestion causing smog',
      category: 'Traffic Emissions',
      media_url: null,
      lat: lat - 0.005,
      lon: lon - 0.015,
      status: 'Active',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      distance_km: 0.8
    }
  ];
}

export async function getMyReports(): Promise<NearbyReport[]> {
  try {
    const data = await authedFetch('/reports/mine');
    if (Array.isArray(data)) return data;
    if (data?.reports && Array.isArray(data.reports)) return data.reports;
    return [];
  } catch (e) {
    console.log('Backend getMyReports failed, returning mock data');
    return [];
  }
}

export function getReport(id: string): Promise<NearbyReport> {
  return authedFetch(`/reports/${id}`);
}

export type Alert = {
  id: string;
  category: string;
  severity: string;
  title: string;
  message: string;
};

export function getAlerts(): Promise<{ alerts: Alert[] }> {
  return authedFetch('/alerts');
}

export type Prediction = {
  prediction?: string;
  current_aqi?: number;
  trend_per_reading?: number;
  forecast_next_reading?: number;
  spike_warning?: boolean;
};

export function getPrediction(cityId: string): Promise<Prediction> {
  return authedFetch(`/predict/spike/${cityId}`);
}

export type Attribution = {
  probable_cause: string;
  scores: Record<string, number>;
  explanation: string;
};

export function getAttribution(cityId: string): Promise<Attribution> {
  return authedFetch(`/attribution/${cityId}`);
}

export type Hotspot = {
  cities: string[];
  lat: number;
  lon: number;
  max_aqi: number;
  severity: string;
};

export function getHotspots(): Promise<{ threshold: number; hotspots: Hotspot[] }> {
  return authedFetch('/hotspots');
}

export type AiHotspot = {
  city: string;
  aqi: number;
  lat: number;
  lon: number;
  anomaly_score: number;
};

export function getAiHotspots(): Promise<{ available: boolean; hotspots: AiHotspot[]; baseline_mean_aqi?: number }> {
  return authedFetch('/hotspots/ai');
}

export type Weather = {
  temperature_c: number;
  humidity_pct: number;
  wind_speed_kmh: number;
  wind_direction_deg: number;
  wind_direction_compass: string;
  precipitation_mm: number;
};

export async function getWeather(lat: number, lon: number): Promise<Weather> {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,precipitation`);
    if (!res.ok) throw new Error('Weather fetch failed');
    const data = await res.json();
    const current = data.current;
    
    const deg = current.wind_direction_10m;
    const compass = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8];
    
    return {
      temperature_c: current.temperature_2m,
      humidity_pct: current.relative_humidity_2m,
      wind_speed_kmh: current.wind_speed_10m,
      wind_direction_deg: deg,
      wind_direction_compass: compass,
      precipitation_mm: current.precipitation,
    };
  } catch (err) {
    console.error('Open-Meteo failed:', err);
    throw err;
  }
}

export type AqiHistoryPoint = { aqi: number; recorded_at: string | null };
export type AqiHistory = { available: boolean; city_id?: string; city_name?: string; readings: AqiHistoryPoint[] };

export function getAqiHistory(lat: number, lon: number): Promise<AqiHistory> {
  return authedFetch(`/aqi/history?lat=${lat}&lon=${lon}`);
}

export type Pollutants = {
  pm2_5: number | null;
  pm10: number | null;
  no2: number | null;
  so2: number | null;
  o3: number | null;
  co: number | null;
  unit: string;
};

export async function getPollutants(lat: number, lon: number): Promise<Pollutants> {
  try {
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone`);
    if (!res.ok) throw new Error('Pollutants fetch failed');
    const data = await res.json();
    const current = data.current;
    return {
      pm2_5: current.pm2_5,
      pm10: current.pm10,
      no2: current.nitrogen_dioxide,
      so2: current.sulphur_dioxide,
      o3: current.ozone,
      co: current.carbon_monoxide,
      unit: 'µg/m³',
    };
  } catch (err) {
    console.error('Pollutants fetch error:', err);
    throw err;
  }
}

export type Briefing = { available: boolean; text: string; source?: string };

export function getBriefing(lat: number, lon: number): Promise<Briefing> {
  return authedFetch(`/intelligence/briefing?lat=${lat}&lon=${lon}`);
}