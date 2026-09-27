import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AlertTriangle, Clock, MapPin, Radio, ChevronRight, Sparkles } from 'lucide-react-native';
import { PollutionAlert } from '../../types';
import { getSeverityBadge, getStatusBadge } from '../../utils';
import { useUIStore } from '../../store/useUIStore';

interface AlertCardProps {
  alert: PollutionAlert;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { setSelectedAlert } = useUIStore();
  const severity = getSeverityBadge(alert.severity);
  const statusClass = getStatusBadge(alert.status);

  return (
    <TouchableOpacity
      onPress={() => setSelectedAlert(alert)}
      activeOpacity={0.85}
      className="p-3.5 bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 rounded-2xl mb-3 shadow-md transition-all group"
    >
      {/* Top Header: Severity + Timestamp + Status */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center space-x-2">
          <View className={`px-2 py-0.5 rounded-md border flex-row items-center space-x-1 ${severity.bg}`}>
            <View className={`w-2 h-2 rounded-full ${severity.dot}`} />
            <Text className="text-[11px] font-bold uppercase tracking-wider ml-1">
              {severity.text}
            </Text>
          </View>

          <View className={`px-2 py-0.5 rounded border ${statusClass}`}>
            <Text className="text-[10px] font-semibold">{alert.status}</Text>
          </View>
        </View>

        <View className="flex-row items-center space-x-1">
          <Clock size={12} color="#64748B" />
          <Text className="text-slate-400 text-[11px] ml-1">{alert.timestamp}</Text>
        </View>
      </View>

      {/* Main Alert Info */}
      <View className="flex-row items-start justify-between">
        <View className="flex-1 mr-2">
          <View className="flex-row items-center space-x-1">
            <Radio size={13} color="#94A3B8" />
            <Text className="text-slate-300 text-xs font-semibold ml-1">
              {alert.sensorModel} • {alert.location}
            </Text>
          </View>

          <View className="flex-row items-center space-x-2 mt-1.5">
            <Text className="text-white font-extrabold text-base">
              {alert.metric}: <Text className="text-red-400">{alert.value} {alert.unit}</Text>
            </Text>
            <Text className="text-slate-500 text-xs">(Limit: {alert.threshold})</Text>
          </View>

          <View className="flex-row items-center space-x-1 mt-1 bg-slate-950/70 px-2 py-1 rounded-lg border border-slate-800/80">
            <Sparkles size={12} color="#A855F7" />
            <Text className="text-purple-300 text-[11px] font-medium flex-1 ml-1" numberOfLines={1}>
              Source: {alert.probableSource} ({alert.confidenceScore}% conf)
            </Text>
          </View>
        </View>

        <View className="w-8 h-8 rounded-lg bg-slate-800 items-center justify-center self-center group-hover:bg-slate-700">
          <ChevronRight size={16} color="#94A3B8" />
        </View>
      </View>
    </TouchableOpacity>
  );
};
