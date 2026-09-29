import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CircularGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  category?: string;
  color?: string;
}

export const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  maxValue = 500,
  size = 148,
  strokeWidth = 12,
  label = 'AQI',
  category,
  color = '#10B981',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / maxValue, 0.04), 1);
  const strokeDashoffset = circumference * (1 - pct);

  // Gradient ID based on color
  const gradId = `gaugeGrad-${color.replace('#', '')}`;

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center relative">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="1" />
            <Stop offset="100%" stopColor="#10B981" stopOpacity="0.8" />
          </LinearGradient>
        </Defs>

        {/* Background Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress Arc */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center Value & Labels */}
      <View className="items-center justify-center">
        <Text className="text-4xl md:text-5xl font-black text-white tracking-tighter">
          {value}
        </Text>
        <Text className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
          {label}
        </Text>
        {category && (
          <View
            className="px-2 py-0.5 rounded-full mt-1 border"
            style={{
              backgroundColor: `${color}18`,
              borderColor: `${color}40`,
            }}
          >
            <Text className="text-[10px] font-extrabold uppercase" style={{ color }}>
              {category}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
