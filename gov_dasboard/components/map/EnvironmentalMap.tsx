import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Sparkles,
  Radio,
  AlertTriangle,
  FileText,
  Eye,
  X,
  Compass,
} from 'lucide-react-native';
import Svg, { Circle, Rect, Path, G, Line, Text as SvgText, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useMapStore } from '../../store/useMapStore';
import { useUIStore } from '../../store/useUIStore';
import { MOCK_SENSORS, MOCK_ALERTS, MOCK_REPORTS, MOCK_HOTSPOT_PREDICTIONS } from '../../mock/data';
import { MapLegend } from './MapLegend';
import { MapFilters } from './MapFilters';
import { getAqiColor, getAqiBgClass } from '../../utils';
import { Sensor, PollutionAlert, PollutionReport, HotspotPrediction } from '../../types';

interface EnvironmentalMapProps {
  height?: number;
  showFullControls?: boolean;
}

export const EnvironmentalMap: React.FC<EnvironmentalMapProps> = ({
  height = 520,
  showFullControls = true,
}) => {
  const {
    mapType,
    setMapType,
    activeLayers,
    selectedPollutant,
    severityFilter,
    zoomLevel,
    setZoomLevel,
  } = useMapStore();

  const { setSelectedAlert, setSelectedReport } = useUIStore();

  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'sensor' | 'alert' | 'report' | 'hotspot';
    data: any;
  } | null>(null);

  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // Map viewport dimensions & coordinate transformation
  const mapWidth = 800;
  const mapHeight = 500;

  // Normalized coordinate projection for Delhi NCR mock bounds:
  // Lat: 28.52 to 28.76 (delta: 0.24)
  // Lng: 77.08 to 77.34 (delta: 0.26)
  const minLat = 28.52;
  const maxLat = 28.76;
  const minLng = 77.08;
  const maxLng = 77.34;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * (mapWidth - 100) + 50;
    const y = ((maxLat - lat) / (maxLat - minLat)) * (mapHeight - 100) + 50;
    return { x, y };
  };

  const handleZoomIn = () => setZoomLevel(Math.min(18, zoomLevel + 1));
  const handleZoomOut = () => setZoomLevel(Math.max(8, zoomLevel - 1));

  return (
    <View
      style={{ height }}
      className="w-full bg-slate-950 border border-slate-800/90 rounded-2xl relative overflow-hidden shadow-2xl"
    >
      {/* Interactive Map Visual Stage */}
      <View className="w-full h-full relative bg-[#090D16] overflow-hidden items-center justify-center">
        <Svg width="100%" height="100%" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
          <Defs>
            {/* Hotspot Dispersion Heat Gradients */}
            <RadialGradient id="criticalHeat" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.45" />
              <Stop offset="50%" stopColor="#DC2626" stopOpacity="0.25" />
              <Stop offset="100%" stopColor="#7F1D1D" stopOpacity="0.0" />
            </RadialGradient>
            <RadialGradient id="highHeat" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#F97316" stopOpacity="0.4" />
              <Stop offset="60%" stopColor="#EA580C" stopOpacity="0.15" />
              <Stop offset="100%" stopColor="#9A3412" stopOpacity="0.0" />
            </RadialGradient>
          </Defs>

          {/* Grid Background Lines (Radar / Command Grid) */}
          {Array.from({ length: 9 }).map((_, i) => (
            <Line
              key={`h-${i}`}
              x1="0"
              y1={i * 60 + 20}
              x2={mapWidth}
              y2={i * 60 + 20}
              stroke={mapType === 'satellite' ? '#1E293B' : '#131D33'}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}
          {Array.from({ length: 14 }).map((_, i) => (
            <Line
              key={`v-${i}`}
              x1={i * 60 + 20}
              y1="0"
              x2={i * 60 + 20}
              y2={mapHeight}
              stroke={mapType === 'satellite' ? '#1E293B' : '#131D33'}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* River / Geographic Feature */}
          <Path
            d="M 540 0 C 510 120, 580 240, 520 380 C 490 440, 510 500, 500 500"
            fill="none"
            stroke="#0284C7"
            strokeWidth="8"
            strokeOpacity="0.35"
          />
          <SvgText x="535" y="160" fill="#0284C7" fontSize="10" fontWeight="bold" opacity="0.6">
            Yamuna River Belt
          </SvgText>

          {/* Ring Arterial Corridors */}
          <Path
            d="M 120 220 Q 380 90 680 180 Q 720 380 400 440 Q 150 400 120 220 Z"
            fill="none"
            stroke="#334155"
            strokeWidth="3.5"
            strokeOpacity="0.4"
          />
          <SvgText x="380" y="125" fill="#64748B" fontSize="9" textAnchor="middle" opacity="0.6">
            Outer Ring Road Transit Belt
          </SvgText>

          {/* Layer 1: Predicted Hotspots & Thermal Inversion Dispersion Rings */}
          {activeLayers.predictions &&
            MOCK_HOTSPOT_PREDICTIONS.map((hotspot) => {
              const { x, y } = projectCoords(
                hotspot.coordinates.latitude,
                hotspot.coordinates.longitude
              );
              return (
                <G key={hotspot.id} onPress={() => setSelectedEntity({ type: 'hotspot', data: hotspot })}>
                  {/* Outer Plume Dispersion Ring */}
                  <Circle
                    cx={x}
                    cy={y}
                    r={hotspot.riskSeverity === 'Critical' ? '52' : '38'}
                    fill={hotspot.riskSeverity === 'Critical' ? 'url(#criticalHeat)' : 'url(#highHeat)'}
                  />
                  <Circle
                    cx={x}
                    cy={y}
                    r="22"
                    fill="none"
                    stroke={hotspot.riskSeverity === 'Critical' ? '#EF4444' : '#F97316'}
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    opacity="0.8"
                  />
                </G>
              );
            })}

          {/* Layer 2: Sensor Markers */}
          {activeLayers.sensors &&
            MOCK_SENSORS.map((sensor) => {
              const { x, y } = projectCoords(
                sensor.coordinates.latitude,
                sensor.coordinates.longitude
              );
              const aqiColor = getAqiColor(sensor.currentAQI);
              const isSelected =
                selectedEntity?.type === 'sensor' && selectedEntity?.data?.id === sensor.id;

              return (
                <G
                  key={sensor.id}
                  onPress={() => setSelectedEntity({ type: 'sensor', data: sensor })}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Selection Ring */}
                  {isSelected && (
                    <Circle
                      cx={x}
                      cy={y}
                      r="16"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  )}

                  {/* Outer Pulsing Glow */}
                  <Circle cx={x} cy={y} r="10" fill={aqiColor} opacity="0.3" />

                  {/* Core Pin */}
                  <Circle
                    cx={x}
                    cy={y}
                    r="6.5"
                    fill={aqiColor}
                    stroke="#0F172A"
                    strokeWidth="2"
                  />

                  {/* Sensor AQI Label Tag */}
                  <Rect
                    x={x - 16}
                    y={y + 9}
                    width="32"
                    height="14"
                    rx="3"
                    fill="#0F172A"
                    stroke={aqiColor}
                    strokeWidth="0.8"
                    opacity="0.95"
                  />
                  <SvgText
                    x={x}
                    y={y + 19.5}
                    fill="#FFFFFF"
                    fontSize="8.5"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {sensor.currentAQI}
                  </SvgText>
                </G>
              );
            })}

          {/* Layer 3: Active Alert Pins */}
          {activeLayers.alerts &&
            MOCK_ALERTS.filter((a) => a.status !== 'Resolved').map((alert) => {
              const { x, y } = projectCoords(
                alert.coordinates.latitude,
                alert.coordinates.longitude
              );
              return (
                <G
                  key={alert.id}
                  onPress={() => setSelectedEntity({ type: 'alert', data: alert })}
                  style={{ cursor: 'pointer' }}
                >
                  <Circle cx={x} cy={y} r="18" fill="#EF4444" opacity="0.2" />
                  <Circle cx={x} cy={y} r="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                  <SvgText
                    x={x}
                    y={y + 3.5}
                    fill="#FFFFFF"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    !
                  </SvgText>
                </G>
              );
            })}

          {/* Layer 4: Citizen Reports */}
          {activeLayers.reports &&
            MOCK_REPORTS.filter((r) => r.status === 'Pending' || r.status === 'Assigned').map(
              (report) => {
                const { x, y } = projectCoords(
                  report.coordinates.latitude,
                  report.coordinates.longitude
                );
                return (
                  <G
                    key={report.id}
                    onPress={() => setSelectedEntity({ type: 'report', data: report })}
                    style={{ cursor: 'pointer' }}
                  >
                    <Rect
                      x={x - 6}
                      y={y - 6}
                      width="12"
                      height="12"
                      rx="3"
                      fill="#3B82F6"
                      stroke="#FFFFFF"
                      strokeWidth="1.2"
                    />
                  </G>
                );
              }
            )}
        </Svg>
      </View>

      {/* Top Left: Map Controls & Mode Switcher */}
      <View className="absolute top-4 left-4 flex-row items-center space-x-2">
        <View className="flex-row items-center bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1 shadow-lg">
          <TouchableOpacity
            onPress={() => setMapType('standard')}
            className={`px-3 py-1.5 rounded-lg ${
              mapType === 'standard' ? 'bg-emerald-600/40 border border-emerald-500/50' : ''
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                mapType === 'standard' ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              Standard Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-lg ml-1 ${
              mapType === 'satellite' ? 'bg-emerald-600/40 border border-emerald-500/50' : ''
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                mapType === 'satellite' ? 'text-emerald-300' : 'text-slate-400'
              }`}
            >
              Satellite Layer
            </Text>
          </TouchableOpacity>
        </View>

        {showFullControls && (
          <TouchableOpacity
            onPress={() => setFilterPanelOpen(!filterPanelOpen)}
            className={`flex-row items-center px-3 py-2 bg-slate-900/90 backdrop-blur-md border rounded-xl shadow-lg ml-2 ${
              filterPanelOpen ? 'border-emerald-500 bg-slate-800' : 'border-slate-700/80'
            }`}
          >
            <Layers size={15} color="#10B981" />
            <Text className="text-xs font-semibold text-slate-200 ml-1.5">Layers & Filters</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Top Right: Zoom & Navigation Controls */}
      <View className="absolute top-4 right-4 flex-col space-y-2">
        <TouchableOpacity
          onPress={handleZoomIn}
          className="w-9 h-9 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl items-center justify-center shadow-lg hover:bg-slate-800"
        >
          <ZoomIn size={18} color="#E2E8F0" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleZoomOut}
          className="w-9 h-9 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl items-center justify-center shadow-lg hover:bg-slate-800"
        >
          <ZoomOut size={18} color="#E2E8F0" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedEntity(null)}
          className="w-9 h-9 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl items-center justify-center shadow-lg hover:bg-slate-800"
        >
          <Navigation size={16} color="#34D399" />
        </TouchableOpacity>
      </View>

      {/* Filter Panel Drawer (When open) */}
      {filterPanelOpen && (
        <View className="absolute top-16 left-4 z-20 w-72">
          <MapFilters />
        </View>
      )}

      {/* Bottom Left: Map Legend */}
      <View className="absolute bottom-4 left-4 z-10 hidden sm:flex">
        <MapLegend />
      </View>

      {/* Selected Marker Detail Card (Overlay) */}
      {selectedEntity && (
        <View className="absolute bottom-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/90 rounded-2xl p-4 shadow-2xl">
          <View className="flex-row items-center justify-between pb-2 border-b border-slate-800">
            <View className="flex-row items-center space-x-2">
              {selectedEntity.type === 'sensor' && <Radio size={16} color="#10B981" />}
              {selectedEntity.type === 'alert' && <AlertTriangle size={16} color="#EF4444" />}
              {selectedEntity.type === 'report' && <FileText size={16} color="#3B82F6" />}
              {selectedEntity.type === 'hotspot' && <Sparkles size={16} color="#A855F7" />}
              <Text className="text-white font-bold text-sm uppercase tracking-wide ml-1.5">
                {selectedEntity.type} Details
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedEntity(null)} className="p-1">
              <X size={16} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          {/* Sensor Detail Content */}
          {selectedEntity.type === 'sensor' && (
            <View className="mt-2.5">
              <Text className="text-white font-bold text-sm">
                {selectedEntity.data.locationName}
              </Text>
              <Text className="text-slate-400 text-xs">
                {selectedEntity.data.sensorCode} • {selectedEntity.data.ward}
              </Text>

              <View className="grid grid-cols-3 gap-2 my-2.5">
                <View className="p-2 bg-slate-950 rounded-lg border border-slate-800 items-center">
                  <Text className="text-slate-400 text-[10px]">AQI</Text>
                  <Text className="text-white font-bold text-base">
                    {selectedEntity.data.currentAQI}
                  </Text>
                </View>
                <View className="p-2 bg-slate-950 rounded-lg border border-slate-800 items-center">
                  <Text className="text-slate-400 text-[10px]">PM2.5</Text>
                  <Text className="text-red-400 font-bold text-base">
                    {selectedEntity.data.pm25}
                  </Text>
                </View>
                <View className="p-2 bg-slate-950 rounded-lg border border-slate-800 items-center">
                  <Text className="text-slate-400 text-[10px]">PM10</Text>
                  <Text className="text-orange-400 font-bold text-base">
                    {selectedEntity.data.pm10}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between text-xs mb-3">
                <Text className="text-slate-400 text-xs">Status: <Text className="text-emerald-400 font-semibold">{selectedEntity.data.status}</Text></Text>
                <Text className="text-slate-500 text-xs">{selectedEntity.data.lastUpdated}</Text>
              </View>
            </View>
          )}

          {/* Alert Detail Content */}
          {selectedEntity.type === 'alert' && (
            <View className="mt-2.5">
              <Text className="text-white font-bold text-sm">
                {selectedEntity.data.location}
              </Text>
              <Text className="text-red-400 text-xs font-semibold">
                {selectedEntity.data.metric}: {selectedEntity.data.value} {selectedEntity.data.unit}
              </Text>
              <Text className="text-slate-300 text-xs mt-1" numberOfLines={2}>
                Source: {selectedEntity.data.probableSource}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSelectedAlert(selectedEntity.data as PollutionAlert);
                  setSelectedEntity(null);
                }}
                className="mt-3 py-2 bg-red-600/30 border border-red-500/50 rounded-xl flex-row items-center justify-center space-x-1.5"
              >
                <Eye size={14} color="#FCA5A5" />
                <Text className="text-red-200 text-xs font-semibold ml-1">
                  Open Alert Details
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Report Detail Content */}
          {selectedEntity.type === 'report' && (
            <View className="mt-2.5">
              <Text className="text-white font-bold text-sm">
                {selectedEntity.data.issueType}
              </Text>
              <Text className="text-slate-400 text-xs">{selectedEntity.data.location}</Text>
              <Text className="text-slate-300 text-xs mt-1" numberOfLines={2}>
                {selectedEntity.data.description}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setSelectedReport(selectedEntity.data as PollutionReport);
                  setSelectedEntity(null);
                }}
                className="mt-3 py-2 bg-blue-600/30 border border-blue-500/50 rounded-xl flex-row items-center justify-center space-x-1.5"
              >
                <Eye size={14} color="#93C5FD" />
                <Text className="text-blue-200 text-xs font-semibold ml-1">
                  Review Report
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Hotspot Prediction Content */}
          {selectedEntity.type === 'hotspot' && (
            <View className="mt-2.5">
              <Text className="text-white font-bold text-sm">
                {selectedEntity.data.zoneName}
              </Text>
              <Text className="text-purple-300 text-xs font-semibold">
                AI Risk: {selectedEntity.data.riskSeverity} (Confidence {selectedEntity.data.confidence}%)
              </Text>
              <View className="my-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
                <Text className="text-slate-400 text-[11px]">
                  Forecast: AQI {selectedEntity.data.predictedAQIIn3Hours} in 3 hrs • {selectedEntity.data.predictedAQIIn6Hours} in 6 hrs
                </Text>
              </View>
              <Text className="text-slate-400 text-[11px]">
                {selectedEntity.data.weatherFactor}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};
