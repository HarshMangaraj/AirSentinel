import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { EnvironmentalMap } from '../../components/map/EnvironmentalMap';
import { Radio, Search, Sparkles, Filter, AlertTriangle, ShieldCheck, MapPin } from 'lucide-react-native';
import { MOCK_SENSORS, MOCK_HOTSPOT_PREDICTIONS } from '../../mock/data';
import { getAqiBgClass } from '../../utils';
import { useMapStore } from '../../store/useMapStore';

export default function LiveMapScreen() {
  const { setSelectedPollutant, selectedPollutant } = useMapStore();
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<'sensors' | 'hotspots'>('sensors');

  const filteredSensors = MOCK_SENSORS.filter(
    (s) =>
      s.locationName.toLowerCase().includes(search.toLowerCase()) ||
      s.sensorCode.toLowerCase().includes(search.toLowerCase()) ||
      s.ward.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <View className="max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <View className="flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800">
          <View>
            <Text className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Live Geospatial Environmental Map
            </Text>
            <Text className="text-slate-400 text-xs md:text-sm mt-1">
              Multi-Layered CAAQMS Sensor Telemetry, AI Dispersion Plumes & Risk Clusters
            </Text>
          </View>
        </View>

        {/* Top Fullscreen Map Card */}
        <EnvironmentalMap height={540} showFullControls />

        {/* Lower Grid: Sensor Directory & AI Hotspots */}
        <View className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: CAAQMS Sensor Directory (7 cols) */}
          <View className="lg:col-span-7 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <View className="flex-row items-center space-x-2">
                <Radio size={18} color="#10B981" />
                <Text className="text-white font-bold text-base ml-2">
                  Continuous Telemetry Station Directory ({filteredSensors.length})
                </Text>
              </View>

              <View className="flex-row items-center bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 w-52">
                <Search size={14} color="#64748B" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Filter station..."
                  placeholderTextColor="#64748B"
                  className="ml-2 text-white text-xs flex-1 outline-none bg-transparent"
                />
              </View>
            </View>

            <ScrollView className="max-h-96" showsVerticalScrollIndicator>
              <View className="divide-y divide-slate-850">
                {filteredSensors.map((sensor) => (
                  <View
                    key={sensor.id}
                    className="py-3 flex-row items-center justify-between hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                  >
                    <View className="flex-row items-center space-x-3">
                      <View className="w-9 h-9 rounded-xl bg-slate-800 items-center justify-center">
                        <Radio size={16} color="#34D399" />
                      </View>
                      <View className="ml-2">
                        <Text className="text-white font-bold text-sm">
                          {sensor.locationName}
                        </Text>
                        <Text className="text-slate-400 text-xs">
                          {sensor.sensorCode} • {sensor.ward} ({sensor.zone})
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center space-x-3">
                      <View className="items-end hidden sm:flex">
                        <Text className="text-slate-300 text-xs font-semibold">
                          PM2.5: {sensor.pm25} • PM10: {sensor.pm10}
                        </Text>
                        <Text className="text-slate-500 text-[10px]">
                          Updated {sensor.lastUpdated}
                        </Text>
                      </View>

                      <View className={`px-2.5 py-1 rounded-lg border ${getAqiBgClass(sensor.currentAQI)}`}>
                        <Text className="text-xs font-bold">AQI {sensor.currentAQI}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Right: AI Predictive Hotspots (5 cols) */}
          <View className="lg:col-span-5 bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <View className="flex-row items-center space-x-2">
                <Sparkles size={18} color="#C084FC" />
                <Text className="text-white font-bold text-base ml-2">
                  AI Hotspot Forecasts
                </Text>
              </View>
            </View>

            <ScrollView className="max-h-96 space-y-3" showsVerticalScrollIndicator>
              {MOCK_HOTSPOT_PREDICTIONS.map((hotspot) => (
                <View
                  key={hotspot.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl mb-3"
                >
                  <View className="flex-row items-center justify-between mb-1.5">
                    <Text className="text-white font-bold text-sm">{hotspot.zoneName}</Text>
                    <View className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/40 rounded">
                      <Text className="text-purple-300 text-[10px] font-bold">
                        {hotspot.confidence}% Confidence
                      </Text>
                    </View>
                  </View>

                  <Text className="text-slate-300 text-xs mt-1 font-medium">
                    Primary Factor: {hotspot.primaryContributingSource}
                  </Text>

                  <View className="grid grid-cols-3 gap-2 my-2.5">
                    <View className="p-2 bg-slate-900 rounded-lg items-center border border-slate-800">
                      <Text className="text-slate-400 text-[10px]">Current</Text>
                      <Text className="text-white font-bold text-sm">{hotspot.currentAQI}</Text>
                    </View>
                    <View className="p-2 bg-slate-900 rounded-lg items-center border border-slate-800">
                      <Text className="text-slate-400 text-[10px]">In 3 Hrs</Text>
                      <Text className="text-orange-400 font-bold text-sm">
                        {hotspot.predictedAQIIn3Hours}
                      </Text>
                    </View>
                    <View className="p-2 bg-slate-900 rounded-lg items-center border border-slate-800">
                      <Text className="text-slate-400 text-[10px]">In 6 Hrs</Text>
                      <Text className="text-red-400 font-bold text-sm">
                        {hotspot.predictedAQIIn6Hours}
                      </Text>
                    </View>
                  </View>

                  <Text className="text-slate-500 text-[11px] italic">
                    {hotspot.weatherFactor}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </DashboardLayout>
  );
}
