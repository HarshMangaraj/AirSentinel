import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView, Alert, Dimensions, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LeafletMap } from '../components/LeafletMap';
import { useTheme } from '../context/ThemeContext';
import { getCurrentAqi, getPollutants, getNearbyReports, getWeather, getCities, AqiReading, NearbyReport, Weather, Pollutants, City } from '../lib/api';
import { getDeviceLocation, reverseGeocode } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { spacing, typography as typeScale, radius } from '../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type Point = { lat: number; lon: number; label: string };

function aqiColorFor(aqi: number | null) {
  if (aqi === null) return '#94A3B8';
  if (aqi <= 50) return '#10B981';
  if (aqi <= 100) return '#FBBF24';
  if (aqi <= 150) return '#F97316';
  if (aqi <= 200) return '#EF4444';
  return '#8B5CF6';
}

export function MapScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [point, setPoint] = useState<Point | null>(null);
  const [aqi, setAqi] = useState<AqiReading | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [pollutants, setPollutants] = useState<Pollutants | null>(null);
  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [stations, setStations] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchText, setSearchText] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('Map');

  useEffect(() => {
    useMyLocation();
  }, []);

  useEffect(() => {
    if (!point) return;
    setLoading(true);
    
    Promise.allSettled([
      getCurrentAqi(point.lat, point.lon),
      getWeather(point.lat, point.lon),
      getPollutants(point.lat, point.lon),
      getNearbyReports(point.lat, point.lon),
      getCities(),
      fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${point.lat}&longitude=${point.lon}&hourly=us_aqi&timezone=auto`).then(res => res.json())
    ]).then(([aqiRes, wRes, pRes, rRes, cRes, forecastRes]) => {
      setAqi(aqiRes.status === 'fulfilled' ? aqiRes.value : null);
      setWeather(wRes.status === 'fulfilled' ? wRes.value : null);
      setPollutants(pRes.status === 'fulfilled' ? pRes.value : null);
      setReports(rRes.status === 'fulfilled' ? rRes.value : []);
      
      let rawCities = cRes.status === 'fulfilled' ? cRes.value : [];
      if (!Array.isArray(rawCities) && (rawCities as any)?.cities) {
        rawCities = (rawCities as any).cities;
      }
      setStations(Array.isArray(rawCities) ? rawCities : []);
      
      if (forecastRes.status === 'fulfilled' && forecastRes.value.hourly) {
        const next24h = forecastRes.value.hourly.us_aqi.slice(0, 24);
        const maxForecast = Math.max(...next24h.filter((a: any) => a !== null));
        (setAqi as any)((prev: any) => prev ? { ...prev, forecastMax: maxForecast } : null);
      }
      
      setLoading(false);
    });
  }, [point]);

  async function useMyLocation() {
    setLoading(true);
    try {
      const loc = await getDeviceLocation();
      if (loc) {
        const label = await reverseGeocode(loc.lat, loc.lon);
        setPoint({ lat: loc.lat, lon: loc.lon, label: label || 'Current Location' });
      } else {
        setPoint({ lat: 20.2961, lon: 85.8245, label: 'Bhubaneswar' });
      }
    } catch (err) {
      setPoint({ lat: 20.2961, lon: 85.8245, label: 'Bhubaneswar' });
    }
  }

  async function handleSearch() {
    if (!searchText.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchText)}&count=1&language=en&format=json`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const resPoint = data.results[0];
        setPoint({ lat: resPoint.latitude, lon: resPoint.longitude, label: resPoint.name });
        setSearchText('');
        setActiveTab('Map');
      } else {
        Alert.alert('Not Found', 'Could not find the specified place.');
      }
    } catch (err) {
      Alert.alert('Search Error', 'An error occurred while searching.');
    }
    setIsSearching(false);
  }

  const activeColor = aqiColorFor(aqi?.aqi ?? null);

  return (
    <View style={[styles.container, { backgroundColor: '#F8FAFC' }]}>
      {/* ── CONTENT LAYER (Background) ── */}
      <View style={StyleSheet.absoluteFill}>
        {activeTab === 'Map' ? (
          point && (
            <LeafletMap
              lat={point.lat}
              lon={point.lon}
              aqi={aqi?.aqi ?? null}
              aqiColor={activeColor}
              station={point.label}
              isDark={isDark}
              reports={reports}
            />
          )
        ) : (
          <ScrollView style={{ paddingTop: insets.top + 220, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
            {activeTab === 'Stations' && (
              stations.length === 0 ? <Text style={styles.emptyText}>No stations found nearby.</Text> :
              stations.map((st, i) => (
                <View key={st.id || i} style={styles.listItem}>
                  <View style={[styles.listIconBg, { backgroundColor: '#0B9B6A15' }]}>
                    <Feather name="radio" size={20} color="#0B9B6A" />
                  </View>
                  <View style={{marginLeft: 12}}>
                    <Text style={styles.listTitle}>{st.name}</Text>
                    <Text style={styles.listSub}>{st.state} • Live Monitoring</Text>
                  </View>
                </View>
              ))
            )}
            {activeTab === 'Hotspots' && (
              reports.length === 0 ? <Text style={styles.emptyText}>No hotspots reported nearby.</Text> :
              reports.map((r, i) => (
                <View key={r.id || i} style={styles.listItem}>
                  <View style={[styles.listIconBg, { backgroundColor: '#EF444415' }]}>
                    <Feather name="activity" size={20} color="#EF4444" />
                  </View>
                  <View style={{marginLeft: 12, flex: 1}}>
                    <Text style={styles.listTitle}>{r.category || r.description || 'Pollution Report'}</Text>
                    <Text style={styles.listSub}>{r.distance_km ? `${r.distance_km} km away` : 'Nearby'} • {r.status}</Text>
                  </View>
                </View>
              ))
            )}
            <View style={{ height: 100 }} />
          </ScrollView>
        )}
      </View>

      {/* ── TOP UI OVERLAY ── */}
      <View style={[styles.topUiOverlay, { paddingTop: insets.top + 10 }]} pointerEvents="box-none">
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Feather name="wind" size={24} color="#0B9B6A" style={styles.logoIcon} />
            <View>
              <Text style={styles.brandName}>AirSentinel</Text>
              <Text style={styles.brandSlogan}>Cleaner Air • Safer Tomorrow</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.iconBtn}>
              <Feather name="search" size={20} color="#1E293B" />
            </Pressable>
            <Pressable style={styles.iconBtn}>
              <Feather name="bell" size={20} color="#1E293B" />
              <View style={styles.notificationDot} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Feather name="map-pin" size={16} color="#64748B" style={{marginRight: 8}} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search areas for AQI & Prediction..."
              placeholderTextColor="#94A3B8"
              value={searchText}
              onChangeText={setSearchText}
              onSubmitEditing={handleSearch}
            />
            {isSearching && <ActivityIndicator size="small" color="#0B9B6A" />}
          </View>
        </View>

        <View style={styles.tabContainer}>
          <Pressable onPress={() => setActiveTab('Map')} style={[styles.tabBtn, activeTab === 'Map' && styles.tabBtnActive]}>
            <Feather name="map" size={16} color={activeTab === 'Map' ? '#FFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'Map' && styles.tabTextActive]}>Map</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('Stations')} style={[styles.tabBtn, activeTab === 'Stations' && styles.tabBtnActive]}>
            <Feather name="radio" size={16} color={activeTab === 'Stations' ? '#FFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'Stations' && styles.tabTextActive]}>Stations</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('Hotspots')} style={[styles.tabBtn, activeTab === 'Hotspots' && styles.tabBtnActive]}>
            <Feather name="activity" size={16} color={activeTab === 'Hotspots' ? '#FFF' : '#64748B'} />
            <Text style={[styles.tabText, activeTab === 'Hotspots' && styles.tabTextActive]}>Hotspots</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.legendScroll} contentContainerStyle={{ paddingRight: 32 }}>
          {[
            { label: 'Good', range: '0-50', color: '#10B981' },
            { label: 'Moderate', range: '51-100', color: '#FBBF24' },
            { label: 'Poor', range: '101-150', color: '#F97316' },
            { label: 'Unhealthy', range: '151-200', color: '#EF4444' },
            { label: 'Severe', range: '201+', color: '#8B5CF6' },
          ].map(item => (
            <View key={item.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <View>
                <Text style={styles.legendLabel}>{item.label}</Text>
                <Text style={styles.legendRange}>({item.range})</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ── MAP OVERLAYS ── */}
      {activeTab === 'Map' && (
        <>
          <View style={styles.floatingActions}>
            <View style={styles.fabGroup}>
              <Pressable style={styles.fabItem}><Feather name="layers" size={20} color="#1E293B" /></Pressable>
              <View style={styles.fabDivider} />
              <Pressable style={styles.fabItem} onPress={useMyLocation}><Feather name="crosshair" size={20} color="#1E293B" /></Pressable>
            </View>
            <View style={styles.fabGroup}>
              <Pressable style={styles.fabItem}><Feather name="plus" size={20} color="#1E293B" /></Pressable>
              <View style={styles.fabDivider} />
              <Pressable style={styles.fabItem}><Feather name="minus" size={20} color="#1E293B" /></Pressable>
            </View>
          </View>

          <View style={styles.bottomSheet}>
            {loading ? (
               <ActivityIndicator size="large" color="#0B9B6A" style={{marginVertical: 40}} />
            ) : (
              <>
                <View style={styles.bsHeader}>
                  <View style={[styles.aqiCircle, { borderColor: activeColor }]}>
                    <Text style={[styles.aqiCircleValue, { color: activeColor }]}>{aqi?.aqi ?? '--'}</Text>
                    <Feather name="wind" size={14} color={activeColor} style={{ marginTop: -2 }} />
                  </View>
                  <View style={styles.bsInfo}>
                    <Text style={styles.bsTitle}>Air Quality Sensor</Text>
                    <View style={styles.bsRow}>
                      <Feather name="map-pin" size={12} color="#64748B" />
                      <Text style={styles.bsSubText}>{point?.label}</Text>
                    </View>
                    <View style={styles.bsRow}>
                      <Feather name="clock" size={12} color="#64748B" />
                      <Text style={styles.bsSubText}>Updated just now</Text>
                    </View>
                    {(aqi as any)?.forecastMax && (
                      <View style={[styles.bsRow, { marginTop: 4 }]}>
                        <Feather name="trending-up" size={12} color="#0B9B6A" />
                        <Text style={[styles.bsSubText, { color: '#0B9B6A', fontWeight: '600' }]}>
                          24h Forecast: Max AQI {(aqi as any).forecastMax}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.bsBadge, { backgroundColor: activeColor + '20' }]}>
                    <Feather name="wind" size={14} color={activeColor} />
                    <Text style={[styles.bsBadgeText, { color: activeColor }]}>{aqiLabel(aqi?.aqi ?? 0)}</Text>
                  </View>
                </View>
                
                <View style={styles.bsDivider} />

                <View style={styles.bsMetricsRow}>
                  <View style={styles.pollutantsGrid}>
                    {[
                      { label: 'PM2.5', val: pollutants?.pm2_5, color: '#0B9B6A' },
                      { label: 'PM10', val: pollutants?.pm10, color: '#0B9B6A' },
                      { label: 'NO₂', val: pollutants?.no2, color: '#0B9B6A' },
                      { label: 'SO₂', val: pollutants?.so2, color: '#0B9B6A' },
                    ].map((item, idx) => (
                      <View key={idx} style={styles.pollutantCol}>
                        <Text style={styles.pollutantLabel}>{item.label}</Text>
                        <Text style={[styles.pollutantVal, { color: item.color }]}>{item.val ?? '--'}</Text>
                        <Text style={styles.pollutantUnit}>µg/m³</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.weatherBox}>
                    <View style={styles.wRow}>
                      <Feather name="cloud" size={24} color="#3B82F6" />
                      <View style={{marginLeft: 10}}>
                        <Text style={styles.wTemp}>{weather?.temperature_c ?? '--'}°C</Text>
                        <Text style={styles.wDesc}>Partly Cloudy</Text>
                      </View>
                    </View>
                    <View style={[styles.wRow, {marginTop: 10}]}>
                      <Feather name="wind" size={16} color="#64748B" />
                      <Text style={styles.wWind}>Wind {weather?.wind_speed_kmh ?? '--'} km/h {weather?.wind_direction_compass ?? ''}</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        </>
      )}
      <View style={{ height: 80 }} /> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topUiOverlay: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 16, zIndex: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { marginRight: 10 },
  brandName: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  brandSlogan: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  notificationDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: '#FFF' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 24, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 20, gap: 6 },
  tabBtnActive: { backgroundColor: '#0B9B6A' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  tabTextActive: { color: '#FFF' },
  searchWrap: { marginBottom: 16 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 12, paddingHorizontal: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, height: 48 },
  searchInput: { flex: 1, fontSize: 16, color: '#1E293B', fontWeight: '500', height: 48, paddingVertical: 0 },
  legendScroll: { marginBottom: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendLabel: { fontSize: 11, fontWeight: '600', color: '#1E293B' },
  legendRange: { fontSize: 10, color: '#64748B' },
  floatingActions: { position: 'absolute', right: 16, top: SCREEN_HEIGHT / 2 - 40, zIndex: 10, gap: 16 },
  fabGroup: { backgroundColor: '#FFF', borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  fabItem: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  fabDivider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 8 },
  bottomSheet: { position: 'absolute', bottom: 90, left: 16, right: 16, backgroundColor: '#FFF', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 10, zIndex: 10 },
  bsHeader: { flexDirection: 'row', alignItems: 'center' },
  aqiCircle: { width: 56, height: 56, borderRadius: 28, borderWidth: 4, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  aqiCircleValue: { fontSize: 20, fontWeight: '800', marginTop: -2 },
  bsInfo: { flex: 1 },
  bsTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  bsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  bsSubText: { fontSize: 12, color: '#64748B' },
  bsBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, gap: 4 },
  bsBadgeText: { fontSize: 12, fontWeight: '700' },
  bsDivider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  bsMetricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  pollutantsGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', rowGap: 16 },
  pollutantCol: { width: '50%' },
  pollutantLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', marginBottom: 2 },
  pollutantVal: { fontSize: 18, fontWeight: '800', marginBottom: 1 },
  pollutantUnit: { fontSize: 10, color: '#94A3B8' },
  weatherBox: { flex: 0.8, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 12, justifyContent: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  wRow: { flexDirection: 'row', alignItems: 'center' },
  wTemp: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  wDesc: { fontSize: 11, color: '#64748B', marginTop: 2 },
  wWind: { fontSize: 11, color: '#475569', marginLeft: 6, fontWeight: '500' },
  listItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  listIconBg: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  listTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A' },
  listSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 15, fontWeight: '500' }
});