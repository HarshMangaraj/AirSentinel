import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { CircularGauge } from '../components/CircularGauge';
import { TrendChart } from '../components/TrendChart';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrentAqi, getPrediction, getCities, getWeather, getAqiHistory, AqiReading, Weather, AqiHistory } from '../lib/api';
import { getDeviceLocation, reverseGeocode } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { spacing, type as typeScale, radius } from '../theme/tokens';

function aqiColorFor(colors: any, aqi: number | null) {
  if (aqi === null) return colors.muted;
  if (aqi <= 50) return colors.aqi.good;
  if (aqi <= 100) return colors.aqi.moderate;
  if (aqi <= 200) return colors.aqi.unhealthy;
  return colors.aqi.hazardous;
}

export function HomeScreen({ navigation }: any) {
  const { session } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [locationLabel, setLocationLabel] = useState('Locating...');
  const [aqi, setAqi] = useState<AqiReading | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [history, setHistory] = useState<AqiHistory | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loc = await getDeviceLocation();
      const point = loc || { lat: 28.6139, lon: 77.209 };
      const label = loc ? await reverseGeocode(loc.lat, loc.lon) : 'Delhi';
      setLocationLabel(label);

      const [aqiData, weatherData, historyData, cities] = await Promise.all([
        getCurrentAqi(point.lat, point.lon).catch(() => null),
        getWeather(point.lat, point.lon).catch(() => null),
        getAqiHistory(point.lat, point.lon).catch(() => null),
        getCities().catch(() => []),
      ]);
      setAqi(aqiData);
      setWeather(weatherData);
      setHistory(historyData);

      if (historyData?.city_id) {
        const pred = await getPrediction(historyData.city_id).catch(() => null);
        setPrediction(pred);
      }
      setLoading(false);
    })();
  }, []);

  const activeColor = aqi ? aqiColorFor(colors, aqi.aqi) : colors.signal;
  const greeting = session?.user.email?.split('@')[0] || 'there';
  const pm25Source = aqi?.sources.find((s) => s.aqi !== null);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <View style={styles.header}>
          <View>
            <Text style={[typeScale.small, { color: colors.muted }]}>Good day,</Text>
            <Text style={[typeScale.title, { color: colors.ink, textTransform: 'capitalize' }]}>{greeting}</Text>
            <View style={styles.locRow}>
              <Feather name="map-pin" size={12} color={colors.muted} />
              <Text style={[typeScale.small, { color: colors.muted, marginLeft: 4 }]}>{locationLabel}</Text>
            </View>
          </View>
          <Pressable onPress={toggleTheme}>
            <GlassCard style={styles.iconBtn} intensity={25}>
              <Feather name={isDark ? 'sun' : 'moon'} size={16} color={colors.ink} />
            </GlassCard>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.signal} style={{ marginTop: 60 }} />
        ) : (
          <>
            <GlassCard style={styles.gaugeCard} intensity={45}>
              <CircularGauge value={aqi?.aqi ?? null} color={activeColor} label={`AQI · ${aqiLabel(aqi?.aqi ?? null)}`} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={styles.pollutantRow}>
                  <Text style={[typeScale.small, { color: colors.muted }]}>Top source</Text>
                  <Text style={[typeScale.label, { color: colors.ink }]}>
                    {pm25Source ? `${pm25Source.source}: ${pm25Source.aqi}` : '--'}
                  </Text>
                </View>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: spacing.sm }]}>
                  {aqi?.aqi && aqi.aqi <= 100
                    ? 'Air conditions are suitable for most outdoor activities.'
                    : 'Consider limiting prolonged outdoor exposure.'}
                </Text>
              </View>
            </GlassCard>

            {weather && (
              <View style={styles.weatherRow}>
                <GlassCard style={styles.weatherCard} intensity={30}>
                  <Feather name="wind" size={16} color={colors.signal} />
                  <Text style={[typeScale.small, { color: colors.ink, marginTop: 4 }]}>
                    {weather.wind_direction_compass}
                  </Text>
                  <Text style={[typeScale.small, { color: colors.muted }]}>
                    {Math.round(weather.wind_speed_kmh)} km/h
                  </Text>
                </GlassCard>
                <GlassCard style={styles.weatherCard} intensity={30}>
                  <Feather name="thermometer" size={16} color={colors.signal} />
                  <Text style={[typeScale.small, { color: colors.ink, marginTop: 4 }]}>
                    {Math.round(weather.temperature_c)}°C
                  </Text>
                  <Text style={[typeScale.small, { color: colors.muted }]}>
                    {Math.round(weather.humidity_pct)}% humidity
                  </Text>
                </GlassCard>
              </View>
            )}

            <GlassCard style={styles.outlookCard} intensity={30}>
              <View style={styles.outlookHeader}>
                <Feather name="trending-up" size={16} color={colors.signal} style={{ marginRight: 8 }} />
                <Text style={[typeScale.label, { color: colors.ink }]}>Pollution Outlook</Text>
              </View>
              {history && history.available ? (
                <TrendChart readings={history.readings} color={colors.signal} mutedColor={colors.muted} width={300} height={100} />
              ) : (
                <Text style={[typeScale.small, { color: colors.muted, marginTop: spacing.sm }]}>
                  Not enough historical data yet — check back after a few ingestion cycles.
                </Text>
              )}
              {prediction && prediction.prediction !== 'insufficient_data' && (
                <Text style={[typeScale.small, { color: colors.muted, marginTop: spacing.sm }]}>
                  Forecast next reading: <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.ink }}>{prediction.forecast_next_reading}</Text>
                  {prediction.spike_warning ? ' · Spike expected' : ''}
                </Text>
              )}
            </GlassCard>

            <Pressable onPress={() => navigation.navigate('Report')}>
              <View style={[styles.reportBtn, { backgroundColor: colors.signal }]}>
                <Feather name="camera" size={16} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.reportBtnText}>Report Pollution</Text>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: radius.md },
  gaugeCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, marginBottom: spacing.md },
  pollutantRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weatherRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  weatherCard: { flex: 1, alignItems: 'flex-start' },
  outlookCard: { marginBottom: spacing.md },
  outlookHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radius.md },
  reportBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});