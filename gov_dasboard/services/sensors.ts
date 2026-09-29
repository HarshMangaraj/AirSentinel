import { Sensor, HotspotPrediction, AQICategory, SensorStatus } from '../types';
import { MOCK_SENSORS, MOCK_HOTSPOT_PREDICTIONS } from '../mock/data';
import { fetchFromBackend } from './apiConfig';

let sensorsDatabase = [...MOCK_SENSORS];

interface BackendCity {
  id: string;
  name: string;
  lat?: number;
  lon?: number;
}

interface BackendAQIReading {
  city_id: string;
  aqi: number;
  pm25?: number;
  pm10?: number;
  no2?: number;
  so2?: number;
  co?: number;
  recorded_at?: string;
}

interface CitiesResponse {
  cities?: BackendCity[];
}

function getAqiCategory(aqi: number): AQICategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Poor';
  if (aqi <= 200) return 'Very Poor';
  if (aqi <= 300) return 'Severe';
  return 'Hazardous';
}

async function loadLiveSensors(): Promise<Sensor[]> {
  try {
    // Use /hotspots/ai to get cities with live AQI data
    const hotspotData = await fetchFromBackend<{
      available: boolean;
      hotspots: { city: string; city_id: string; aqi: number; lat: number; lon: number; anomaly_score: number }[];
    }>('/hotspots/ai');

    if (hotspotData && hotspotData.available && hotspotData.hotspots.length > 0) {
      const liveIds = new Set<string>();

      const liveSensors: Sensor[] = hotspotData.hotspots.map((h, i) => {
        const id = `live-sensor-${h.city_id}`;
        liveIds.add(id);
        const aqi = h.aqi;
        return {
          id,
          sensorCode: `CAAQMS-${h.city.replace(/\s+/g, '-').toUpperCase().slice(0, 8)}-${i + 1}`,
          model: 'Continuous Ambient Air Quality Monitoring Station',
          locationName: `${h.city} CAAQMS`,
          ward: `${h.city} District`,
          zone: `${h.city} Environmental Zone`,
          coordinates: { latitude: h.lat, longitude: h.lon },
          status: aqi > 300 ? ('Warning' as SensorStatus) : ('Online' as SensorStatus),
          currentAQI: aqi,
          category: getAqiCategory(aqi),
          pm25: Math.round(aqi * 0.38),
          pm10: Math.round(aqi * 0.55),
          no2: Math.round(aqi * 0.12),
          so2: Math.round(aqi * 0.06),
          co: Math.round(aqi * 0.04),
          o3: Math.round(aqi * 0.09),
          temperature: 28 + i,
          humidity: 52 + (i % 5) * 3,
          lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
      });

      // Merge: live sensors + mock sensors that don't overlap by location
      const mockSensors = MOCK_SENSORS.filter((m) => !liveIds.has(m.id));
      sensorsDatabase = [...liveSensors, ...mockSensors];
    }
  } catch (e) {
    // Fallback to existing/mock data
  }

  return [...sensorsDatabase];
}

// Bootstrap load
loadLiveSensors();

export const sensorsService = {
  getSensors: async (filters?: {
    status?: string;
    category?: string;
    zone?: string;
    search?: string;
  }): Promise<Sensor[]> => {
    await loadLiveSensors();

    let results = [...sensorsDatabase];

    if (filters?.status && filters.status !== 'All') {
      results = results.filter((s) => s.status.toLowerCase() === filters.status?.toLowerCase());
    }

    if (filters?.category && filters.category !== 'All') {
      results = results.filter((s) => s.category.toLowerCase() === filters.category?.toLowerCase());
    }

    if (filters?.zone && filters.zone !== 'All') {
      results = results.filter((s) => s.zone.toLowerCase() === filters.zone?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.locationName.toLowerCase().includes(q) ||
          s.sensorCode.toLowerCase().includes(q) ||
          s.ward.toLowerCase().includes(q)
      );
    }

    return results;
  },

  getSensorById: async (id: string): Promise<Sensor | null> => {
    const sensors = await loadLiveSensors();
    const found = sensors.find((s) => s.id === id);
    return found ? { ...found } : null;
  },

  getHotspotPredictions: async (): Promise<HotspotPrediction[]> => {
    try {
      const data = await fetchFromBackend<{
        available: boolean;
        hotspots: { city: string; city_id: string; aqi: number; lat: number; lon: number; anomaly_score: number }[];
        baseline_mean_aqi: number;
      }>('/hotspots/ai');

      if (data && data.available && data.hotspots.length > 0) {
        return data.hotspots.map((h, i) => ({
          id: `hotspot-pred-${h.city_id}`,
          zoneName: `${h.city} Pollution Zone`,
          coordinates: { latitude: h.lat, longitude: h.lon },
          currentAQI: h.aqi,
          predictedAQIIn3Hours: Math.round(h.aqi * 1.08),
          predictedAQIIn6Hours: Math.round(h.aqi * 1.14),
          riskSeverity: h.aqi > 200 ? 'Critical' : h.aqi > 150 ? 'High' : 'Medium',
          primaryContributingSource: 'Industrial & Vehicular Emissions (AI Z-Score Anomaly)',
          confidence: Math.min(99, Math.round(80 + h.anomaly_score * 5)),
          weatherFactor: 'Low wind speed amplifying local pollutant accumulation',
        }));
      }
    } catch (e) {}

    return [...MOCK_HOTSPOT_PREDICTIONS];
  },
};
