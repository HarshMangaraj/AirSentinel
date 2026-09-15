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
  aqi: number;
  station: string;
  distance_km: number;
  updated_at: string | null;
};

export type AqiReading = {
  aqi: number;
  station: string;
  distance_km: number;
  updated_at: string | null;
  sources: AqiSource[];
  source_count: number;
};

export function getCities(): Promise<City[]> {
  return authedFetch('/cities');
}

export function getCurrentAqi(lat: number, lon: number): Promise<AqiReading> {
  return authedFetch(`/aqi/current?lat=${lat}&lon=${lon}`);
}