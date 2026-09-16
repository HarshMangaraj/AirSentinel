import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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
  if (aqi === null) return 'Air quality data is currently unavailable for this area.';
  if (aqi <= 50) return 'Air quality is satisfactory. Ideal conditions for outdoor activities.';
  if (aqi <= 100) return 'Air quality is acceptable. Sensitive individuals should monitor outdoor time.';
  if (aqi <= 200) return 'Air quality is degraded. Consider limiting prolonged outdoor exposure.';
  return 'Air quality is hazardous. Avoid outdoor exercise and wear protective masks.';
}

export function HomeScreen({ navigation }: any) {
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

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1100, useNativeDriver: true }),
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
    slideAnim.setValue(12);

    getCurrentAqi(point.lat, point.lon)
      .then((data) => {
        if (!cancelled) {
          setAqi(data);
          Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 50, useNativeDriver: true }),
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
              <View style={styles.titleRow}>
                <Text style={[styles.brandTitle, { color: colors.ink }]}>AirSentinel</Text>
                <View style={[styles.statusTag, { borderColor: activeColor + '30', backgroundColor: activeColor + '12' }]}>
                  <Animated.View style={[styles.statusDot, { backgroundColor: activeColor, transform: [{ scale: pulseAnim }] }]} />
                  <Text style={[styles.statusTagText, { color: activeColor }]}>LIVE</Text>
                </View>
              </View>
              <Text style={[styles.subTitle, { color: colors.muted }]}>Environmental Intelligence Platform</Text>
            </View>

            <View style={styles.headerActions}>
              <GlassCard style={styles.iconBtn} intensity={25} onPress={() => navigation.navigate('Report')}>
                <Feather name="camera" size={16} color={colors.signal} />
              </GlassCard>
              <GlassCard style={styles.iconBtn} intensity={25} onPress={toggleTheme}>
                <Feather name={isDark ? 'sun' : 'moon'} size={16} color={colors.ink} />
              </GlassCard>
              <GlassCard style={styles.signOutBtn} intensity={25} onPress={signOut}>
                <Feather name="log-out" size={14} color={colors.muted} style={{ marginRight: 5 }} />
                <Text style={[styles.signOutText, { color: colors.ink }]}>Exit</Text>
              </GlassCard>
            </View>
          </View>

          {/* Search Box */}
          <GlassCard style={styles.searchCard} intensity={35}>
            <Feather name="search" size={16} color={colors.muted} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.ink }]}
              placeholder="Search location in India..."
              placeholderTextColor={colors.muted}
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <Pressable
              onPress={handleSearch}
              style={({ pressed }) => [
                styles.searchSubmit,
                { backgroundColor: colors.signal, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Feather name={searching ? 'loader' : 'arrow-right'} size={16} color="#FFFFFF" />
            </Pressable>
          </GlassCard>

          {/* Report Pollution Banner */}
          <GlassCard style={styles.reportBanner} intensity={25} onPress={() => navigation.navigate('Report')}>
            <View style={styles.reportContent}>
              <Feather name="alert-triangle" size={14} color={colors.signal} style={{ marginRight: 8 }} />
              <Text style={[styles.reportText, { color: colors.signal }]}>Report pollution nearby</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.muted} />
          </GlassCard>

          {/* Location Action Bar */}
          <GlassCard style={styles.locateBtn} intensity={25} onPress={useMyLocation}>
            <View style={styles.locateContent}>
              <Feather name="navigation" size={14} color={colors.signal} style={{ marginRight: 8 }} />
              <Text style={[styles.locateText, { color: colors.signal }]}>
                {locating ? 'Acquiring device location...' : 'Use Current Coordinates'}
              </Text>
            </View>
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
                        styles.chipText,
                        { color: active ? '#FFFFFF' : colors.ink, fontWeight: active ? '600' : '400' },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Bento Grid Telemetry Layout */}
          {loadingCities || loadingAqi ? (
            <GlassSkeleton />
          ) : aqiError || !aqi ? (
            <GlassCard style={styles.errorContainer} intensity={30}>
              <Feather name="alert-circle" size={24} color={colors.muted} style={{ marginBottom: 8 }} />
              <Text style={[styles.errorTitle, { color: colors.ink }]}>Telemetry Unavailable</Text>
              <Text style={[styles.errorSub, { color: colors.muted }]}>
                No air quality sensor feeds could be retrieved for {point?.label}.
              </Text>
            </GlassCard>
          ) : (
            <Animated.View
              style={[
                styles.bentoContainer,
                { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Primary Bento Hero Card */}
              <GlassCard style={styles.heroCard} intensity={45}>
                <View style={styles.heroHeader}>
                  <View style={styles.stationBadge}>
                    <Feather name="map-pin" size={13} color={colors.muted} style={{ marginRight: 5 }} />
                    <Text style={[styles.stationName, { color: colors.muted }]}>{point?.label}</Text>
                  </View>
                  <View style={[styles.categoryPill, { backgroundColor: activeColor + '18', borderColor: activeColor + '40' }]}>
                    <View style={[styles.categoryDot, { backgroundColor: activeColor }]} />
                    <Text style={[styles.categoryText, { color: activeColor }]}>{aqiLabel(aqi.aqi)}</Text>
                  </View>
                </View>

                <View style={styles.metricsRow}>
                  <Text style={[styles.heroIndexNumber, { color: activeColor }]}>{aqi.aqi ?? '--'}</Text>
                  <View style={styles.indexUnitColumn}>
                    <Text style={[styles.unitLabel, { color: colors.muted }]}>AQI</Text>
                    <Text style={[styles.unitScale, { color: colors.ink }]}>US EPA Standard</Text>
                  </View>
                </View>

                <View style={[styles.advisoryContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.025)' }]}>
                  <Feather name="info" size={14} color={colors.signal} style={{ marginRight: 8, marginTop: 2 }} />
                  <Text style={[styles.advisoryText, { color: colors.ink }]}>{aqiAdvisory(aqi.aqi)}</Text>
                </View>
              </GlassCard>

              {/* Sensor Feeds Section Header */}
              <View style={styles.sectionHeader}>
                <Feather name="radio" size={13} color={colors.muted} style={{ marginRight: 6 }} />
                <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                  STATION TELEMETRY ({aqi.sources.length} SOURCES)
                </Text>
              </View>

              {/* Sensor Grid */}
              <View style={styles.sourceGrid}>
                {aqi.sources.map((s) => {
                  const sColor = s.aqi !== null ? aqiColorFor(colors, s.aqi) : colors.muted;
                  return (
                    <GlassCard key={s.source} style={styles.sourceCard} intensity={30}>
                      <View style={styles.sourceTop}>
                        <Text style={[styles.sourceName, { color: colors.muted }]}>{s.source}</Text>
                        <View style={[styles.miniIndicator, { backgroundColor: sColor }]} />
                      </View>
                      <Text style={[styles.sourceValue, { color: sColor }]}>
                        {s.aqi !== null ? s.aqi : '--'}
                      </Text>
                      {s.distance_km !== null && (
                        <Text style={[styles.sourceDist, { color: colors.muted }]}>
                          {Math.round(s.distance_km)} km distance
                        </Text>
                      )}
                    </GlassCard>
                  );
                })}
              </View>

              {/* Distance Info Banner */}
              {aqi.distance_km !== null && aqi.distance_km > 5 && (
                <View style={styles.distanceMetaRow}>
                  <Feather name="activity" size={12} color={colors.muted} style={{ marginRight: 6 }} />
                  <Text style={[styles.distanceMetaText, { color: colors.muted }]}>
                    Nearest ground station is ~{Math.round(aqi.distance_km)} km away (averaged across {aqi.source_count} providers).
                  </Text>
                </View>
              )}

              {/* Interactive Station Map */}
              <GlassCard style={styles.mapCard} intensity={20}>
                <View style={styles.mapHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Feather name="map" size={14} color={colors.ink} style={{ marginRight: 6 }} />
                    <Text style={[styles.mapTitle, { color: colors.ink }]}>Station Coordinates Map</Text>
                  </View>
                  <Text style={[styles.mapSub, { color: colors.muted }]}>Tap anywhere to inspect</Text>
                </View>
                <View style={styles.mapCanvas}>
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

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandTitle: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subTitle: { fontSize: 13, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statusTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.sm, borderWidth: 1,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusTagText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  headerActions: { flexDirection: 'row', gap: spacing.xs + 2, alignItems: 'center' },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', padding: 0, borderRadius: radius.md },
  signOutBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.md,
  },
  signOutText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  searchCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    marginBottom: spacing.xs + 4, borderRadius: radius.md,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, ...typeScale.body, fontSize: 14, height: 40 },
  searchSubmit: { width: 32, height: 32, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },

  reportBanner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, paddingHorizontal: spacing.md,
    marginBottom: spacing.xs + 4, borderRadius: radius.md,
  },
  reportContent: { flexDirection: 'row', alignItems: 'center' },
  reportText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  locateBtn: { paddingVertical: 10, paddingHorizontal: spacing.md, marginBottom: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  locateContent: { flexDirection: 'row', alignItems: 'center' },
  locateText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  chipRow: { marginBottom: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.md, borderWidth: 1, marginRight: spacing.xs + 4 },
  chipText: { fontSize: 13, fontFamily: 'Inter_500Medium' },

  errorContainer: { padding: spacing.xl, alignItems: 'center', marginTop: spacing.sm },
  errorTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  errorSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 4 },

  bentoContainer: { gap: spacing.md },

  heroCard: { padding: spacing.lg, borderRadius: radius.lg, gap: spacing.md },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stationBadge: { flexDirection: 'row', alignItems: 'center' },
  stationName: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },

  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.md, borderWidth: 1,
  },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  categoryText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  metricsRow: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginVertical: 2 },
  heroIndexNumber: { fontSize: 64, lineHeight: 68, fontFamily: 'Inter_700Bold', letterSpacing: -1 },
  indexUnitColumn: { justifyContent: 'flex-end', paddingBottom: 6 },
  unitLabel: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  unitScale: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  advisoryContainer: { flexDirection: 'row', alignItems: 'flex-start', padding: spacing.sm + 2, borderRadius: radius.md },
  advisoryText: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1, lineHeight: 18 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 4, marginBottom: -4 },
  sectionTitle: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },

  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sourceCard: { width: '48.5%', padding: spacing.md, gap: 4 },
  sourceTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sourceName: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  miniIndicator: { width: 6, height: 6, borderRadius: 3 },
  sourceValue: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  sourceDist: { fontSize: 11, fontFamily: 'Inter_400Regular' },

  distanceMetaRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  distanceMetaText: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },

  mapCard: { padding: 0, overflow: 'hidden', height: 290, borderRadius: radius.lg },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 10 },
  mapTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  mapSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  mapCanvas: { flex: 1, overflow: 'hidden' },
});