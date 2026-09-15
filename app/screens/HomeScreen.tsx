import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { LeafletMap } from '../components/LeafletMap';
import { useAuth } from '../context/AuthContext';
import { getCities, getCurrentAqi, City, AqiReading } from '../lib/api';
import { aqiColor, aqiLabel } from '../lib/aqiScale';
import { colors, type, spacing, radius } from '../theme/tokens';

export function HomeScreen() {
  const { signOut } = useAuth();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [aqi, setAqi] = useState<AqiReading | null>(null);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingAqi, setLoadingAqi] = useState(false);

  useEffect(() => {
    getCities()
      .then((data) => {
        setCities(data);
        if (data.length > 0) setSelectedCity(data[0]);
      })
      .finally(() => setLoadingCities(false));
  }, []);

 const [aqiError, setAqiError] = useState(false);

  useEffect(() => {
    if (!selectedCity) return;
    setLoadingAqi(true);
    setAqi(null);
    setAqiError(false);
    getCurrentAqi(selectedCity.lat, selectedCity.lon)
      .then(setAqi)
      .catch(() => setAqiError(true))
      .finally(() => setLoadingAqi(false));
  }, [selectedCity]);
  
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

      <FlatList
        horizontal
        data={cities}
        keyExtractor={(c) => c.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cityList}
        renderItem={({ item }) => {
          const active = selectedCity?.id === item.id;
          return (
            <Pressable
              onPress={() => setSelectedCity(item)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item.name}
              </Text>
            </Pressable>
          );
        }}
      />

      {loadingAqi || !aqi ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.signal} />
        </View>
      ) : (
        <>
          <View style={styles.aqiCard}>
            <View>
              <Text style={type.small}>{aqi.station}</Text>
              <Text style={[type.hero, { color: aqiColor(aqi.aqi) }]}>{aqi.aqi}</Text>
              <Text style={type.label}>{aqiLabel(aqi.aqi)}</Text>
            </View>
            <View style={[styles.dot, { backgroundColor: aqiColor(aqi.aqi) }]} />
          </View>

          <View style={styles.mapContainer}>
            <LeafletMap
              lat={selectedCity!.lat}
              lon={selectedCity!.lon}
              aqi={aqi.aqi}
              aqiColor={aqiColor(aqi.aqi)}
              station={aqi.station}
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
  },
  signOut: { color: colors.muted, ...type.label },
  cityList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
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
  aqiCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  dot: { width: 16, height: 16, borderRadius: 8 },
  mapContainer: { flex: 1, marginTop: spacing.sm },
});