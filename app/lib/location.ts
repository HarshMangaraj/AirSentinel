import * as Location from 'expo-location';

export async function getDeviceLocation(): Promise<{ lat: number; lon: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const pos = await Location.getCurrentPositionAsync({});
  return { lat: pos.coords.latitude, lon: pos.coords.longitude };
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { headers: { 'User-Agent': 'AirSentinelApp/1.0' } }
    );
    const data = await res.json();
    return (
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Selected location'
    );
  } catch {
    return 'Selected location';
  }
}