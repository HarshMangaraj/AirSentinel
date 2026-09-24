import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Path,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  Circle,
  Rect,
  Text as SvgText,
  G,
  Ellipse,
} from 'react-native-svg';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  getWeather,
  getAqiHistory,
  getPollutants,
  getCurrentAqi,
  Weather,
  AqiHistory,
  Pollutants,
  AqiReading,
} from '../lib/api';
import { getDeviceLocation, reverseGeocode } from '../lib/location';
import { aqiLabel } from '../lib/aqiScale';
import { spacing, radius } from '../theme/tokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = 20;

// ============================================================
// COLOR PALETTE — matching reference screenshot
// ============================================================
const C = {
  bgPage: '#F0F7F4',
  white: '#FFFFFF',
  ink: '#1A2B2B',
  inkSoft: '#3D5A5A',
  muted: '#94A3B8',
  mutedDark: '#607070',
  green: '#0FB87C',
  greenDark: '#0A9A68',
  greenLight: '#C8F5E2',
  greenSoft: '#E2F8F0',
  teal: '#0BBFA8',
  yellow: '#F5A623',
  yellowLight: '#FEF3D0',
  orange: '#F97316',
  orangeLight: '#FFEDD5',
  blue: '#3B82F6',
  blueLight: '#DBEAFE',
  purple: '#8B5CF6',
  purpleLight: '#EDE9FE',
  red: '#EF4444',
  border: '#E8F2EE',
  shadow: 'rgba(10, 40, 30, 0.10)',
  heroBg: '#1DB87C',
  heroBgDark: '#0F9A60',
};

// ============================================================
// UI COMPONENTS
// ============================================================

// Cityscape overlay for the hero AQI card
const HeroCityscape = () => (
  <View style={StyleSheet.absoluteFill} pointerEvents="none">
    <Svg width="100%" height="100%" viewBox="0 0 340 120" preserveAspectRatio="xMaxYMax meet">
      <Path d="M200 90 Q240 50 280 80 T340 65 V120 H200 Z" fill="rgba(255,255,255,0.12)" />
      <Path d="M240 100 Q270 60 310 85 T370 70 V120 H240 Z" fill="rgba(255,255,255,0.08)" />
      <Rect x="255" y="50" width="18" height="70" rx="2" fill="rgba(255,255,255,0.15)" />
      <Rect x="277" y="35" width="22" height="85" rx="2" fill="rgba(255,255,255,0.12)" />
      <Rect x="303" y="58" width="15" height="62" rx="2" fill="rgba(255,255,255,0.10)" />
      <Rect x="322" y="45" width="20" height="75" rx="2" fill="rgba(255,255,255,0.13)" />
      <Rect x="260" y="57" width="4" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
      <Rect x="267" y="57" width="4" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
      <Rect x="260" y="65" width="4" height="4" rx="1" fill="rgba(255,255,255,0.3)" />
      <Rect x="267" y="65" width="4" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
      <Rect x="283" y="42" width="4" height="4" rx="1" fill="rgba(255,255,255,0.5)" />
      <Rect x="291" y="42" width="4" height="4" rx="1" fill="rgba(255,255,255,0.3)" />
      <Ellipse cx="248" cy="98" rx="10" ry="14" fill="rgba(255,255,255,0.18)" />
      <Ellipse cx="340" cy="96" rx="12" ry="16" fill="rgba(255,255,255,0.15)" />
      <Ellipse cx="220" cy="28" rx="18" ry="8" fill="rgba(255,255,255,0.25)" />
      <Ellipse cx="235" cy="25" rx="12" ry="6" fill="rgba(255,255,255,0.20)" />
    </Svg>
  </View>
);

const CircularGauge = ({ value = 0, color = C.heroBg }: { value: number; color: string }) => {
  const size = 105;
  const strokeWidth = 9;
  const rad = (size - strokeWidth) / 2;
  const circumference = rad * 2 * Math.PI;
  const progress = Math.min(value / 300, 1);
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={rad} stroke="rgba(255,255,255,0.3)" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2} cy={size / 2} r={rad}
          stroke="rgba(255,255,255,0.95)" strokeWidth={strokeWidth} fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: C.white, letterSpacing: -1 }}>{value}</Text>
        <Text style={{ fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.8)', marginTop: -2 }}>AQI</Text>
      </View>
    </View>
  );
};

const PollutantCard = ({ label, value, unit, bg, fg, icon }: any) => (
  <View style={[styles.pollutantCard, { backgroundColor: bg }]}>
    <View style={styles.pollutantTop}>
      <Feather name={icon} size={12} color={fg} style={{ opacity: 0.75 }} />
    </View>
    <Text style={[styles.pollutantLabel, { color: fg }]}>{label}</Text>
    <Text style={[styles.pollutantValue, { color: fg }]}>{value}</Text>
    <Text style={[styles.pollutantUnit, { color: fg }]}>{unit}</Text>
  </View>
);

const HealthTipCard = ({ bgColor, iconColor, icon, title, bullets }: any) => (
  <View style={[styles.tipCard, { backgroundColor: bgColor }]}>
    <View style={[styles.tipIconContainer, { backgroundColor: 'rgba(255,255,255,0.65)' }]}>
      <Feather name={icon} size={22} color={iconColor} />
    </View>
    <View style={{ flex: 1, paddingRight: 4 }}>
      <Text style={[styles.tipTitle, { color: C.ink }]}>{title}</Text>
      {bullets.map((bullet: string, idx: number) => (
        <View key={idx} style={{ flexDirection: 'row', marginTop: 5 }}>
          <Text style={[styles.tipBulletDot, { color: iconColor }]}>• </Text>
          <Text style={styles.tipDesc}>{bullet}</Text>
        </View>
      ))}
    </View>
  </View>
);

const HEALTH_TIPS = [
  {
    bgColor: '#E0F5EC',
    iconColor: '#0A9A68',
    icon: 'shield' as const,
    title: 'Mask Recommendation',
    bullets: [
      'Air quality is Good. No mask required today.',
      'Carry an N95/KN95 mask if AQI exceeds 100.',
    ],
  },
  {
    bgColor: '#FEF3C7',
    iconColor: '#D97706',
    icon: 'home' as const,
    title: 'Indoor Protection',
    bullets: [
      'Keep windows open during low-pollution morning hours for optimal air ventilation.',
      'Run HEPA air purifiers if indoors near high-traffic roads.',
    ],
  },
  {
    bgColor: '#E0F5EC',
    iconColor: '#059669',
    icon: 'activity' as const,
    title: 'Outdoor Activities & Exercise',
    bullets: [
      'Safe for all outdoor sports, running, and cycling.',
      'Sensitive groups (asthma/respiratory) can exercise without special precautions today.',
    ],
  },
  {
    bgColor: '#EDE9FE',
    iconColor: '#7C3AED',
    icon: 'coffee' as const,
    title: 'Diet & Hydration Advice',
    bullets: [
      'Drink at least 2–3L water to help flush toxins.',
      'Consume antioxidant-rich foods (Vitamin C & E, citrus fruits, leafy greens).',
    ],
  },
];

const HealthTipsCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING * 2;

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % HEALTH_TIPS.length;
        flatRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const onMomentumScrollEnd = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / CARD_WIDTH);
    setActiveIndex(idx);
    startTimer();
  };

  return (
    <View>
      <FlatList
        ref={flatRef}  
        data={HEALTH_TIPS}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: CARD_WIDTH, offset: CARD_WIDTH * index, index })}
        renderItem={({ item }) => (
          <View style={{ width: CARD_WIDTH }}>
            <HealthTipCard {...item} />
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {HEALTH_TIPS.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex ? styles.dotActive : styles.dotInactive]} />
        ))}
      </View>
    </View>
  );
};

const OutlookBars = ({ value }: { value: number }) => (
  <View style={styles.barsRow}>
    {[
      { day: 'Today', val: value, color: C.green },
      { day: 'Tomorrow', val: Math.min(value + 3, 300), color: C.green },
      { day: 'Day 3', val: Math.min(value + 6, 300), color: C.yellow },
    ].map((item, i) => (
      <View key={i} style={styles.barCol}>
        <Text style={[styles.barValue, { color: item.color }]}>{item.val}</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { height: `${(item.val / 200) * 100}%`, backgroundColor: item.color }]} />
        </View>
        <Text style={styles.barLabel}>{item.day}</Text>
      </View>
    ))}
  </View>
);

const TrendChartComp = ({ readings = [] }: { readings: any[] }) => {
  const w = SCREEN_WIDTH - CARD_PADDING * 2 - 32;
  const h = 150;

  if (!readings || readings.length < 2) {
    const pts = [
      { x: 30, y: 115 }, { x: 70, y: 100 }, { x: 110, y: 75 }, { x: 155, y: 42 },
      { x: 195, y: 52 }, { x: 235, y: 38 }, { x: w, y: 78 },
    ];
    let pPath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i], cpx = (p.x + c.x) / 2;
      pPath += ` C ${cpx} ${p.y} ${cpx} ${c.y} ${c.x} ${c.y}`;
    }
    const aPath = `${pPath} L ${w} 125 L 30 125 Z`;
    return (
      <View style={{ height: h + 24, width: '100%' }}>
        <Svg height={h} width="100%">
          <Defs>
            <SvgLinearGradient id="areaGradP" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={C.green} stopOpacity="0.35" />
              <Stop offset="0.6" stopColor={C.yellow} stopOpacity="0.15" />
              <Stop offset="1" stopColor={C.yellow} stopOpacity="0.02" />
            </SvgLinearGradient>
          </Defs>
          {[0, 50, 100, 150, 200, 250].map((v, i) => {
            const y = 120 - (v / 250) * 110;
            return (
              <G key={i}>
                <Path d={`M 30 ${y} L ${w} ${y}`} stroke="#E8F2EE" strokeWidth="1" />
                <SvgText x="0" y={y + 4} fill={C.muted} fontSize="9">{v}</SvgText>
              </G>
            );
          })}
          <Path d={aPath} fill="url(#areaGradP)" />
          <Path d={pPath} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <Circle cx={w} cy="78" r="5" fill={C.green} />
          <Circle cx={w} cy="78" r="10" fill={C.green} fillOpacity="0.18" />
        </Svg>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 30, marginTop: 6 }}>
          {['00:00', '00:00', '10:00', '15:00', '20:00'].map((t, i) => (
            <Text key={i} style={{ fontSize: 9, color: C.muted }}>{t}</Text>
          ))}
        </View>
      </View>
    );
  }

  const padding = 30;
  const cW = w - padding;
  const cH = h - 30;
  const maxVal = Math.max(...readings.map((r: any) => r.aqi), 100);
  const points = readings.map((r: any, i: number) => ({
    x: padding + (i / (readings.length - 1)) * (cW - 10),
    y: cH - (r.aqi / maxVal) * cH,
  }));
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1], curr = points[i];
    const cpx = (prev.x + curr.x) / 2;
    path += ` C ${cpx} ${prev.y} ${cpx} ${curr.y} ${curr.x} ${curr.y}`;
  }
  const areaPath = `${path} L ${points[points.length - 1].x} ${cH} L ${points[0].x} ${cH} Z`;

  return (
    <View style={{ height: h + 24, width: '100%' }}>
      <Svg height={h} width="100%">
        <Defs>
          <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={C.green} stopOpacity="0.3" />
            <Stop offset="0.6" stopColor={C.yellow} stopOpacity="0.12" />
            <Stop offset="1" stopColor={C.yellow} stopOpacity="0.02" />
          </SvgLinearGradient>
        </Defs>
        <G>
          {[0, 50, 100, 150, 200, 250].map((v, i) => {
            const y = cH - (v / 250) * cH;
            return (
              <G key={i}>
                <Path d={`M ${padding} ${y} L ${w} ${y}`} stroke="#E8F2EE" strokeWidth="1" />
                <SvgText x="0" y={y + 3} fill={C.muted} fontSize="9">{v}</SvgText>
              </G>
            );
          })}
        </G>
        <Path d={areaPath} fill="url(#areaGrad)" />
        <Path d={path} fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="5" fill={C.green} />
        <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="10" fill={C.green} fillOpacity="0.18" />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingLeft: padding, marginTop: 6 }}>
        {['00:00', '06:00', '12:00', '18:00', '23:00'].map(t => (
          <Text key={t} style={{ fontSize: 9, color: C.muted }}>{t}</Text>
        ))}
      </View>
    </View>
  );
};

const PulsingDot = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.5, duration: 1000, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [scale]);

  return (
    <View style={styles.pulseContainer}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale }] }]} />
      <View style={styles.pulseCore} />
    </View>
  );
};

// ============================================================
// MAIN HOME SCREEN
// ============================================================
export function HomeScreen({ navigation }: any) {
  const { session } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [locationLabel, setLocationLabel] = useState('Locating...');
  const [latestAqi, setLatestAqi] = useState<AqiReading | null>(null);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [history, setHistory] = useState<AqiHistory | null>(null);
  const [pollutants, setPollutants] = useState<Pollutants | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loc = await getDeviceLocation().catch(() => null);
        const point = loc || { lat: 28.6139, lon: 77.209 };

        const [label] = await Promise.all([
          loc ? reverseGeocode(loc.lat, loc.lon).catch(() => 'Mountain View') : Promise.resolve('Mountain View'),
        ]);

        if (!isMounted) return;
        setLocationLabel(label);

        const results = await Promise.allSettled([
          getCurrentAqi(point.lat, point.lon),
          getWeather(point.lat, point.lon),
          getPollutants(point.lat, point.lon),
          getAqiHistory(point.lat, point.lon),
        ]);

        if (!isMounted) return;
        const [latestRes, weatherRes, pollutantRes, historyRes] = results;
        setLatestAqi(latestRes.status === 'fulfilled' ? latestRes.value : null);
        setWeather(weatherRes.status === 'fulfilled' ? weatherRes.value : null);
        setPollutants(pollutantRes.status === 'fulfilled' ? pollutantRes.value : null);
        setHistory(historyRes.status === 'fulfilled' ? historyRes.value : null);
      } catch (err) {
        console.error('HomeScreen Init Error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const currentAqi = latestAqi?.aqi ?? 42;
  const username = session?.user.email?.split('@')[0] || 'User';

  const pollutantData = [
    { label: 'PM2.5', value: pollutants?.pm2_5?.toFixed(1) || '8.7', unit: 'µg/m³', bg: '#E0F5EC', fg: '#0A8F5C', icon: 'wind' as const },
    { label: 'PM10', value: pollutants?.pm10?.toFixed(1) || '10.0', unit: 'µg/m³', bg: '#DBEAFE', fg: '#2563EB', icon: 'cloud' as const },
    { label: 'NO2', value: pollutants?.no2?.toFixed(1) || '29.1', unit: 'µg/m³', bg: '#EDE9FE', fg: '#7C3AED', icon: 'zap' as const },
    { label: 'SO2', value: pollutants?.so2?.toFixed(1) || '1.4', unit: 'µg/m³', bg: '#FFEDD5', fg: '#C2410C', icon: 'sun' as const },
    { label: 'O3', value: pollutants?.o3?.toFixed(1) || '11.0', unit: 'µg/m³', bg: '#FEF3C7', fg: '#B45309', icon: 'sun' as const },
    { label: 'CO', value: pollutants?.co?.toFixed(1) || '169.0', unit: 'µg/m³', bg: '#E0F2FE', fg: '#0369A1', icon: 'droplet' as const },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bgPage }}>
        <ActivityIndicator size="large" color={C.green} />
        <Text style={{ marginTop: 12, color: C.mutedDark, fontWeight: '600' }}>Syncing dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bgPage} />
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* ── HEADER ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Good Morning,</Text>
              <Text style={styles.username}>{username}</Text>
              <View style={styles.locationRow}>
                <View style={styles.locPinBg}>
                  <Feather name="map-pin" size={11} color={C.green} />
                </View>
                <Text style={styles.locationText}>{locationLabel}</Text>
                <Feather name="chevron-down" size={13} color={C.mutedDark} />
              </View>
            </View>
            <View style={styles.headerIcons}>
              <Pressable onPress={toggleTheme} style={styles.iconBtn}>
                <Feather name={isDark ? 'sun' : 'moon'} size={19} color={C.ink} />
              </Pressable>
              <Pressable style={styles.iconBtn}>
                <Feather name="bell" size={19} color={C.ink} />
                <PulsingDot />
              </Pressable>
            </View>
          </View>

          {/* ── HERO AQI CARD (green with cityscape) ── */}
          <View style={styles.heroCard}>
            <LinearGradient
              colors={[C.heroBg, C.heroBgDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <HeroCityscape />
            <CircularGauge value={currentAqi} color={C.heroBg} />
            <View style={styles.heroStats}>
              <View style={styles.aqiGoodBadge}>
                <View style={[styles.aqiBadgeDot, { backgroundColor: C.white }]} />
                <Text style={styles.aqiBadgeText}>Air Quality is {aqiLabel(currentAqi)}</Text>
              </View>
              <Text style={styles.heroSubtitle}>Enjoy outdoor activities with minimal risk.</Text>
              <View style={styles.heroStatRow}>
                <View style={styles.heroStatItem}>
                  <Feather name="wind" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statVal}>{weather ? `${Math.round(weather.wind_speed_kmh)} km/h` : '2 km/h'}</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <Feather name="droplet" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statVal}>{weather ? `${Math.round(weather.humidity_pct)}%` : '94%'}</Text>
                </View>
                <View style={styles.heroStatItem}>
                  <Feather name="thermometer" size={11} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.statVal}>{weather ? `${Math.round(weather.temperature_c)}°C` : '14°C'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* ── POLLUTANT BREAKDOWN ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="grid" size={14} color={C.green} />
              <Text style={styles.sectionTitle}>Pollutant Breakdown</Text>
            </View>
            <Text style={styles.link}>View Details →</Text>
          </View>
          <View style={styles.pollutantGrid}>
            {pollutantData.map((p, i) => <PollutantCard key={i} {...p} />)}
          </View>

          {/* ── WEATHER CARDS ROW ── */}
          <View style={styles.weatherCardRow}>
            <View style={[styles.smallWeatherCard, { backgroundColor: '#EBF8FF' }]}>
              <View style={styles.weatherTopRow}>
                <View style={[styles.weatherIconCircle, { backgroundColor: '#BFDBFE' }]}>
                  <Feather name="wind" size={16} color={C.blue} />
                </View>
                <View style={{ opacity: 0.75 }}>
                  <Svg width="54" height="36" viewBox="0 0 54 36">
                    <Path d="M4 18 Q14 8 24 18 T44 18" stroke={C.blue} strokeWidth="2" fill="none" opacity="0.5" />
                    <Path d="M4 25 Q14 15 24 25 T44 25" stroke={C.blue} strokeWidth="1.5" fill="none" opacity="0.3" />
                    <Path d="M4 11 Q14 3 24 11 T44 11" stroke={C.blue} strokeWidth="1.5" fill="none" opacity="0.25" />
                  </Svg>
                </View>
              </View>
              <Text style={styles.weatherCardLabel}>Wind Speed</Text>
              <Text style={[styles.weatherCardVal, { color: '#1D4ED8' }]}>{weather ? `${Math.round(weather.wind_speed_kmh)} km/h` : '2 km/h'}</Text>
              <Text style={styles.weatherCardSub}>Light Breeze</Text>
            </View>
            <View style={[styles.smallWeatherCard, { backgroundColor: '#FFFBEB' }]}>
              <View style={styles.weatherTopRow}>
                <View style={[styles.weatherIconCircle, { backgroundColor: '#FDE68A' }]}>
                  <Feather name="sun" size={16} color={C.yellow} />
                </View>
                <View style={{ opacity: 0.75 }}>
                  <Svg width="54" height="36" viewBox="0 0 54 36">
                    <Circle cx="27" cy="18" r="9" fill={C.yellow} opacity="0.35" />
                    <Circle cx="27" cy="18" r="5" fill={C.yellow} opacity="0.6" />
                    <Path d="M27 4 L27 8" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                    <Path d="M27 28 L27 32" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                    <Path d="M13 18 L17 18" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                    <Path d="M37 18 L41 18" stroke={C.yellow} strokeWidth="2" strokeLinecap="round" opacity="0.55" />
                  </Svg>
                </View>
              </View>
              <Text style={styles.weatherCardLabel}>Weather</Text>
              <Text style={[styles.weatherCardVal, { color: '#92400E' }]}>{weather ? `${Math.round(weather.temperature_c)}°C` : '14°C'}</Text>
              <Text style={styles.weatherCardSub}>{weather ? `${Math.round(weather.humidity_pct)}%` : '94%'} Humidity</Text>
            </View>
          </View>

          {/* ── POLLUTION OUTLOOK ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="trending-up" size={14} color={C.green} />
              <Text style={styles.sectionTitle}>Pollution Outlook</Text>
            </View>
            <Text style={styles.link}>View Forecast →</Text>
          </View>
          <View style={styles.whiteCard}>
            <View style={styles.next3Badge}>
              <Text style={styles.next3Text}>NEXT 3 DAYS</Text>
            </View>
            <Text style={styles.outlookDesc}>
              Air quality is expected to remain in the{' '}
              <Text style={{ color: C.green, fontWeight: '700' }}>Good</Text>{' '}
              category with no significant changes.
            </Text>
            <OutlookBars value={currentAqi} />
          </View>

          {/* ── YOUR AREA MAP CARD ── */}
          <View style={[styles.whiteCard, { marginTop: 16, padding: 14 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.mapIconBg, { backgroundColor: C.greenLight }]}>
                  <Feather name="map-pin" size={16} color={C.green} />
                </View>
                <View>
                  <Text style={{ fontSize: 11, color: C.mutedDark, fontWeight: '600' }}>Your Area</Text>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: C.ink }}>{locationLabel}</Text>
                  <Text style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>Real-time data from local monitoring stations</Text>
                </View>
              </View>
              <Pressable style={styles.viewMapBtn}>
                <Text style={styles.viewMapText}>View Map</Text>
                <Feather name="arrow-right" size={11} color={C.green} />
              </Pressable>
            </View>
          </View>

          {/* ── CLEANER AIR BANNER ── */}
          <Pressable style={styles.bannerCard}>
            <LinearGradient
              colors={[C.heroBg, C.teal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
              <Svg width="100%" height="65" viewBox="0 0 340 65" preserveAspectRatio="xMaxYMax meet" style={{ position: 'absolute', bottom: 0 }}>
                <Ellipse cx="285" cy="52" rx="42" ry="22" fill="rgba(255,255,255,0.10)" />
                <Rect x="248" y="22" width="12" height="43" rx="2" fill="rgba(255,255,255,0.12)" />
                <Rect x="264" y="12" width="16" height="53" rx="2" fill="rgba(255,255,255,0.10)" />
                <Rect x="284" y="27" width="11" height="38" rx="2" fill="rgba(255,255,255,0.09)" />
                <Rect x="299" y="17" width="18" height="48" rx="2" fill="rgba(255,255,255,0.11)" />
                <Ellipse cx="239" cy="57" rx="12" ry="16" fill="rgba(255,255,255,0.15)" />
                <Ellipse cx="328" cy="55" rx="10" ry="13" fill="rgba(255,255,255,0.12)" />
              </Svg>
            </View>
            <View style={{ flex: 1, zIndex: 1 }}>
              <View style={styles.bannerLeafBg}>
                <Feather name="feather" size={16} color={C.white} />
              </View>
              <Text style={styles.bannerTitle}>Cleaner Air, Healthier Tomorrow</Text>
              <Text style={styles.bannerSub}>Track • Understand • Take Action</Text>
            </View>
            <Feather name="chevron-right" size={22} color="rgba(255,255,255,0.75)" />
          </Pressable>

          {/* ── 24H TREND CHART ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="trending-up" size={14} color={C.green} />
              <Text style={styles.sectionTitle}>24-Hour Air Quality Trend</Text>
            </View>
            <Text style={styles.link}>Detailed Chart →</Text>
          </View>
          <View style={styles.whiteCard}>
            <TrendChartComp readings={history?.readings || []} />
          </View>

          {/* ── NEARBY STATION ACTIVITY ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="radio" size={14} color={C.green} />
              <Text style={styles.sectionTitle}>Nearby Station Activity</Text>
            </View>
          </View>
          <View style={styles.whiteCard}>
            {latestAqi?.sources && latestAqi.sources.length > 0 ? (
              latestAqi.sources.map((s, i, arr) => {
                const val = s.aqi ?? 0;
                const status = aqiLabel(val);
                const color = val <= 50 ? C.green : val <= 100 ? C.yellow : val <= 150 ? C.orange : C.red;
                return (
                  <View key={i} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={[styles.statusDot, { backgroundColor: color }]} />
                    <Text style={styles.stationName} numberOfLines={1}>{s.station || s.source} -</Text>
                    <Text style={[styles.stationStatus, { color }]}>{val} {status}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={{ color: C.mutedDark, fontSize: 12 }}>No nearby station data available.</Text>
            )}
          </View>

          {/* ── HEALTH & PROTECTION TIPS CAROUSEL ── */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Feather name="shield" size={14} color={C.green} />
              <Text style={styles.sectionTitle}>Health & Protection Tips</Text>
            </View>
          </View>
          <Text style={styles.tipsIntro}>Actionable advice based on current air quality levels</Text>
          <HealthTipsCarousel />

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bgPage },
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: CARD_PADDING, paddingBottom: 48, paddingTop: 8 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  greeting: { fontSize: 12, color: C.mutedDark, fontWeight: '600' },
  username: { fontSize: 21, fontWeight: '800', color: C.ink, marginTop: 1, letterSpacing: -0.3 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 5 },
  locPinBg: { width: 20, height: 20, borderRadius: 10, backgroundColor: C.greenLight, alignItems: 'center', justifyContent: 'center' },
  locationText: { fontSize: 13, fontWeight: '700', color: C.ink },
  headerIcons: { flexDirection: 'row', gap: 10, marginTop: 4 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: C.white,
    alignItems: 'center', justifyContent: 'center',
    elevation: 3, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },

  heroCard: {
    borderRadius: 28, flexDirection: 'row', alignItems: 'center',
    padding: 20, overflow: 'hidden',
    elevation: 8, shadowColor: C.heroBg, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 8 },
    marginBottom: 4,
  },
  heroStats: { flex: 1, marginLeft: 16 },
  aqiGoodBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.22)',
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 7, gap: 5,
  },
  aqiBadgeDot: { width: 6, height: 6, borderRadius: 3 },
  aqiBadgeText: { fontSize: 11, fontWeight: '800', color: C.white },
  heroSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.82)', lineHeight: 16 },
  heroStatRow: { flexDirection: 'row', gap: 6, marginTop: 14, flexWrap: 'wrap' },
  heroStatItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.20)', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10, gap: 4,
  },
  statVal: { fontSize: 10, fontWeight: '800', color: C.white },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 22, marginBottom: 10 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: C.ink },
  link: { fontSize: 12, fontWeight: '700', color: C.greenDark },
  tipsIntro: { fontSize: 12, color: C.mutedDark, marginBottom: 10, marginTop: -4, lineHeight: 17 },

  pollutantGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pollutantCard: {
    width: (SCREEN_WIDTH - CARD_PADDING * 2 - 16) / 3,
    padding: 12, borderRadius: 18,
    elevation: 1, shadowOpacity: 0.04,
  },
  pollutantTop: { marginBottom: 4 },
  pollutantLabel: { fontSize: 9, fontWeight: '800', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.2 },
  pollutantValue: { fontSize: 18, fontWeight: '800', marginTop: 3 },
  pollutantUnit: { fontSize: 9, opacity: 0.65, fontWeight: '600', marginTop: 1 },

  weatherCardRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  smallWeatherCard: {
    flex: 1, padding: 14, borderRadius: 22,
    elevation: 2, shadowOpacity: 0.06, shadowColor: '#000', shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  weatherTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  weatherIconCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  weatherCardLabel: { fontSize: 10, color: C.mutedDark, fontWeight: '700' },
  weatherCardVal: { fontSize: 20, fontWeight: '800', marginTop: 2 },
  weatherCardSub: { fontSize: 10, color: C.muted, marginTop: 2, fontWeight: '600' },

  whiteCard: {
    backgroundColor: C.white, borderRadius: 22, padding: 18,
    elevation: 2, shadowColor: C.shadow, shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  next3Badge: { backgroundColor: C.greenSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  next3Text: { fontSize: 9, fontWeight: '800', color: C.greenDark, letterSpacing: 0.6 },
  outlookDesc: { fontSize: 12, color: C.mutedDark, lineHeight: 18, marginBottom: 16 },
  barsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 80 },
  barCol: { alignItems: 'center', gap: 4 },
  barValue: { fontSize: 11, fontWeight: '800' },
  barTrack: { width: 22, height: 45, borderRadius: 6, backgroundColor: '#EFF6F2', justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 9, color: C.mutedDark, fontWeight: '700' },

  mapIconBg: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  viewMapBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: C.greenSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  viewMapText: { fontSize: 12, fontWeight: '700', color: C.greenDark },

  bannerCard: {
    borderRadius: 22, overflow: 'hidden', flexDirection: 'row', alignItems: 'center',
    padding: 18, marginTop: 14,
    elevation: 5, shadowColor: C.heroBg, shadowOpacity: 0.32, shadowRadius: 12, shadowOffset: { width: 0, height: 5 },
  },
  bannerLeafBg: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  bannerTitle: { fontSize: 15, fontWeight: '800', color: C.white },
  bannerSub: { fontSize: 11, color: 'rgba(255,255,255,0.82)', marginTop: 3, fontWeight: '600' },

  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#EFF6F2' },
  statusDot: { width: 9, height: 9, borderRadius: 4.5, marginRight: 10 },
  stationName: { flex: 1, fontSize: 13, fontWeight: '600', color: C.ink },
  stationStatus: { fontSize: 13, fontWeight: '800' },

  tipCard: { flexDirection: 'row', padding: 18, borderRadius: 20, gap: 14, alignItems: 'flex-start', marginBottom: 2 },
  tipIconContainer: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  tipTitle: { fontSize: 15, fontWeight: '800', color: C.ink, marginBottom: 4 },
  tipBulletDot: { fontSize: 13, fontWeight: '800', lineHeight: 20 },
  tipDesc: { fontSize: 13, color: C.inkSoft, lineHeight: 19, fontWeight: '500', flex: 1 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12, marginBottom: 4, gap: 6 },
  dot: { borderRadius: 4, height: 7 },
  dotActive: { width: 22, backgroundColor: C.green },
  dotInactive: { width: 7, backgroundColor: '#C0D8CE' },

  pulseContainer: { position: 'absolute', top: 9, right: 9, width: 10, height: 10 },
  pulseRing: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: C.red, opacity: 0.3 },
  pulseCore: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.red, borderWidth: 1.5, borderColor: '#FFF' },
});
