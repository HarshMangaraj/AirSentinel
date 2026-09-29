import { HistoricalReading, WeatherData, DashboardKPIData } from '../types';
import {
  MOCK_WEATHER,
  MOCK_KPI_DATA,
  MOCK_HISTORICAL_TREND_1H,
  MOCK_HISTORICAL_TREND_6H,
  MOCK_HISTORICAL_TREND_24H,
  MOCK_HISTORICAL_TREND_7D,
} from '../mock/data';

export const airQualityService = {
  getKPIData: async (): Promise<DashboardKPIData> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    return { ...MOCK_KPI_DATA };
  },

  getWeather: async (): Promise<WeatherData> => {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return { ...MOCK_WEATHER };
  },

  getAqiTrend: async (timeframe: '1h' | '6h' | '24h' | '7d'): Promise<HistoricalReading[]> => {
    await new Promise((resolve) => setTimeout(resolve, 150));
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
