import React from 'react';
import { View, Text } from 'react-native';

export const MapLegend: React.FC = () => {
  const legendItems = [
    { label: 'Good (0-50)', color: '#10B981' },
    { label: 'Moderate (51-100)', color: '#84CC16' },
    { label: 'Poor (101-200)', color: '#F59E0B' },
    { label: 'Very Poor (201-300)', color: '#EF4444' },
    { label: 'Severe / Hazardous (301+)', color: '#7F1D1D' },
    { label: 'Offline / Warning', color: '#64748B' },
  ];

  return (
    <View className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-lg">
      <Text className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
        AQI Severity Legend
      </Text>
      <View className="flex-row flex-wrap gap-x-3 gap-y-1.5">
        {legendItems.map((item, idx) => (
          <View key={idx} className="flex-row items-center space-x-1.5">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <Text className="text-[11px] text-slate-300 ml-1 font-medium">{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
