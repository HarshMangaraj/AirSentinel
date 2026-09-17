import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { CircularGauge } from '../components/CircularGauge';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCities, getCurrentAqi, getPrediction, City, AqiReading } from '../lib/api';
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
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loc = await getDeviceLocation();
      const point = loc || { lat: 28.6139, lon: 77.209 };
      const label = loc ? await reverseGeocode(loc.lat, loc.lon) : 'Delhi';
      setLocationLabel(label);

      const aqiData = await getCurrentAqi(point.lat, point.lon).catch(() => null);
      setAqi(aqiData);

      const cities = await getCities().catch(() => []);
      const nearest = cities[0];
      if (nearest) {
        const pred = await getPrediction(nearest.id).catch(() => null);
        setPrediction(pred);
      }
      setLoading(false);
    })();
  }, []);

  const activeColor = aqi ? aqiColorFor(colors, aqi.aqi) : colors.signal;
  const greeting = session?.user.email?.split('@')[0] || 'there';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <View style={styles.header}>
          <View>
            <Text style={[typeScale.small, { color: colors.muted }]}>Good morning,</Text>
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
                  <Text style={[typeScale.small, { color: colors.muted }]}>PM2.5</Text>
                  <Text style={[typeScale.label, { color: colors.ink }]}>
                    {aqi?.sources.find((s) => s.aqi !== null)?.aqi ?? '--'} µg/m³
                  </Text>
                </View>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: spacing.sm }]}>
                  {aqi?.aqi && aqi.aqi <= 100
                    ? 'Air conditions are suitable for most outdoor activities.'
                    : 'Consider limiting prolonged outdoor exposure.'}
                </Text>
              </View>
            </GlassCard>

            {prediction && prediction.prediction !== 'insufficient_data' && (
              <GlassCard style={styles.outlookCard} intensity={30}>
                <Feather name="trending-up" size={16} color={colors.signal} style={{ marginRight: 10 }} />
                <View>
                  <Text style={[typeScale.label, { color: colors.ink }]}>Next Pollution Outlook</Text>
                  <Text style={[typeScale.small, { color: colors.muted }]}>
                    Forecast: {prediction.forecast_next_reading} AQI
                    {prediction.spike_warning ? ' · Spike expected' : ' · Expected to remain steady'}
                  </Text>
                </View>
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
  outlookCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  reportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: radius.md },
  reportBtnText: { color: '#FFF', fontFamily: 'Inter_600SemiBold', fontSize: 15 },
});