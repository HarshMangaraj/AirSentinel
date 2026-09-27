import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck, Wind, Cpu } from 'lucide-react-native';

export const Footer: React.FC = () => {
  return (
    <View className="bg-slate-950 border-t border-slate-800/80 px-6 py-4 flex-col md:flex-row items-center justify-between mt-auto">
      <View className="flex-row items-center space-x-3 mb-2 md:mb-0">
        <View className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/40 items-center justify-center">
          <Wind size={14} color="#34D399" />
        </View>
        <Text className="text-slate-200 text-xs font-semibold">
          AirSentinel • Environmental Monitoring & Response System
        </Text>
      </View>

      <View className="flex-row items-center space-x-4">
        <View className="flex-row items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-800/40 rounded-md">
          <ShieldCheck size={13} color="#34D399" />
          <Text className="text-emerald-300 text-[11px] font-medium ml-1">
            Authorized Government Access
          </Text>
        </View>

        <View className="flex-row items-center space-x-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md">
          <Cpu size={13} color="#94A3B8" />
          <Text className="text-slate-400 text-[11px] ml-1">
            Telemetry Engine v1.0.0
          </Text>
        </View>
      </View>
    </View>
  );
};
