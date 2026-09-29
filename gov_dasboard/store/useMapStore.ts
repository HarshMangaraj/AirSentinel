import { create } from 'zustand';
import { Sensor, PollutionAlert, PollutionReport, HotspotPrediction } from '../types';

export type MapLayerType = 'sensors' | 'hotspots' | 'alerts' | 'reports' | 'predictions';
export type PollutantFilter = 'AQI' | 'PM2.5' | 'PM10' | 'NO2' | 'SO2';

interface MapState {
  mapType: 'standard' | 'satellite';
  setMapType: (type: 'standard' | 'satellite') => void;

  activeLayers: Record<MapLayerType, boolean>;
  toggleLayer: (layer: MapLayerType) => void;

  selectedPollutant: PollutantFilter;
  setSelectedPollutant: (pollutant: PollutantFilter) => void;

  severityFilter: string;
  setSeverityFilter: (severity: string) => void;

  selectedEntity: {
    type: 'sensor' | 'alert' | 'report' | 'hotspot';
    data: Sensor | PollutionAlert | PollutionReport | HotspotPrediction;
  } | null;
  setSelectedEntity: (
    entity: {
      type: 'sensor' | 'alert' | 'report' | 'hotspot';
      data: Sensor | PollutionAlert | PollutionReport | HotspotPrediction;
    } | null
  ) => void;

  zoomLevel: number;
  setZoomLevel: (zoom: number) => void;
  center: { latitude: number; longitude: number };
  setCenter: (center: { latitude: number; longitude: number }) => void;
}

export const useMapStore = create<MapState>((set) => ({
  mapType: 'standard',
  setMapType: (type) => set({ mapType: type }),

  activeLayers: {
    sensors: true,
    hotspots: true,
    alerts: true,
    reports: true,
    predictions: true,
  },
  toggleLayer: (layer) =>
    set((state) => ({
      activeLayers: {
        ...state.activeLayers,
        [layer]: !state.activeLayers[layer],
      },
    })),

  selectedPollutant: 'AQI',
  setSelectedPollutant: (pollutant) => set({ selectedPollutant: pollutant }),

  severityFilter: 'All',
  setSeverityFilter: (severity) => set({ severityFilter: severity }),

  selectedEntity: null,
  setSelectedEntity: (entity) => set({ selectedEntity: entity }),

  zoomLevel: 12,
  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  center: { latitude: 28.625, longitude: 77.225 },
  setCenter: (center) => set({ center }),
}));
