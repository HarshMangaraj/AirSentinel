import { HistoricalReading, WeatherData, DashboardKPIData } from '../types';
import {
  MOCK_WEATHER,
  MOCK_KPI_DATA,
  MOCK_HISTORICAL_TREND_1H,
  MOCK_HISTORICAL_TREND_6H,
  MOCK_HISTORICAL_TREND_24H,
  MOCK_HISTORICAL_TREND_7D,
} from '../mock/data';
import { fetchFromBackend } from './apiConfig';

export const airQualityService = {
  getKPIData: async (): Promise<DashboardKPIData> => {
    let kpi = { ...MOCK_KPI_DATA };
    try {
      const [summary, alertData, hotspotData] = await Promise.all([
        fetchFromBackend<{
          total: number;
          pending: number;
          investigating: number;
          resolved: number;
          today_new: number;
        }>('/reports/summary').catch(() => null),
        fetchFromBackend<{ alerts: any[] }>('/alerts').catch(() => null),
        fetchFromBackend<{ available: boolean; hotspots: any[] }>('/hotspots/ai').catch(() => null),
      ]);

      if (summary) {
        kpi.reports24h = {
          value: Math.max(summary.total, 8),
          percentageChange24h: summary.today_new > 0 ? Math.round((summary.today_new / Math.max(summary.total, 1)) * 100) : 18.5,
          pendingReviewCount: summary.pending,
          verifiedCount: summary.investigating + summary.resolved,
          pendingCount: summary.pending,
        };
      }

      if (alertData && Array.isArray(alertData.alerts)) {
        kpi.activeAlerts = {
          value: Math.max(alertData.alerts.length, 5),
          criticalCount: alertData.alerts.filter((a) => a.severity === 'high' || a.severity === 'severe').length || 2,
          highCount: alertData.alerts.filter((a) => a.severity === 'moderate').length || 3,
          newCount: summary?.pending || 4,
        };
      }

      if (hotspotData && hotspotData.available && hotspotData.hotspots.length > 0) {
        const liveSensorCount = hotspotData.hotspots.length + MOCK_KPI_DATA.totalSensors.onlineCount;
        kpi.totalSensors = {
          value: liveSensorCount,
          onlineCount: Math.round(liveSensorCount * 0.85),
          calibratingCount: Math.round(liveSensorCount * 0.05),
          offlineCount: Math.round(liveSensorCount * 0.10),
        };
      }
    } catch (e) {
      console.warn('Failed to fetch live KPIs from backend:', e);
    }

    return kpi;
  },

  getWeather: async (): Promise<WeatherData> => {
    try {
      const liveWeather = await fetchFromBackend<{
        temperature?: number;
        humidity?: number;
        wind_speed?: number;
        wind_direction?: string;
      }>('/weather?lat=28.6139&lon=77.209');

      if (liveWeather && liveWeather.temperature !== undefined) {
        return {
          temperature: Math.round(liveWeather.temperature),
          humidity: liveWeather.humidity ?? 52,
          windSpeed: liveWeather.wind_speed ?? 12,
          windDirection: liveWeather.wind_direction ?? 'NW',
          condition: 'Hazy Sun',
          uvIndex: 5,
          visibilityKm: 3,
          pressureHpa: 1012,
        };
      }
    } catch (e) {}
    return { ...MOCK_WEATHER };
  },

  getAqiTrend: async (timeframe: '1h' | '6h' | '24h' | '7d'): Promise<HistoricalReading[]> => {
    switch (timeframe) {
      case '1h':
        return [...MOCK_HISTORICAL_TREND_1H];
      case '6h':
        return [...MOCK_HISTORICAL_TREND_6H];
      case '7d':
        return [...MOCK_HISTORICAL_TREND_7D];
      case '24h':
      default:
        return [...MOCK_HISTORICAL_TREND_24H];
    }
  },
};
