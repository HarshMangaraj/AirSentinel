import { supabase } from './supabase';

const API_BASE = 'http://192.168.31.188:8000';

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

export type ReportInput = {
  description?: string;
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
  media_url: string | null;
  lat: number;
  lon: number;
  status: string;
  created_at: string | null;
};

export function getNearbyReports(lat: number, lon: number): Promise<NearbyReport[]> {
  return authedFetch(`/reports/nearby?lat=${lat}&lon=${lon}`);
}

export function getMyReports(): Promise<NearbyReport[]> {
  return authedFetch('/reports/mine');
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