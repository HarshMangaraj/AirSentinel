import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polyline, Circle, Line } from 'react-native-svg';
import { AqiHistoryPoint } from '../lib/api';
import { type as typeScale } from '../theme/tokens';

type Props = {
  readings: AqiHistoryPoint[];
  color: string;
  mutedColor: string;
  width?: number;
  height?: number;
};

export function TrendChart({ readings, color, mutedColor, width = 300, height = 120 }: Props) {
  if (readings.length < 2) {
    return (
      <View style={{ height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={[typeScale.small, { color: mutedColor }]}>Not enough history yet</Text>
      </View>
    );
  }

  const values = readings.map((r) => r.aqi);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 10;

  const points = readings
    .map((r, i) => {
      const x = padding + (i / (readings.length - 1)) * (width - padding * 2);
      const y = height - padding - ((r.aqi - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const lastX = padding + (width - padding * 2);
  const lastY = height - padding - ((values[values.length - 1] - min) / range) * (height - padding * 2);

  return (
    <Svg width={width} height={height}>
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke={mutedColor} strokeOpacity={0.2} />
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={lastX} cy={lastY} r={4} fill={color} />
    </Svg>
  );
}