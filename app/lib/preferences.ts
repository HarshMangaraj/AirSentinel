import * as SecureStore from 'expo-secure-store';

const KEY = 'alert_preferences';

export type AlertPreferences = {
  airQuality: boolean;
  health: boolean;
  reports: boolean;
};

const DEFAULTS: AlertPreferences = { airQuality: true, health: true, reports: true };

export async function getAlertPreferences(): Promise<AlertPreferences> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export async function setAlertPreferences(prefs: AlertPreferences) {
  await SecureStore.setItemAsync(KEY, JSON.stringify(prefs));
}