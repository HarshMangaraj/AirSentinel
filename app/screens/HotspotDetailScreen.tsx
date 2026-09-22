import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { LeafletMap } from '../components/LeafletMap';
import { useTheme } from '../context/ThemeContext';
import { getAttribution, getPrediction, Attribution, Prediction } from '../lib/api';
import { type as typeScale, spacing, radius } from '../theme/tokens';

export function HotspotDetailScreen({ route, navigation }: any) {
  const { city, cityId, aqi, lat, lon, anomalyScore } = route.params;
  const { colors, isDark } = useTheme();
  const [attribution, setAttribution] = useState<Attribution | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAttribution(cityId).catch(() => null), getPrediction(cityId).catch(() => null)])
      .then(([a, p]) => {
        setAttribution(a);
        setPrediction(p);
      })
      .finally(() => setLoading(false));
  }, [cityId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[typeScale.title, { color: colors.ink }]}>{city}</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={{ padding: spacing.md }}>
        <GlassCard style={styles.heroCard} intensity={40}>
          <Text style={[typeScale.small, { color: colors.muted }]}>AI-detected pollution hotspot</Text>
          <Text style={[styles.aqiNumber, { color: colors.danger }]}>{aqi}</Text>
          <Text style={[typeScale.small, { color: colors.muted }]}>
            Anomaly score {anomalyScore} — statistically abnormal relative to all currently monitored cities
          </Text>
        </GlassCard>

        <View style={styles.mapWrap}>
          <LeafletMap lat={lat} lon={lon} aqi={aqi} aqiColor={colors.danger} station={city} isDark={isDark} reports={[]} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.signal} style={{ marginTop: spacing.lg }} />
        ) : (
          <>
            {attribution && (
              <GlassCard style={styles.infoCard} intensity={30}>
                <Text style={[typeScale.label, { color: colors.ink }]}>Probable Cause</Text>
                <Text style={[typeScale.body, { color: colors.ink, marginTop: 4, textTransform: 'capitalize' }]}>
                  {attribution.probable_cause}
                </Text>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: 4 }]}>{attribution.explanation}</Text>
              </GlassCard>
            )}

            {prediction && prediction.prediction !== 'insufficient_data' && (
              <GlassCard style={styles.infoCard} intensity={30}>
                <Text style={[typeScale.label, { color: colors.ink }]}>Forecast</Text>
                <Text style={[typeScale.body, { color: colors.ink, marginTop: 4 }]}>
                  Next reading: {prediction.forecast_next_reading}
                  {prediction.spike_warning ? ' — spike expected' : ''}
                </Text>
              </GlassCard>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  heroCard: { marginBottom: spacing.md },
  aqiNumber: { fontSize: 48, fontFamily: 'Inter_700Bold', marginVertical: 4 },
  mapWrap: { height: 200, borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md },
  infoCard: { marginBottom: spacing.md },
});