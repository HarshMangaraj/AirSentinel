import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Layers, Radio, AlertTriangle, FileText, Sparkles, Filter } from 'lucide-react-native';
import { useMapStore, MapLayerType, PollutantFilter } from '../../store/useMapStore';

export const MapFilters: React.FC = () => {
  const {
    activeLayers,
    toggleLayer,
    selectedPollutant,
    setSelectedPollutant,
    severityFilter,
    setSeverityFilter,
  } = useMapStore();

  const layers: { key: MapLayerType; label: string; icon: any; color: string }[] = [
    { key: 'sensors', label: 'Sensors', icon: Radio, color: '#10B981' },
    { key: 'alerts', label: 'Alerts', icon: AlertTriangle, color: '#EF4444' },
    { key: 'reports', label: 'Citizen Reports', icon: FileText, color: '#3B82F6' },
    { key: 'predictions', label: 'AI Hotspots', icon: Sparkles, color: '#A855F7' },
  ];

  const pollutants: PollutantFilter[] = ['AQI', 'PM2.5', 'PM10', 'NO2', 'SO2'];
  const severities = ['All', 'Critical', 'High', 'Medium', 'Low'];

  return (
    <View className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-xl space-y-3">
      {/* Layer Toggles */}
      <View>
        <Text className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex-row items-center">
          <Layers size={13} color="#10B981" /> Map Layers
        </Text>
        <View className="flex-row flex-wrap gap-1.5">
          {layers.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayers[layer.key];
            return (
              <TouchableOpacity
                key={layer.key}
                onPress={() => toggleLayer(layer.key)}
                className={`flex-row items-center px-2.5 py-1.5 rounded-lg border transition-all ${
                  isActive
                    ? 'bg-slate-800 border-slate-600'
                    : 'bg-slate-950/60 border-slate-800 opacity-50'
                }`}
              >
                <Icon size={13} color={isActive ? layer.color : '#64748B'} />
                <Text
                  className={`text-xs ml-1.5 font-medium ${
                    isActive ? 'text-slate-100' : 'text-slate-400 line-through'
                  }`}
                >
                  {layer.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Pollutant Metric Filter */}
      <View className="pt-2 border-t border-slate-800">
        <Text className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Metric Overlay
        </Text>
        <View className="flex-row flex-wrap gap-1">
          {pollutants.map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setSelectedPollutant(p)}
              className={`px-2.5 py-1 rounded-md border text-xs font-semibold ${
                selectedPollutant === p
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  selectedPollutant === p ? 'text-emerald-300' : 'text-slate-400'
                }`}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Severity Filter */}
      <View className="pt-2 border-t border-slate-800">
        <Text className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
          Severity Filter
        </Text>
        <View className="flex-row flex-wrap gap-1">
          {severities.map((sev) => (
            <TouchableOpacity
              key={sev}
              onPress={() => setSeverityFilter(sev)}
              className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                severityFilter === sev
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400'
              }`}
            >
              <Text
                className={`text-[11px] font-medium ${
                  severityFilter === sev ? 'text-blue-300' : 'text-slate-400'
                }`}
              >
                {sev}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
