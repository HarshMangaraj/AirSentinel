import { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { GlassCard } from '../components/GlassCard';
import { CircularGauge } from '../components/CircularGauge';
import { TrendChart } from '../components/TrendChart';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getPrediction,
  getWeather,
  getAqiHistory,
  getAiHotspots,
  getPollutants,
  getBriefing,
  getLatestCityAqi,
  Weather,
  AqiHistory,
  AiHotspot,
  Pollutants,
  Briefing,
  LatestCityAqi,
} from '../lib/api';
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
  const [latestAqi, setLatestAqi] = useState<LatestCityAqi | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [history, setHistory] = useState<AqiHistory | null>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [aiHotspots, setAiHotspots] = useState<AiHotspot[]>([]);
  const [pollutants, setPollutants] = useState<Pollutants | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    const loc = await getDeviceLocation();
    const point = loc || { lat: 28.6139, lon: 77.209 };
    const label = loc ? await reverseGeocode(loc.lat, loc.lon) : 'Delhi';
    setLocationLabel(label);

    const historyData = await getAqiHistory(point.lat, point.lon).catch(() => null);
    setHistory(historyData);

    const results = await Promise.allSettled([
      historyData?.city_id ? getLatestCityAqi(historyData.city_id) : Promise.resolve(null),
      getWeather(point.lat, point.lon),
      getAiHotspots(),
      getPollutants(point.lat, point.lon),
      historyData?.city_id ? getBriefing(point.lat, point.lon) : Promise.resolve(null),
    ]);

    const [latestRes, weatherRes, hotspotRes, pollutantRes, briefingRes] = results;
    setLatestAqi(latestRes.status === 'fulfilled' ? (latestRes.value as LatestCityAqi | null) : null);
    setWeather(weatherRes.status === 'fulfilled' ? (weatherRes.value as Weather) : null);
    setAiHotspots(hotspotRes.status === 'fulfilled' ? (hotspotRes.value as any)?.hotspots || [] : []);
    setPollutants(pollutantRes.status === 'fulfilled' ? (pollutantRes.value as Pollutants) : null);
    setBriefing(briefingRes.status === 'fulfilled' ? (briefingRes.value as Briefing | null) : null);

    if (historyData?.city_id) {
      const pred = await getPrediction(historyData.city_id).catch(() => null);
      setPrediction(pred);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  const currentAqiValue = latestAqi?.aqi ?? null;
  const activeColor = aqiColorFor(colors, currentAqiValue);
  const greeting = session?.user.email?.split('@')[0] || 'there';

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
              <CircularGauge value={currentAqiValue} color={activeColor} label={`AQI · ${aqiLabel(currentAqiValue)}`} />
              <View style={{ flex: 1, marginLeft: spacing.md }}>
                <View style={styles.pollutantRow}>
                  <Text style={[typeScale.small, { color: colors.muted }]}>Station</Text>
                  <Text style={[typeScale.label, { color: colors.ink }]} numberOfLines={1}>
                    {latestAqi?.station || '--'}
                  </Text>
                </View>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: spacing.sm }]}>
                  {currentAqiValue !== null && currentAqiValue <= 100
                    ? 'Air conditions are suitable for most outdoor activities.'
                    : 'Consider limiting prolonged outdoor exposure.'}
                </Text>
              </View>
            </GlassCard>

            {briefing && briefing.available && (
              <GlassCard style={styles.outlookCard} intensity={30}>
                <View style={styles.outlookHeader}>
                  <Feather name="zap" size={16} color={colors.signal} style={{ marginRight: 8 }} />
                  <Text style={[typeScale.label, { color: colors.ink }]}>AI Briefing</Text>
                </View>
                <Text style={[typeScale.body, { color: colors.ink, marginTop: 4 }]}>{briefing.text}</Text>
              </GlassCard>
            )}

            {pollutants && (
              <GlassCard style={styles.outlookCard} intensity={30}>
                <View style={styles.outlookHeader}>
                  <Feather name="grid" size={16} color={colors.signal} style={{ marginRight: 8 }} />
                  <Text style={[typeScale.label, { color: colors.ink }]}>Pollutant Breakdown</Text>
                </View>
                <View style={styles.pollutantGrid}>
                  {[
                    { label: 'PM2.5', value: pollutants.pm2_5 },
                    { label: 'PM10', value: pollutants.pm10 },
                    { label: 'NO2', value: pollutants.no2 },
                    { label: 'SO2', value: pollutants.so2 },
                    { label: 'O3', value: pollutants.o3 },
                    { label: 'CO', value: pollutants.co },
                  ].map((p) => (
                    <View key={p.label} style={styles.pollutantItem}>
                      <Text style={[typeScale.small, { color: colors.muted }]}>{p.label}</Text>
                      <Text style={[typeScale.label, { color: colors.ink }]}>
                        {p.value !== null ? p.value.toFixed(1) : '--'}
                      </Text>
                    </View>
                  ))}
                </View>
              </GlassCard>
            )}

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
                  Forecast next reading:{' '}
                  <Text style={{ fontFamily: 'Inter_600SemiBold', color: colors.ink }}>
                    {prediction.forecast_next_reading}
                  </Text>
                  {prediction.spike_warning ? ' · Spike expected' : ''}
                </Text>
              )}
            </GlassCard>

            {aiHotspots.length > 0 && (
              <GlassCard style={styles.outlookCard} intensity={30}>
                <View style={styles.outlookHeader}>
                  <Feather name="cpu" size={16} color={colors.danger} style={{ marginRight: 8 }} />
                  <Text style={[typeScale.label, { color: colors.ink }]}>AI-Detected Hotspots</Text>
                </View>
                {aiHotspots.map((h: any) => (
                  <Pressable
                    key={h.city}
                    onPress={() =>
                      navigation.navigate('HotspotDetail', {
                        city: h.city,
                        cityId: h.city_id,
                        aqi: h.aqi,
                        lat: h.lat,
                        lon: h.lon,
                        anomalyScore: h.anomaly_score,
                      })
                    }
                  >
                    <View style={styles.hotspotRow}>
                      <Text style={[typeScale.small, { color: colors.muted, flex: 1 }]}>
                        <Text style={{ color: colors.danger, fontFamily: 'Inter_600SemiBold' }}>{h.city}</Text>
                        {' '}— AQI {h.aqi}, score {h.anomaly_score}
                      </Text>
                      <Feather name="chevron-right" size={14} color={colors.muted} />
                    </View>
                  </Pressable>
                ))}
              </GlassCard>
            )}

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
  pollutantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  pollutantItem: { width: '28%' },
  weatherRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  weatherCard: { flex: 1, alignItems: 'flex-start' },
  outlookCard: { marginBottom: spacing.md },
  outlookHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  hotspotRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radius.md },
  reportBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});