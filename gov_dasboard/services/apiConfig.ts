// API Configuration for Government Environmental Command Center
// Connects to local FastAPI backend and deployed fallback

export const LOCAL_API_BASE = 'http://localhost:8000';
export const PROD_API_BASE = 'https://airsentinel-backend-dg7k.onrender.com';
export const SUPABASE_URL = 'https://axotonxklayqedvzzbzp.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ZB0zWamRnI51pFDOXWczdg_8RKBiT5R';

let currentApiBase = LOCAL_API_BASE;

export async function getActiveApiBase(): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${LOCAL_API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      currentApiBase = LOCAL_API_BASE;
      return LOCAL_API_BASE;
    }
  } catch (e) {
    currentApiBase = PROD_API_BASE;
  }
  return currentApiBase;
}

export async function fetchFromBackend<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const base = await getActiveApiBase();
  const url = `${base}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
