import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import {
  Wind,
  Gauge,
  ShieldAlert,
  Activity,
  Info,
  Sparkles,
  Flame,
  Car,
  Factory,
  Compass,
  MapPin,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CloudSun,
} from 'lucide-react-native';
import { CircularGauge } from '../common/CircularGauge';
import { AqiTrendChart } from './AqiTrendChart';
import { airQualityService, RealtimePollutants, RealtimeAttribution } from '../../services/airQuality';
import { getAqiCategory, getAqiColor, getAqiBgClass } from '../../utils';

export const AirQualityOverview: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState({ name: 'Delhi NCR', lat: 28.6139, lon: 77.209 });

  // 1. Live Pollutants (PM2.5, PM10, NO2, SO2, CO, O3) directly from backend / Open-Meteo
  const {
    data: pollutants,
    isLoading: pollutantsLoading,
    refetch: refetchPollutants,
    isFetching: isFetchingPollutants,
  } = useQuery({
    queryKey: ['live-pollutants', selectedCity.lat, selectedCity.lon],
    queryFn: () => airQualityService.getPollutants(selectedCity.lat, selectedCity.lon),
    refetchInterval: 30000,
  });

  // 2. Live Weather from backend / Open-Meteo
  const { data: weather } = useQuery({
    queryKey: ['live-weather-overview', selectedCity.lat, selectedCity.lon],
    queryFn: () => airQualityService.getWeather(selectedCity.lat, selectedCity.lon),
    refetchInterval: 60000,
  });

  // 3. Live AI Source Attribution
  const { data: attribution } = useQuery({
    queryKey: ['live-attribution'],
    queryFn: () => airQualityService.getAttribution('delhi'),
    refetchInterval: 60000,
  });

  // Calculate AQI from live PM2.5 or standard formula
  const pm25 = pollutants?.pm2_5 ?? 45;
  const pm10 = pollutants?.pm10 ?? 88;

  // Real US AQI approximation from live PM2.5
  const currentAQI = Math.min(
    500,
    Math.round(
      pm25 <= 12
        ? (pm25 / 12) * 50
        : pm25 <= 35.4
        ? 51 + ((pm25 - 12.1) / (35.4 - 12.1)) * 49
        : pm25 <= 55.4
        ? 101 + ((pm25 - 35.5) / (55.4 - 35.5)) * 49
        : pm25 <= 150.4
        ? 151 + ((pm25 - 55.5) / (150.4 - 55.5)) * 49
        : pm25 <= 250.4
        ? 201 + ((pm25 - 150.5) / (250.4 - 150.5)) * 99
        : 301 + ((pm25 - 250.5) / (350.4 - 250.5)) * 99
    )
  );

  const aqiCat = getAqiCategory(currentAQI);
  const aqiHex = getAqiColor(currentAQI);

  // GRAP regulatory status
  const grapStage =
    currentAQI > 300
      ? { stage: 'GRAP Stage-IV Active', color: 'bg-red-950/60 border-red-800 text-red-300' }
      : currentAQI > 200
      ? { stage: 'GRAP Stage-III Active', color: 'bg-orange-950/60 border-orange-800 text-orange-300' }
      : currentAQI > 150
      ? { stage: 'GRAP Stage-II Active', color: 'bg-amber-950/60 border-amber-800 text-amber-300' }
      : { stage: 'GRAP Stage-I Active', color: 'bg-emerald-950/60 border-emerald-800 text-emerald-300' };

  // App-style pollutant cards definitions with real-time numbers
  const pollutantCards = [
    {
      code: 'PM2.5',
      name: 'Fine Particulates',
      value: pollutants?.pm2_5 ?? '--',
      unit: 'µg/m³',
      limit: 60,
      badgeColor: '#EF4444',
      badgeBg: 'bg-red-500/15 border-red-500/30 text-red-400',
    },
    {
      code: 'PM10',
      name: 'Respirable Dust',
      value: pollutants?.pm10 ?? '--',
      unit: 'µg/m³',
      limit: 100,
      badgeColor: '#F97316',
      badgeBg: 'bg-orange-500/15 border-orange-500/30 text-orange-400',
    },
    {
      code: 'NO2',
      name: 'Nitrogen Dioxide',
      value: pollutants?.no2 ?? '--',
      unit: 'µg/m³',
      limit: 80,
      badgeColor: '#3B82F6',
      badgeBg: 'bg-blue-500/15 border-blue-500/30 text-blue-400',
    },
    {
      code: 'SO2',
      name: 'Sulphur Dioxide',
      value: pollutants?.so2 ?? '--',
      unit: 'µg/m³',
      limit: 80,
      badgeColor: '#A855F7',
      badgeBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
    },
    {
      code: 'CO',
      name: 'Carbon Monoxide',
      value: pollutants?.co ?? '--',
      unit: 'mg/m³',
      limit: 2.0,
      badgeColor: '#10B981',
      badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
    },
    {
      code: 'O3',
      name: 'Surface Ozone',
      value: pollutants?.o3 ?? '--',
      unit: 'µg/m³',
      limit: 100,
      badgeColor: '#0EA5E9',
      badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    },
  ];

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-2xl mb-6 backdrop-blur-md">
      {/* 1. Header Bar: Title, Live Telemetry Pill, Weather, Refresh */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4 flex-wrap gap-2">
        <View className="flex-row items-center space-x-2.5">
          <View className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 items-center justify-center shadow-lg shadow-emerald-950">
            <Gauge size={19} color="#FFFFFF" strokeWidth={2.4} />
          </View>
          <View className="ml-2.5">
            <View className="flex-row items-center space-x-2">
              <Text className="text-white font-extrabold text-base tracking-tight">
                Live Atmospheric Telemetry
              </Text>
              <View className="flex-row items-center px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full ml-1.5">
                <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse" />
                <Text className="text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  Realtime
                </Text>
              </View>
            </View>
            <View className="flex-row items-center mt-0.5 space-x-2">
              <MapPin size={11} color="#34D399" />
              <Text className="text-slate-400 text-xs">
                {selectedCity.name} Continuous CAAQMS &bull; Open-Meteo Live Feed
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center space-x-2">
          {/* Weather quick pill */}
          {weather && (
            <View className="hidden sm:flex flex-row items-center px-3 py-1 bg-slate-950/80 border border-slate-800 rounded-xl space-x-2">
              <CloudSun size={15} color="#F59E0B" />
              <Text className="text-xs font-semibold text-slate-200 ml-1">
                {weather.temperature}°C &bull; {weather.windDirection} {weather.windSpeed} km/h
              </Text>
            </View>
          )}

          {/* GRAP regulatory badge */}
          <View className={`px-2.5 py-1 border rounded-xl flex-row items-center space-x-1.5 ${grapStage.color}`}>
            <ShieldAlert size={14} color="#EF4444" />
            <Text className="text-xs font-bold ml-1">{grapStage.stage}</Text>
          </View>

          {/* Refresh button */}
          <TouchableOpacity
            onPress={() => refetchPollutants()}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 ml-1"
          >
            <RefreshCw size={13} color={isFetchingPollutants ? '#10B981' : '#94A3B8'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Hero Air Quality Section: App-style Circular Gauge + Real-time Status Card */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5 items-stretch">
        {/* Left: Signature App-Style Circular Gauge Card */}
        <View className="lg:col-span-5 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex-col items-center justify-between shadow-inner">
          <View className="w-full flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Consensus AQI Index
            </Text>
            <View className={`px-2.5 py-0.5 rounded-full border ${getAqiBgClass(currentAQI)}`}>
              <Text className="text-xs font-extrabold">{aqiCat}</Text>
            </View>
          </View>

          {/* Radial SVG Gauge matching mobile app */}
          <View className="my-2 items-center justify-center">
            {pollutantsLoading ? (
              <View className="w-36 h-36 items-center justify-center">
                <ActivityIndicator size="small" color="#10B981" />
              </View>
            ) : (
              <CircularGauge
                value={currentAQI}
                maxValue={500}
                size={148}
                strokeWidth={13}
                label="AQI"
                category={aqiCat}
                color={aqiHex}
              />
            )}
          </View>

          {/* Real-time statutory directive / recommendation */}
          <View className="w-full bg-slate-900/90 border border-slate-800/90 p-2.5 rounded-xl mt-2">
            <View className="flex-row items-center space-x-1.5 mb-1">
              <Info size={12} color="#60A5FA" />
              <Text className="text-[11px] font-bold text-blue-300 ml-1">
                Statutory Advisory
              </Text>
            </View>
            <Text className="text-[11px] text-slate-300 leading-4">
              {currentAQI > 300
                ? 'Mandatory halt on heavy construction. Anti-smog water cannons deployed.'
                : currentAQI > 200
                ? 'High particulate load. Sensitive groups remain indoors. Mechanical sweepers active.'
                : currentAQI > 100
                ? 'Moderate pollution level. Industrial scrubbers in normal compliance.'
                : 'Clean ambient air. Compliant with statutory clean air targets.'}
            </Text>
          </View>
        </View>

        {/* Right: Real-time Pollutant Grid matching Mobile App Chips */}
        <View className="lg:col-span-7 flex-col justify-between">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider">
              Real-time Pollutant Telemetry
            </Text>
            <Text className="text-slate-500 text-[11px]">National Ambient Air Quality Standards</Text>
          </View>

          {/* 6 Pollutant Cards Grid */}
          <View className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 flex-1">
            {pollutantCards.map((p) => {
              const val = typeof p.value === 'number' ? p.value : 0;
              const ratio = Math.round((val / p.limit) * 10) / 10;
              const isOverLimit = val > p.limit;

              return (
                <View
                  key={p.code}
                  className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-white font-black text-sm">{p.code}</Text>
                    <View className={`px-1.5 py-0.2 rounded border ${p.badgeBg}`}>
                      <Text className="text-[10px] font-bold">
                        {isOverLimit ? `${ratio}x limit` : 'Safe'}
                      </Text>
                    </View>
                  </View>

                  <View className="my-1.5">
                    <Text className="text-2xl font-black text-white tracking-tight">
                      {p.value}
                    </Text>
                    <Text className="text-slate-400 text-[10px]" numberOfLines={1}>
                      {p.unit} &bull; {p.name}
                    </Text>
                  </View>

                  {/* Progress bar vs limit */}
                  <View className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden mt-1">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (val / (p.limit * 2.5)) * 100)}%`,
                        backgroundColor: isOverLimit ? p.badgeColor : '#10B981',
                      }}
                    />
                  </View>
                  <Text className="text-slate-500 text-[9px] mt-1">
                    NAAQS Std: {p.limit} {p.unit}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* 3. Live AI Source Attribution (From Backend /attribution) */}
      {attribution && (
        <View className="p-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl mb-5">
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center space-x-2">
              <Sparkles size={14} color="#A855F7" />
              <Text className="text-white font-bold text-xs ml-1">
                Real-time AI Source Attribution
              </Text>
            </View>
            <Text className="text-purple-300 text-[11px] font-semibold">
              Live Primary Cause: <Text className="text-white capitalize">{attribution.probable_cause}</Text>
            </Text>
          </View>

          <Text className="text-slate-400 text-[11px] mb-3 leading-4">
            {attribution.explanation}
          </Text>

          {/* Progress bar strips */}
          <View className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {attribution.contributions.map((c) => (
              <View key={c.source} className="p-2 bg-slate-900/80 rounded-lg border border-slate-800/80">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-slate-300 text-[11px] font-semibold" numberOfLines={1}>
                    {c.source}
                  </Text>
                  <Text className="text-white font-bold text-xs ml-1">{c.percentage}%</Text>
                </View>
                <View className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 4. 24-Hour Real-time Trend Analytics Chart */}
      <AqiTrendChart />
    </View>
  );
};
