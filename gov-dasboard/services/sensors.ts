import { Sensor, HotspotPrediction } from '../types';
import { MOCK_SENSORS, MOCK_HOTSPOT_PREDICTIONS } from '../mock/data';

let sensorsDatabase = [...MOCK_SENSORS];

export const sensorsService = {
  getSensors: async (filters?: {
    status?: string;
    category?: string;
    zone?: string;
    search?: string;
  }): Promise<Sensor[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));

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
    await new Promise((resolve) => setTimeout(resolve, 150));
    const found = sensorsDatabase.find((s) => s.id === id);
    return found ? { ...found } : null;
  },

  getHotspotPredictions: async (): Promise<HotspotPrediction[]> => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...MOCK_HOTSPOT_PREDICTIONS];
  },
};
