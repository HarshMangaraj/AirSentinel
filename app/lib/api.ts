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

export function getCurrentAqi(lat: number, lon: number): Promise<AqiReading> {
  return authedFetch(`/aqi/current?lat=${lat}&lon=${lon}`);
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

export function getNearbyReports(lat: number, lon: number): Promise<NearbyReport[]> {
  return authedFetch(`/reports/nearby?lat=${lat}&lon=${lon}`);
}

export function getMyReports(): Promise<NearbyReport[]> {
  return authedFetch('/reports/mine');
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

export function getWeather(lat: number, lon: number): Promise<Weather> {
  return authedFetch(`/weather/current?lat=${lat}&lon=${lon}`);
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

export function getPollutants(lat: number, lon: number): Promise<Pollutants> {
  return authedFetch(`/pollutants/current?lat=${lat}&lon=${lon}`);
}

export type Briefing = { available: boolean; text: string; source?: string };

export function getBriefing(lat: number, lon: number): Promise<Briefing> {
  return authedFetch(`/intelligence/briefing?lat=${lat}&lon=${lon}`);
}

export type SavedLocation = { id: string; label: string; lat: number; lon: number };

export function getSavedLocations(): Promise<SavedLocation[]> {
  return authedFetch('/locations/mine');
}

export async function addSavedLocation(label: string, lat: number, lon: number) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_BASE}/locations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify({ label, lat, lon }),
  });
  if (!res.ok) throw new Error('Failed to save location');
  return res.json();
}

export async function deleteSavedLocation(id: string) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const res = await fetch(`${API_BASE}/locations/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error('Failed to delete location');
  return res.json();
}