import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path, Defs, LinearGradient, Stop, Circle, Line, Text as SvgText } from 'react-native-svg';
import { TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react-native';
import { airQualityService } from '../../services/airQuality';
import { getAqiColor, getAqiCategory } from '../../utils';

export const AqiTrendChart: React.FC = () => {
  const [timeframe, setTimeframe] = useState<'1h' | '6h' | '24h' | '7d'>('24h');

  const { data: trendData, isLoading, isError, refetch } = useQuery({
    queryKey: ['aqi-trend', timeframe],
    queryFn: () => airQualityService.getAqiTrend(timeframe),
  });

  if (isLoading) {
    return (
      <View className="h-64 items-center justify-center bg-slate-950/40 rounded-xl">
        <ActivityIndicator size="small" color="#10B981" />
        <Text className="text-slate-400 text-xs mt-2">Loading AQI telemetry trend...</Text>
      </View>
    );
  }

  if (isError || !trendData || trendData.length === 0) {
    return (
      <View className="h-64 items-center justify-center bg-slate-950/40 rounded-xl p-4">
        <Text className="text-red-400 text-xs mb-2">Error loading trend chart</Text>
        <TouchableOpacity onPress={() => refetch()} className="px-3 py-1 bg-red-900/30 rounded border border-red-800">
          <Text className="text-xs text-red-200">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Calculate SVG curve coordinates
  const aqiValues = trendData.map((d) => d.aqi);
  const minVal = Math.max(0, Math.min(...aqiValues) - 20);
  const maxVal = Math.max(...aqiValues) + 30;
  const range = maxVal - minVal || 1;

  const chartWidth = 520;
  const chartHeight = 160;
  const paddingLeft = 35;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = chartWidth - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const points = trendData.map((item, index) => {
    const x = paddingLeft + (index / (trendData.length - 1 || 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((item.aqi - minVal) / range) * innerHeight;
    return { x, y, aqi: item.aqi, label: item.timestamp };
  });

  const pathD = points.reduce((acc, curr, index) => {
    return index === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`;

  const latestAqi = aqiValues[aqiValues.length - 1];
  const previousAqi = aqiValues[0];
  const isWorsening = latestAqi >= previousAqi;

  return (
    <View className="w-full">
      {/* Header with Time Filters */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center space-x-2">
          <View className="flex-row items-center space-x-1 px-2 py-0.5 bg-slate-800 rounded border border-slate-700">
            {isWorsening ? (
              <TrendingUp size={12} color="#EF4444" />
            ) : (
              <TrendingDown size={12} color="#10B981" />
            )}
            <Text className={`text-[11px] font-semibold ml-1 ${isWorsening ? 'text-red-400' : 'text-emerald-400'}`}>
              {isWorsening ? 'Particulate Load Rising' : 'Air Quality Improving'}
            </Text>
          </View>
        </View>

        {/* Timeframe selector */}
        <View className="flex-row items-center bg-slate-950 p-1 rounded-xl border border-slate-800 space-x-1">
          {(['1h', '6h', '24h', '7d'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg ${
                timeframe === t ? 'bg-emerald-600/30 border border-emerald-500/50' : 'hover:bg-slate-800'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  timeframe === t ? 'text-emerald-300' : 'text-slate-400'
                }`}
              >
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SVG Chart */}
      <View className="w-full overflow-hidden items-center justify-center bg-slate-950/60 rounded-xl border border-slate-800/80 p-2">
        <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <Defs>
            <LinearGradient id="aqiAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
              <Stop offset="50%" stopColor="#F59E0B" stopOpacity="0.2" />
              <Stop offset="100%" stopColor="#10B981" stopOpacity="0.02" />
            </LinearGradient>
            <LinearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor="#34D399" />
              <Stop offset="50%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#EF4444" />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const gridY = paddingTop + innerHeight * (1 - ratio);
            const gridVal = Math.round(minVal + range * ratio);
            return (
              <React.Fragment key={i}>
                <Line
                  x1={paddingLeft}
                  y1={gridY}
                  x2={chartWidth - paddingRight}
                  y2={gridY}
                  stroke="#334155"
                  strokeWidth="0.8"
                  strokeDasharray="3 3"
                />
                <SvgText
                  x={paddingLeft - 6}
                  y={gridY + 3}
                  fontSize="9"
                  fill="#64748B"
                  textAnchor="end"
                >
                  {gridVal}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* Area under curve */}
          <Path d={areaD} fill="url(#aqiAreaGradient)" />

          {/* Line Stroke */}
          <Path d={pathD} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" />

          {/* Data Points */}
          {points.map((p, idx) => (
            <React.Fragment key={idx}>
              <Circle cx={p.x} cy={p.y} r="3.5" fill={getAqiColor(p.aqi)} stroke="#0F172A" strokeWidth="1.5" />
              {/* X-axis labels */}
              {(idx === 0 || idx === Math.floor(points.length / 2) || idx === points.length - 1) && (
                <SvgText
                  x={p.x}
                  y={chartHeight - 8}
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="middle"
                >
                  {p.label}
                </SvgText>
              )}
            </React.Fragment>
          ))}
        </Svg>
      </View>
    </View>
  );
};
