import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { getAqiHistory, getLatestCityAqi } from '../lib/api';
import { getDeviceLocation } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { type as typeScale, spacing, radius } from '../theme/tokens';

function tipsForAqi(aqi: number | null) {
  if (aqi === null) return [];
  if (aqi <= 50) return [
    { icon: 'sun', text: 'Great day for outdoor activities.' },
    { icon: 'wind', text: 'Ventilate indoor spaces freely.' },
  ];
  if (aqi <= 100) return [
    { icon: 'activity', text: 'Sensitive groups should moderate prolonged outdoor exertion.' },
    { icon: 'droplet', text: 'Stay hydrated during outdoor time.' },
  ];
  if (aqi <= 200) return [
    { icon: 'user-x', text: 'Avoid strenuous outdoor activities.' },
    { icon: 'shield', text: 'Use a mask (N95 or equivalent) if you must go outside.' },
    { icon: 'home', text: 'Keep windows closed during high pollution periods.' },
  ];
  return [
    { icon: 'alert-triangle', text: 'Avoid outdoor exercise entirely.' },
    { icon: 'shield', text: 'Wear an N95 or equivalent mask outdoors.' },
    { icon: 'home', text: 'Stay indoors with air purification if available.' },
    { icon: 'heart', text: 'Children, elderly, and those with respiratory conditions are especially vulnerable.' },
  ];
}

export function HealthSafetyScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [aqi, setAqi] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const loc = await getDeviceLocation();
      const point = loc || { lat: 28.6139, lon: 77.209 };
      // Use the same cached-per-city reading as Home, so numbers stay consistent app-wide
      const history = await getAqiHistory(point.lat, point.lon).catch(() => null);
      if (history?.city_id) {
        const latest = await getLatestCityAqi(history.city_id).catch(() => null);
        setAqi(latest?.aqi ?? null);
      }
      setLoading(false);
    })();
  }, []);

  const tips = tipsForAqi(aqi);
  const special = aqi !== null && aqi > 150;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[typeScale.title, { color: colors.ink }]}>Health & Safety</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.signal} style={{ marginTop: 60 }} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <View style={[styles.banner, { backgroundColor: colors.signal }]}>
            <Text style={styles.bannerTitle}>Breathe Better, Live Healthier</Text>
            <Text style={styles.bannerSub}>
              Current AQI: {aqi ?? '--'} · {aqiLabel(aqi)}
            </Text>
          </View>

          <Text style={[typeScale.label, { color: colors.muted, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            Quick Tips
          </Text>
          {tips.map((tip, i) => (
            <GlassCard key={i} style={styles.tipRow} intensity={25}>
              <Feather name={tip.icon as any} size={18} color={colors.signal} style={{ marginRight: 12 }} />
              <Text style={[typeScale.body, { color: colors.ink, flex: 1 }]}>{tip.text}</Text>
            </GlassCard>
          ))}

          {special && (
            <View style={[styles.specialBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '40' }]}>
              <Text style={[typeScale.label, { color: colors.danger }]}>Special Attention</Text>
              <Text style={[typeScale.small, { color: colors.ink, marginTop: 4 }]}>
                Children, elderly people, and people with respiratory conditions are more vulnerable at this AQI level.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  banner: { padding: spacing.lg, borderRadius: radius.lg },
  bannerTitle: { color: '#FFF', fontFamily: 'Inter_700Bold', fontSize: 18 },
  bannerSub: { color: '#FFF', opacity: 0.9, marginTop: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  specialBox: { padding: spacing.md, borderRadius: radius.md, borderWidth: 1, marginTop: spacing.sm },
});