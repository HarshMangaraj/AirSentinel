import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { LeafletMap } from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { getCities, getCurrentAqi, City, AqiReading } from '../lib/api';
import { getDeviceLocation, reverseGeocode } from '../lib/location';
import { aqiColor, aqiLabel } from '../lib/aqiScale';
import { colors, type, spacing, radius } from '../theme/tokens';

type Point = { lat: number; lon: number; label: string };

export function HomeScreen() {
  const { signOut } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [point, setPoint] = useState<Point | null>(null);
  const [aqi, setAqi] = useState<AqiReading | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAqi, setLoadingAqi] = useState(false);
  const [aqiError, setAqiError] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    getCities()
      .then((data) => {
        setCities(data);
        if (data.length > 0) {
          setPoint({ lat: data[0].lat, lon: data[0].lon, label: data[0].name });
        }
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
      .then((data) => {
        if (!cancelled) setAqi(data);
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
  }, [point]);

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

  if (loadingCities) {
    return (
      <Screen style={styles.center}>
        <ActivityIndicator color={colors.signal} />
      </Screen>
    );
  }

  return (
    <Screen style={{ padding: 0 }}>
      <View style={styles.header}>
        <Text style={type.title}>AirSentinel</Text>
        <Pressable onPress={signOut}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.locateBtn} onPress={useMyLocation} disabled={locating}>
          <Text style={styles.locateBtnText}>
            {locating ? 'Locating…' : '📍 Use my location'}
          </Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={cities}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityList}
        renderItem={({ item }) => {
          const active = point?.label === item.name;
          return (
            <Pressable
              onPress={() => setPoint({ lat: item.lat, lon: item.lon, label: item.name })}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      <Text style={styles.tapHint}>Or tap anywhere on the map to check that spot</Text>

      {loadingAqi ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.signal} />
        </View>
      ) : aqiError || !aqi ? (
        <View style={styles.center}>
          <Text style={[type.body, styles.errorText]}>
            AQI data isn't available for {point?.label} right now. Try another spot on the map.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.aqiCard}>
            <View>
              <Text style={type.small}>{point?.label}</Text>
              <Text style={[type.hero, { color: aqiColor(aqi.aqi) }]}>{aqi.aqi}</Text>
              <Text style={type.label}>{aqiLabel(aqi.aqi)}</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: aqiColor(aqi.aqi) }]} />
          </View>

          <View style={styles.mapContainer}>
            <LeafletMap
              lat={point!.lat}
              lon={point!.lon}
              aqi={aqi.aqi}
              aqiColor={aqiColor(aqi.aqi)}
              station={point!.label}
              onMapPress={handleMapPress}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  signOut: { color: colors.muted, ...type.label },
  actionRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  locateBtn: {
    borderWidth: 1,
    borderColor: colors.signal,
    borderRadius: radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  locateBtnText: { ...type.label, color: colors.signal },
  cityList: { paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.signal, borderColor: colors.signal },
  chipText: { ...type.label, color: colors.ink },
  chipTextActive: { color: colors.paper },
  tapHint: { ...type.small, color: colors.muted, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  aqiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  errorText: { color: colors.muted, textAlign: 'center', paddingHorizontal: 24 },
  dot: { width: 16, height: 16, borderRadius: 8 },
  mapContainer: { flex: 1, marginTop: spacing.sm },
});