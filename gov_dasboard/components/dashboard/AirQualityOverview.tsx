import React from 'react';
import { View, Text } from 'react-native';
import { Wind, Gauge, ShieldAlert, Activity, Info } from 'lucide-react-native';
import { AqiTrendChart } from './AqiTrendChart';
import { getAqiCategory, getAqiBgClass } from '../../utils';

export const AirQualityOverview: React.FC = () => {
  const currentAQI = 328;
  const aqiCategory = getAqiCategory(currentAQI);

  const pollutants = [
    { name: 'PM2.5', value: 268.0, unit: 'µg/m³', limit: 60, status: 'Hazardous', ratio: '4.4x' },
    { name: 'PM10', value: 395.0, unit: 'µg/m³', limit: 100, status: 'Severe', ratio: '3.9x' },
    { name: 'NO2', value: 114.0, unit: 'µg/m³', limit: 80, status: 'Poor', ratio: '1.4x' },
    { name: 'SO2', value: 65.0, unit: 'µg/m³', limit: 80, status: 'Moderate', ratio: '0.8x' },
    { name: 'CO', value: 4.2, unit: 'mg/m³', limit: 2.0, status: 'Poor', ratio: '2.1x' },
    { name: 'O3', value: 72.0, unit: 'µg/m³', limit: 100, status: 'Moderate', ratio: '0.7x' },
  ];

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl mb-6">
      {/* Panel Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
            <Gauge size={18} color="#34D399" />
          </View>
          <View className="ml-2.5">
            <Text className="text-white font-bold text-base">
              Air Quality & Atmospheric Overview
            </Text>
            <Text className="text-slate-400 text-xs">
              Continuous Ambient Air Quality Monitoring Station (CAAQMS) Telemetry
            </Text>
          </View>
        </View>

        <View className="px-2.5 py-1 bg-red-950/40 border border-red-800/50 rounded-lg flex-row items-center space-x-1">
          <ShieldAlert size={14} color="#EF4444" />
          <Text className="text-red-300 text-xs font-semibold ml-1">
            GRAP Stage-IV Active
          </Text>
        </View>
      </View>

      {/* Grid: Left AQI Gauge + Right Pollutants */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Left: Overall AQI Meter */}
        <View className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex-col justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              City Aggregate AQI
            </Text>
            <View className={`px-2.5 py-0.5 rounded-full border ${getAqiBgClass(currentAQI)}`}>
              <Text className="text-xs font-bold">{aqiCategory}</Text>
            </View>
          </View>

          <View className="my-4 items-center justify-center">
            <Text className="text-6xl font-black text-white tracking-tighter">
              {currentAQI}
            </Text>
            <Text className="text-red-400 font-bold text-sm tracking-wide mt-1">
              SEVERE HEALTH HAZARD
            </Text>
            <Text className="text-slate-400 text-xs text-center mt-1">
              Prominent Pollutant: <Text className="text-white font-semibold">PM2.5</Text>
            </Text>
          </View>

          <View className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl">
            <View className="flex-row items-center space-x-1.5 mb-1">
              <Info size={12} color="#60A5FA" />
              <Text className="text-[11px] font-semibold text-blue-300 ml-1">
                Authority Advisory
              </Text>
            </View>
            <Text className="text-[11px] text-slate-300 leading-4">
              Mandatory ban on diesel generators & heavy construction. Water mist cannon mobilization advised.
            </Text>
          </View>
        </View>

        {/* Right: Detailed Pollutant Grid */}
        <View className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {pollutants.map((p) => {
            const isExceeded = p.value > p.limit;
            return (
              <View
                key={p.name}
                className={`p-3 rounded-xl border flex-col justify-between ${
                  isExceeded
                    ? 'bg-slate-950/80 border-slate-800/90'
                    : 'bg-slate-950/40 border-slate-850'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-bold text-sm">{p.name}</Text>
                  <View
                    className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isExceeded ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${
                        isExceeded ? 'text-red-400' : 'text-emerald-400'
                      }`}
                    >
                      {p.ratio} limit
                    </Text>
                  </View>
                </View>

                <View className="my-2">
                  <Text className="text-2xl font-extrabold text-white">{p.value}</Text>
                  <Text className="text-slate-400 text-[11px]">{p.unit}</Text>
                </View>

                <View className="flex-row items-center justify-between pt-1.5 border-t border-slate-800/70">
                  <Text className="text-slate-500 text-[10px]">Std: {p.limit} {p.unit}</Text>
                  <Text
                    className={`text-[10px] font-semibold ${
                      p.status === 'Hazardous'
                        ? 'text-red-400'
                        : p.status === 'Severe'
                        ? 'text-orange-400'
                        : p.status === 'Poor'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {p.status}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* AQI Trend Chart */}
      <AqiTrendChart />
    </View>
  );
};
