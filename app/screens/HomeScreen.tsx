import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { LeafletMap } from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCities, getCurrentAqi, City, AqiReading } from '../lib/api';
import { getDeviceLocation, reverseGeocode, searchPlace } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { spacing, type as typeScale, radius } from '../theme/tokens';

type Point = { lat: number; lon: number; label: string };

function aqiColorFor(colors: ReturnType<typeof useTheme>['colors'], aqi: number) {
  if (aqi <= 50) return colors.aqi.good;
  if (aqi <= 100) return colors.aqi.moderate;
  if (aqi <= 200) return colors.aqi.unhealthy;
  return colors.aqi.hazardous;
}

export function HomeScreen() {
  const { signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [cities, setCities] = useState<City[]>([]);
  const [point, setPoint] = useState<Point | null>(null);
  const [aqi, setAqi] = useState<AqiReading | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAqi, setLoadingAqi] = useState(false);
  const [aqiError, setAqiError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getCities()
      .then((data) => {
        setCities(data);
        if (data.length > 0) setPoint({ lat: data[0].lat, lon: data[0].lon, label: data[0].name });
      })
      .finally(() => setLoadingCities(false));
  }, []);

  useEffect(() => {
    if (!point) return;
    let cancelled = false;
    setLoadingAqi(true);
    setAqi(null);
    setAqiError(false);

    getCurrentAqi(point.lat, point.lon)
      .then((data) => { if (!cancelled) setAqi(data); })
      .catch(() => { if (!cancelled) setAqiError(true); })
      .finally(() => { if (!cancelled) setLoadingAqi(false); });

    return () => { cancelled = true; };
  }, [point]);

  async function useMyLocation() {
    setLocating(true);
    const loc = await getDeviceLocation();
    if (!loc) { setLocating(false); return; }
    const label = await reverseGeocode(loc.lat, loc.lon);
    setPoint({ lat: loc.lat, lon: loc.lon, label });
    setLocating(false);
  }

  async function handleMapPress(lat: number, lon: number) {
    setPoint({ lat, lon, label: 'Locating...' });
    const label = await reverseGeocode(lat, lon);
    setPoint({ lat, lon, label });
  }

  async function handleSearch() {
    if (!searchText.trim()) return;
    setSearching(true);
    const result = await searchPlace(searchText.trim());
    setSearching(false);
    if (result) { setPoint(result); setSearchText(''); }
  }

  return (
    <LinearGradient colors={colors.gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View>
              <Text style={[typeScale.hero, { color: colors.ink }]}>AirSentinel</Text>
              <Text style={[typeScale.small, { color: colors.muted }]}>Live air quality, wherever you are</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable onPress={toggleTheme}>
                <GlassCard style={styles.iconBtn} intensity={30}>
                  <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
                </GlassCard>
              </Pressable>
              <Pressable onPress={signOut}>
                <GlassCard style={styles.signOutCard} intensity={30}>
                  <Text style={[typeScale.small, { color: colors.ink }]}>Sign out</Text>
                </GlassCard>
              </Pressable>
            </View>
          </View>

          <GlassCard style={styles.searchCard}>
            <TextInput
              style={[styles.searchInput, { color: colors.ink }]}
              placeholder="Search a place in India"
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable onPress={handleSearch} style={[styles.searchGo, { backgroundColor: colors.signal }]}>
              <Text style={{ color: colors.paper, fontSize: 18, fontFamily: 'Inter_600SemiBold' }}>
                {searching ? '…' : '→'}
              </Text>
            </Pressable>
          </GlassCard>

          <Pressable onPress={useMyLocation}>
            <GlassCard style={styles.locateCard} intensity={30}>
              <Text style={[typeScale.label, { color: colors.signalDark }]}>
                {locating ? 'Locating…' : '📍 Use my location'}
              </Text>
            </GlassCard>
          </Pressable>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {cities.map((c) => {
              const active = point?.label === c.name;
              return (
                <Pressable key={c.id} onPress={() => setPoint({ lat: c.lat, lon: c.lon, label: c.name })}>
                  <View style={[
                    styles.chip,
                    { borderColor: colors.glassBorder, backgroundColor: colors.glass },
                    active && { backgroundColor: colors.signal, borderColor: colors.signal },
                  ]}>
                    <Text style={[typeScale.label, { color: active ? colors.paper : colors.ink }]}>{c.name}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {loadingCities || loadingAqi ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.signal} />
            </View>
          ) : aqiError || !aqi ? (
            <GlassCard style={styles.errorCard}>
              <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center' }]}>
                No AQI data available for {point?.label}.
              </Text>
            </GlassCard>
          ) : (
            <View style={styles.bento}>
              <GlassCard style={styles.heroCard} intensity={50}>
                <Text style={[typeScale.label, { color: colors.muted }]}>{point?.label}</Text>
                <Text style={[styles.heroNumber, { color: aqiColorFor(colors, aqi.aqi) }]}>{aqi.aqi}</Text>
                <View style={styles.heroFooter}>
                  <View style={[styles.dot, { backgroundColor: aqiColorFor(colors, aqi.aqi) }]} />
                  <Text style={[typeScale.label, { color: colors.ink }]}>{aqiLabel(aqi.aqi)}</Text>
                </View>
              </GlassCard>

              <View style={styles.sourceGrid}>
                {aqi.sources.map((s) => (
                  <GlassCard key={s.source} style={styles.sourceCard} intensity={35}>
                    <Text style={[typeScale.small, { color: colors.muted }]}>{s.source}</Text>
                    <Text style={[styles.sourceValue, { color: aqiColorFor(colors, s.aqi) }]}>{s.aqi}</Text>
                  </GlassCard>
                ))}
              </View>

              {aqi.distance_km > 5 && (
                <Text style={[typeScale.small, { color: colors.muted, textAlign: 'center' }]}>
                  Nearest ground station ~{aqi.distance_km}km away · averaged from {aqi.source_count} sources
                </Text>
              )}

              <GlassCard style={styles.mapCard} intensity={20}>
                <LeafletMap
                  lat={point!.lat}
                  lon={point!.lon}
                  aqi={aqi.aqi}
                  aqiColor={aqiColorFor(colors, aqi.aqi)}
                  station={point!.label}
                  isDark={isDark}
                  onMapPress={handleMapPress}
                />
              </GlassCard>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  center: { paddingVertical: spacing.xxl, alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: radius.md },
  signOutCard: { paddingVertical: 8, paddingHorizontal: 14 },
  searchCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm, marginBottom: spacing.sm },
  searchInput: { flex: 1, ...typeScale.body, paddingHorizontal: spacing.sm },
  searchGo: { width: 36, height: 36, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  locateCard: { alignItems: 'center', paddingVertical: 12, marginBottom: spacing.md },
  chipRow: { marginBottom: spacing.lg },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, marginRight: spacing.sm },
  errorCard: { paddingVertical: spacing.xl },
  bento: { gap: spacing.md },
  heroCard: { alignItems: 'flex-start', paddingVertical: spacing.xl },
  heroNumber: { fontSize: 64, lineHeight: 68, fontFamily: 'Inter_700Bold' },
  heroFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, gap: 8 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sourceCard: { width: '47%', alignItems: 'flex-start' },
  sourceValue: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  mapCard: { height: 280, padding: 0 },
});