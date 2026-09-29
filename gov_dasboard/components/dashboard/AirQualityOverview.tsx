import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Wind, Gauge, ShieldAlert, Activity, Info } from 'lucide-react-native';
import { AqiTrendChart } from './AqiTrendChart';
import { getAqiCategory, getAqiBgClass } from '../../utils';
import { fetchFromBackend } from '../../services/apiConfig';

interface HotspotData {
  available: boolean;
  baseline_mean_aqi?: number;
  hotspots: { city: string; aqi: number; lat: number; lon: number; anomaly_score: number }[];
}

const STATIC_POLLUTANTS = [
  { name: 'PM2.5', value: 268.0, unit: 'µg/m³', limit: 60, status: 'Hazardous', ratio: '4.4x' },
  { name: 'PM10', value: 395.0, unit: 'µg/m³', limit: 100, status: 'Severe', ratio: '3.9x' },
  { name: 'NO2', value: 114.0, unit: 'µg/m³', limit: 80, status: 'Poor', ratio: '1.4x' },
  { name: 'SO2', value: 65.0, unit: 'µg/m³', limit: 80, status: 'Moderate', ratio: '0.8x' },
  { name: 'CO', value: 4.2, unit: 'mg/m³', limit: 2.0, status: 'Poor', ratio: '2.1x' },
  { name: 'O3', value: 72.0, unit: 'µg/m³', limit: 100, status: 'Moderate', ratio: '0.7x' },
];

function getAqiSeverityLabel(aqi: number) {
  if (aqi <= 50) return { label: 'GOOD – SAFE FOR ALL', color: 'text-emerald-400' };
  if (aqi <= 100) return { label: 'MODERATE – SENSITIVE GROUPS', color: 'text-yellow-400' };
  if (aqi <= 150) return { label: 'POOR – UNHEALTHY FOR SENSITIVE', color: 'text-orange-400' };
  if (aqi <= 200) return { label: 'VERY POOR – HEALTH RISK', color: 'text-red-400' };
  if (aqi <= 300) return { label: 'SEVERE HEALTH HAZARD', color: 'text-red-400' };
  return { label: 'HAZARDOUS – EMERGENCY MEASURES', color: 'text-red-500' };
}

function getGrapStage(aqi: number) {
  if (aqi > 300) return { stage: 'GRAP Stage-IV Active', color: 'bg-red-950/40 border-red-800/50', textColor: 'text-red-300' };
  if (aqi > 200) return { stage: 'GRAP Stage-III Active', color: 'bg-orange-950/40 border-orange-800/50', textColor: 'text-orange-300' };
  if (aqi > 150) return { stage: 'GRAP Stage-II Active', color: 'bg-amber-950/40 border-amber-800/50', textColor: 'text-amber-300' };
  return { stage: 'GRAP Stage-I Active', color: 'bg-yellow-950/40 border-yellow-800/50', textColor: 'text-yellow-300' };
}

export const AirQualityOverview: React.FC = () => {
  const [currentAQI, setCurrentAQI] = useState(328);
  const [topCity, setTopCity] = useState<string>('Delhi NCR');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    async function fetchLiveAQI() {
      try {
        const data = await fetchFromBackend<HotspotData>('/hotspots/ai');
        if (data && data.available && data.hotspots.length > 0) {
          // Use the highest AQI city as the prominent reading
          const worst = data.hotspots.reduce((prev, curr) => (curr.aqi > prev.aqi ? curr : prev), data.hotspots[0]);
          setCurrentAQI(worst.aqi);
          setTopCity(worst.city);
          setIsLive(true);
        } else if (data && data.baseline_mean_aqi) {
          setCurrentAQI(Math.round(data.baseline_mean_aqi));
          setIsLive(true);
        }
      } catch (e) {
        // Keep static value
      }
    }

    fetchLiveAQI();
    const interval = setInterval(fetchLiveAQI, 30000);
    return () => clearInterval(interval);
  }, []);

  const aqiCategory = getAqiCategory(currentAQI);
  const severity = getAqiSeverityLabel(currentAQI);
  const grap = getGrapStage(currentAQI);

  // Live-derived pollutant estimates based on actual AQI
  const ratio = currentAQI / 328;
  const pollutants = STATIC_POLLUTANTS.map((p) => ({
    ...p,
    value: p.name === 'CO' ? Math.round(p.value * ratio * 10) / 10 : Math.round(p.value * ratio),
    ratio: `${Math.round((p.value * ratio) / p.limit * 10) / 10}x`,
    status:
      (p.value * ratio) / p.limit > 3
        ? 'Hazardous'
        : (p.value * ratio) / p.limit > 2
        ? 'Severe'
        : (p.value * ratio) / p.limit > 1
        ? 'Poor'
        : 'Moderate',
  }));

  return (
    <View className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 md:p-5 shadow-xl mb-6">
      {/* Panel Header */}
      <View className="flex-row items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 items-center justify-center">
            <Gauge size={18} color="#34D399" />
          </View>
          <View className="ml-2.5">
            <View className="flex-row items-center space-x-2">
              <Text className="text-white font-bold text-base">
                Air Quality &amp; Atmospheric Overview
              </Text>
              {isLive && (
                <View className="flex-row items-center px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full ml-2">
                  <View className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1" />
                  <Text className="text-emerald-300 text-[10px] font-bold">LIVE</Text>
                </View>
              )}
            </View>
            <Text className="text-slate-400 text-xs">
              Continuous Ambient Air Quality Monitoring Station (CAAQMS) Telemetry · {topCity}
            </Text>
          </View>
        </View>

        <View className={`px-2.5 py-1 border rounded-lg flex-row items-center space-x-1 ${grap.color}`}>
          <ShieldAlert size={14} color="#EF4444" />
          <Text className={`text-xs font-semibold ml-1 ${grap.textColor}`}>
            {grap.stage}
          </Text>
        </View>
      </View>

      {/* Grid: Left AQI Gauge + Right Pollutants */}
      <View className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-5">
        {/* Left: Overall AQI Meter */}
        <View className="lg:col-span-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 flex-col justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
              {isLive ? `${topCity} AQI` : 'City Aggregate AQI'}
            </Text>
            <View className={`px-2.5 py-0.5 rounded-full border ${getAqiBgClass(currentAQI)}`}>
              <Text className="text-xs font-bold">{aqiCategory}</Text>
            </View>
          </View>

          <View className="my-4 items-center justify-center">
            <Text className="text-6xl font-black text-white tracking-tighter">
              {currentAQI}
            </Text>
            <Text className={`font-bold text-sm tracking-wide mt-1 ${severity.color}`}>
              {severity.label}
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
              {currentAQI > 300
                ? 'Mandatory ban on diesel generators & heavy construction. Emergency water mist cannon deployment advised.'
                : currentAQI > 200
                ? 'Restrict outdoor activities. Monitor industrial emission points. Alert field teams.'
                : 'Maintain monitoring. Issue citizen advisories for sensitive groups.'}
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
