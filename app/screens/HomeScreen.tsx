import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassCard } from '../components/GlassCard';
import { GlassSkeleton } from '../components/GlassSkeleton';
import { LeafletMap } from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCities, getCurrentAqi, City, AqiReading } from '../lib/api';
import { getDeviceLocation, reverseGeocode, searchPlace } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { spacing, type as typeScale, radius } from '../theme/tokens';

type Point = { lat: number; lon: number; label: string };

function aqiColorFor(colors: ReturnType<typeof useTheme>['colors'], aqi: number | null) {
  if (aqi === null) return colors.muted;
  if (aqi <= 50) return colors.aqi.good;
  if (aqi <= 100) return colors.aqi.moderate;
  if (aqi <= 200) return colors.aqi.unhealthy;
  return colors.aqi.hazardous;
}

function aqiAdvisory(aqi: number | null): string {
  if (aqi === null) return 'AQI status unavailable at this location';
  if (aqi <= 50) return 'Ideal air quality for outdoor activities & exercise.';
  if (aqi <= 100) return 'Acceptable air quality; sensitive individuals exercise care.';
  if (aqi <= 200) return 'Unhealthy air quality. Consider reducing prolonged outdoor exposure.';
  return 'Hazardous air quality! Limit outdoor activities and wear protection.';
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

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(18)).current;

  // Pulse animation for live dot indicator
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.45,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

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
    fadeAnim.setValue(0);
    slideAnim.setValue(18);

    getCurrentAqi(point.lat, point.lon)
      .then((data) => {
        if (!cancelled) {
          setAqi(data);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
              toValue: 0,
              friction: 8,
              tension: 40,
              useNativeDriver: true,
            }),
          ]).start();
        }
      })
      .catch(() => {
        if (!cancelled) setAqiError(true);
      })
      .finally(() => {
        if (!cancelled) setLoadingAqi(false);
      });

    return () => {
      cancelled = true;
    };
  }, [point, fadeAnim, slideAnim]);

  async function useMyLocation() {
    setLocating(true);
    const loc = await getDeviceLocation();
    if (!loc) {
      setLocating(false);
      return;
    }
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
    if (result) {
      setPoint(result);
      setSearchText('');
    }
  }

  const activeColor = aqi ? aqiColorFor(colors, aqi.aqi) : colors.signal;

  return (
    <LinearGradient colors={colors.gradient} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.brandRow}>
                <Text style={[typeScale.hero, { color: colors.ink }]}>AirSentinel</Text>
                <View style={[styles.liveBadge, { backgroundColor: activeColor + '22', borderColor: activeColor + '44' }]}>
                  <Animated.View style={[styles.liveBadgeDot, { backgroundColor: activeColor, transform: [{ scale: pulseAnim }] }]} />
                  <Text style={[styles.liveBadgeText, { color: activeColor }]}>LIVE</Text>
                </View>
              </View>
              <Text style={[typeScale.small, { color: colors.muted }]}>Real-time air intelligence</Text>
            </View>

            <View style={styles.headerActions}>
              <GlassCard style={styles.iconBtn} intensity={30} onPress={toggleTheme}>
                <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
              </GlassCard>
              <GlassCard style={styles.signOutCard} intensity={30} onPress={signOut}>
                <Text style={[typeScale.small, { color: colors.ink, fontFamily: 'Inter_600SemiBold' }]}>Sign out</Text>
              </GlassCard>
            </View>
          </View>

          {/* Search Box */}
          <GlassCard style={styles.searchCard} intensity={40}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>🔍</Text>
            <TextInput
              style={[styles.searchInput, { color: colors.ink }]}
              placeholder="Search city or location in India..."
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => [
                styles.searchGo,
                { backgroundColor: colors.signal, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 16, fontFamily: 'Inter_600SemiBold' }}>
                {searching ? '…' : '→'}
              </Text>
            </Pressable>
          </GlassCard>

          {/* Location Button */}
          <GlassCard
            style={styles.locateCard}
            intensity={30}
            glowColor={locating ? colors.signal : undefined}
            onPress={useMyLocation}
          >
            <Text style={[typeScale.label, { color: colors.signal, fontFamily: 'Inter_600SemiBold' }]}>
              {locating ? '🧭 Determining location...' : '📍 Use My Precise Location'}
            </Text>
          </GlassCard>

          {/* City Chips Carousel */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            {cities.map((c) => {
              const active = point?.label === c.name;
              return (
                <Pressable key={c.id} onPress={() => setPoint({ lat: c.lat, lon: c.lon, label: c.name })}>
                  <View
                    style={[
                      styles.chip,
                      {
                        borderColor: active ? colors.signal : colors.glassBorder,
                        backgroundColor: active ? colors.signal : colors.glass,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        typeScale.label,
                        {
                          color: active ? '#FFFFFF' : colors.ink,
                          fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Bento Grid Content */}
          {loadingCities || loadingAqi ? (
            <GlassSkeleton />
          ) : aqiError || !aqi ? (
            <GlassCard style={styles.errorCard} intensity={40}>
              <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 8 }}>⚠️</Text>
              <Text style={[typeScale.body, { color: colors.ink, textAlign: 'center', fontFamily: 'Inter_600SemiBold' }]}>
                No live data available
              </Text>
              <Text style={[typeScale.small, { color: colors.muted, textAlign: 'center', marginTop: 4 }]}>
                Could not fetch air quality data for {point?.label}.
              </Text>
            </GlassCard>
          ) : (
            <Animated.View
              style={[
                styles.bento,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              {/* Hero Bento Card */}
              <GlassCard
                style={styles.heroCard}
                intensity={55}
                glowColor={activeColor + '40'}
              >
                <View style={styles.heroTopRow}>
                  <View style={styles.locationPill}>
                    <Text style={{ fontSize: 13, marginRight: 4 }}>📍</Text>
                    <Text style={[typeScale.label, { color: colors.muted, fontFamily: 'Inter_600SemiBold' }]}>
                      {point?.label}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: activeColor + '1E', borderColor: activeColor + '55' }]}>
                    <Animated.View
                      style={[
                        styles.dotPulse,
                        { backgroundColor: activeColor, transform: [{ scale: pulseAnim }] },
                      ]}
                    />
                    <Text style={[styles.statusBadgeText, { color: activeColor }]}>
                      {aqiLabel(aqi.aqi)}
                    </Text>
                  </View>
                </View>

                <View style={styles.heroNumberContainer}>
                  <Text style={[styles.heroNumber, { color: activeColor }]}>{aqi.aqi ?? 'N/A'}</Text>
                  <View style={styles.unitContainer}>
                    <Text style={[styles.unitText, { color: colors.muted }]}>AQI</Text>
                    <Text style={[styles.unitSub, { color: activeColor }]}>INDEX</Text>
                  </View>
                </View>

                <View style={[styles.advisoryBox, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }]}>
                  <Text style={{ fontSize: 14, marginRight: 6 }}>🫁</Text>
                  <Text style={[typeScale.small, { color: colors.ink, flex: 1 }]}>
                    {aqiAdvisory(aqi.aqi)}
                  </Text>
                </View>
              </GlassCard>

              {/* Source Stations Grid */}
              <View style={styles.sourceGridHeader}>
                <Text style={[typeScale.label, { color: colors.muted, fontFamily: 'Inter_600SemiBold' }]}>
                  📡 Sensor Station Telemetry ({aqi.sources.length})
                </Text>
              </View>

              <View style={styles.sourceGrid}>
                {aqi.sources.map((s) => {
                  const sColor = s.aqi !== null ? aqiColorFor(colors, s.aqi) : colors.muted;
                  return (
                    <GlassCard key={s.source} style={styles.sourceCard} intensity={35}>
                      <View style={styles.sourceHeader}>
                        <Text style={[typeScale.small, { color: colors.muted, fontFamily: 'Inter_600SemiBold' }]}>
                          {s.source}
                        </Text>
                        <View style={[styles.miniDot, { backgroundColor: sColor }]} />
                      </View>
                      <Text style={[styles.sourceValue, { color: sColor }]}>
                        {s.aqi !== null ? s.aqi : 'N/A'}
                      </Text>
                      {s.distance_km !== null && (
                        <Text style={[styles.sourceDist, { color: colors.muted }]}>
                          ~{Math.round(s.distance_km)}km away
                        </Text>
                      )}
                    </GlassCard>
                  );
                })}
              </View>

              {/* Station Distance Banner */}
              {aqi.distance_km !== null && aqi.distance_km > 5 && (
                <GlassCard style={styles.distBanner} intensity={25}>
                  <Text style={{ fontSize: 14, marginRight: 6 }}>📡</Text>
                  <Text style={[typeScale.small, { color: colors.muted, flex: 1, textAlign: 'center' }]}>
                    Nearest ground station ~{Math.round(aqi.distance_km)}km away · composite average from {aqi.source_count} sensor feeds
                  </Text>
                </GlassCard>
              )}

              {/* Interactive Station Map Bento Card */}
              <GlassCard style={styles.mapCard} intensity={20}>
                <View style={styles.mapHeaderBar}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, marginRight: 6 }}>🗺️</Text>
                    <Text style={[typeScale.label, { color: colors.ink, fontFamily: 'Inter_600SemiBold' }]}>
                      Interactive Location Map
                    </Text>
                  </View>
                  <Text style={[typeScale.small, { color: colors.muted }]}>Tap map to select</Text>
                </View>
                <View style={styles.mapFrame}>
                  <LeafletMap
                    lat={point!.lat}
                    lon={point!.lon}
                    aqi={aqi.aqi}
                    aqiColor={activeColor}
                    station={point!.label}
                    isDark={isDark}
                    onMapPress={handleMapPress}
                  />
                </View>
              </GlassCard>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
  liveBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  liveBadgeText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  headerActions: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    borderRadius: radius.md,
  },
  signOutCard: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: radius.md },

  searchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
  },
  searchInput: { flex: 1, ...typeScale.body, paddingHorizontal: spacing.xs, height: 44 },
  searchGo: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  locateCard: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: spacing.md,
    borderRadius: radius.md,
  },

  chipRow: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1.2,
    marginRight: spacing.sm,
  },

  errorCard: { padding: spacing.xl, alignItems: 'center', marginTop: spacing.md },
  bento: { gap: spacing.md },

  heroCard: { padding: spacing.lg, gap: spacing.md, borderRadius: radius.xl },
  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationPill: { flexDirection: 'row', alignItems: 'center' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  dotPulse: { width: 8, height: 8, borderRadius: 4 },
  statusBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },

  heroNumberContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginVertical: 4 },
  heroNumber: { fontSize: 68, lineHeight: 72, fontFamily: 'Inter_700Bold' },
  unitContainer: { justifyContent: 'flex-end', paddingBottom: 8 },
  unitText: { fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  unitSub: { fontSize: 10, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5 },

  advisoryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },

  sourceGridHeader: { marginTop: 4, marginBottom: -4 },
  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sourceCard: { width: '48.5%', padding: spacing.md, gap: 4 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  miniDot: { width: 6, height: 6, borderRadius: 3 },
  sourceValue: { fontSize: 32, fontFamily: 'Inter_700Bold' },
  sourceDist: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  distBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },

  mapCard: { padding: 0, overflow: 'hidden', height: 300 },
  mapHeaderBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  mapFrame: { flex: 1, overflow: 'hidden', borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
});