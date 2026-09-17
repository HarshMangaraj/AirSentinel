import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { LeafletMap } from '../components/LeafletMap';
import { useTheme } from '../context/ThemeContext';
import { getCities, getCurrentAqi, getNearbyReports, getWeather, City, AqiReading, NearbyReport, Weather } from '../lib/api';
import { getDeviceLocation, reverseGeocode, searchPlace } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { spacing, type as typeScale, radius } from '../theme/tokens';

type Point = { lat: number; lon: number; label: string };

function aqiColorFor(colors: any, aqi: number | null) {
  if (aqi === null) return colors.muted;
  if (aqi <= 50) return colors.aqi.good;
  if (aqi <= 100) return colors.aqi.moderate;
  if (aqi <= 200) return colors.aqi.unhealthy;
  return colors.aqi.hazardous;
}

export function MapScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [cities, setCities] = useState<City[]>([]);
  const [point, setPoint] = useState<Point | null>(null);
  const [aqi, setAqi] = useState<AqiReading | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getCities().then((data) => {
      setCities(data);
      if (data.length > 0) setPoint({ lat: data[0].lat, lon: data[0].lon, label: data[0].name });
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!point) return;
    getCurrentAqi(point.lat, point.lon).then(setAqi).catch(() => setAqi(null));
    getWeather(point.lat, point.lon).then(setWeather).catch(() => setWeather(null));
    getNearbyReports(point.lat, point.lon).then(setReports).catch(() => setReports([]));
  }, [point]);

  async function useMyLocation() {
    setLocating(true);
    const loc = await getDeviceLocation();
    if (loc) {
      const label = await reverseGeocode(loc.lat, loc.lon);
      setPoint({ lat: loc.lat, lon: loc.lon, label });
    }
    setLocating(false);
  }

  async function handleMapPress(lat: number, lon: number) {
    const label = await reverseGeocode(lat, lon);
    setPoint({ lat, lon, label });
  }

  async function handleSearch() {
    if (!searchText.trim()) return;
    const result = await searchPlace(searchText.trim());
    if (result) { setPoint(result); setSearchText(''); }
  }

  const activeColor = aqi ? aqiColorFor(colors, aqi.aqi) : colors.signal;

  const sortedReports = [...reports].sort((a, b) => (a.distance_km ?? 0) - (b.distance_km ?? 0)).slice(0, 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={styles.header}>
        <Text style={[typeScale.title, { color: colors.ink }]}>Air Map</Text>
        <Pressable onPress={useMyLocation}>
          <Feather name={locating ? 'loader' : 'navigation'} size={20} color={colors.signal} />
        </Pressable>
      </View>

      <View style={styles.legend}>
        {[
          { label: 'Good', color: colors.aqi.good },
          { label: 'Moderate', color: colors.aqi.moderate },
          { label: 'Poor', color: colors.aqi.unhealthy },
          { label: 'Very Poor', color: colors.aqi.hazardous },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={[typeScale.small, { color: colors.muted }]}>{l.label}</Text>
          </View>
        ))}
      </View>

      <GlassCard style={styles.searchCard} intensity={35}>
        <Feather name="search" size={16} color={colors.muted} style={{ marginRight: 8 }} />
        <TextInput
          style={[styles.searchInput, { color: colors.ink }]}
          placeholder="Search a place"
          placeholderTextColor={colors.muted}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
      </GlassCard>

      {weather && (
        <View style={styles.windRow}>
          <Feather name="wind" size={12} color={colors.muted} />
          <Text style={[typeScale.small, { color: colors.muted, marginLeft: 4 }]}>
            Wind direction {weather.wind_direction_compass} · {Math.round(weather.wind_speed_kmh)} km/h
          </Text>
        </View>
      )}

      <View style={styles.mapWrap}>
        {loading || !point ? (
          <ActivityIndicator color={colors.signal} style={{ marginTop: 40 }} />
        ) : (
          <LeafletMap
            lat={point.lat}
            lon={point.lon}
            aqi={aqi?.aqi ?? null}
            aqiColor={activeColor}
            station={point.label}
            isDark={isDark}
            reports={reports}
            onMapPress={handleMapPress}
          />
        )}
      </View>

      <ScrollView style={{ marginTop: spacing.sm }} showsVerticalScrollIndicator={false}>
        {point && aqi && (
          <GlassCard style={styles.selectedCard} intensity={35}>
            <Text style={[typeScale.label, { color: colors.ink }]}>{point.label}</Text>
            <Text style={[typeScale.small, { color: activeColor }]}>
              AQI {aqi.aqi ?? '--'} · {aqiLabel(aqi.aqi)}
            </Text>
          </GlassCard>
        )}

        {sortedReports.length > 0 && (
          <>
            <Text style={[typeScale.label, { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xs }]}>
              Nearby Sources
            </Text>
            {sortedReports.map((r) => (
              <Pressable key={r.id} onPress={() => navigation.navigate('EventDetails', { id: r.id })}>
                <GlassCard style={styles.sourceRow} intensity={30}>
                  <Feather name="alert-triangle" size={16} color={colors.signal} style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[typeScale.body, { color: colors.ink }]} numberOfLines={1}>
                      {r.category || r.description || 'Pollution report'}
                    </Text>
                    <Text style={[typeScale.small, { color: colors.muted }]}>
                      {r.distance_km ? `${r.distance_km} km` : ''} · {r.status}
                    </Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {cities.map((c) => (
            <Pressable key={c.id} onPress={() => setPoint({ lat: c.lat, lon: c.lon, label: c.name })}>
              <View style={[styles.chip, { borderColor: colors.glassBorder, backgroundColor: colors.glass }]}>
                <Text style={[typeScale.small, { color: colors.ink }]}>{c.name}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  legend: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.sm, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  searchCard: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, marginBottom: spacing.xs },
  searchInput: { flex: 1, height: 40, ...typeScale.body },
  windRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  mapWrap: { height: 260, borderRadius: radius.lg, overflow: 'hidden' },
  selectedCard: { marginBottom: spacing.sm },
  sourceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  chipRow: { marginTop: spacing.sm, marginBottom: spacing.lg },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, marginRight: spacing.sm },
});