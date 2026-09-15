import { colors } from '../theme/tokens';

export function aqiColor(aqi: number): string {
  if (aqi <= 50) return colors.aqi.good;
  if (aqi <= 100) return colors.aqi.moderate;
  if (aqi <= 200) return colors.aqi.unhealthy;
  return colors.aqi.hazardous;
}

export function aqiLabel(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}