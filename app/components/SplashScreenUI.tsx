import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle, Ellipse, Polygon } from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// Leaf logo icon as SVG
function LeafLogo({ size = 80 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      {/* Outer leaf */}
      <Path
        d="M40 10 C20 10 8 28 10 50 C12 70 30 72 42 68 C54 64 70 52 68 32 C66 14 52 8 40 10Z"
        fill="#0B9B6A"
      />
      {/* Inner lighter leaf */}
      <Path
        d="M40 18 C26 18 16 32 18 48 C20 62 32 65 42 61 C52 57 62 47 60 34 C58 20 48 16 40 18Z"
        fill="#0DCCB5"
        opacity={0.5}
      />
      {/* Stem */}
      <Path
        d="M40 68 Q38 58 36 45"
        stroke="#FFF"
        strokeWidth={2.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Vein left */}
      <Path
        d="M36 45 Q28 38 22 30"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      {/* Vein right */}
      <Path
        d="M36 45 Q44 40 52 32"
        stroke="rgba(255,255,255,0.6)"
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

// Cityscape silhouette SVG for the splash background
function CityscapeBackground() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width={W} height={H * 0.45} viewBox={`0 0 ${W} 300`} style={{ position: 'absolute', bottom: 0 }}>
        {/* Sky gradient hills */}
        <Path d={`M0 200 Q${W * 0.25} 100 ${W * 0.5} 180 Q${W * 0.75} 240 ${W} 160 L${W} 300 L0 300Z`}
          fill="rgba(11,155,106,0.15)" />
        <Path d={`M0 220 Q${W * 0.3} 160 ${W * 0.6} 200 Q${W * 0.8} 225 ${W} 190 L${W} 300 L0 300Z`}
          fill="rgba(11,155,106,0.1)" />
        {/* Building silhouettes */}
        <Path d={`M${W * 0.05} 260 L${W * 0.05} 200 L${W * 0.09} 200 L${W * 0.09} 180 L${W * 0.13} 180 L${W * 0.13} 260Z`}
          fill="rgba(13,204,181,0.2)" />
        <Path d={`M${W * 0.15} 260 L${W * 0.15} 170 L${W * 0.2} 170 L${W * 0.2} 155 L${W * 0.25} 155 L${W * 0.25} 260Z`}
          fill="rgba(13,204,181,0.2)" />
        <Path d={`M${W * 0.3} 260 L${W * 0.3} 190 L${W * 0.35} 190 L${W * 0.35} 175 L${W * 0.4} 175 L${W * 0.4} 260Z`}
          fill="rgba(13,204,181,0.2)" />
        <Path d={`M${W * 0.55} 260 L${W * 0.55} 195 L${W * 0.6} 195 L${W * 0.6} 180 L${W * 0.65} 180 L${W * 0.65} 260Z`}
          fill="rgba(13,204,181,0.2)" />
        <Path d={`M${W * 0.7} 260 L${W * 0.7} 185 L${W * 0.76} 185 L${W * 0.76} 160 L${W * 0.82} 160 L${W * 0.82} 260Z`}
          fill="rgba(13,204,181,0.2)" />
        <Path d={`M${W * 0.85} 260 L${W * 0.85} 200 L${W * 0.9} 200 L${W * 0.9} 185 L${W * 0.95} 185 L${W * 0.95} 260Z`}
          fill="rgba(13,204,181,0.2)" />
        {/* Wind turbines */}
        <Circle cx={W * 0.44} cy={245} r={2} fill="rgba(13,204,181,0.4)" />
        <Path d={`M${W * 0.44} 245 L${W * 0.44} 265`} stroke="rgba(13,204,181,0.4)" strokeWidth={1.5} />
        <Path d={`M${W * 0.44} 245 L${W * 0.44 - 8} 238`} stroke="rgba(13,204,181,0.4)" strokeWidth={1.5} strokeLinecap="round" />
        <Path d={`M${W * 0.44} 245 L${W * 0.44 + 8} 238`} stroke="rgba(13,204,181,0.4)" strokeWidth={1.5} strokeLinecap="round" />
        <Path d={`M${W * 0.44} 245 L${W * 0.44} 237`} stroke="rgba(13,204,181,0.4)" strokeWidth={1.5} strokeLinecap="round" />
        {/* Trees */}
        <Ellipse cx={W * 0.48} cy={255} rx={10} ry={14} fill="rgba(11,155,106,0.3)" />
        <Ellipse cx={W * 0.5} cy={258} rx={8} ry={10} fill="rgba(11,155,106,0.25)" />
      </Svg>
    </View>
  );
}

export function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.splashContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF9F6" />
      <LinearGradient colors={['#EEF9F6', '#D6F5EC', '#C0EDDF']} style={StyleSheet.absoluteFill} />
      <CityscapeBackground />

      <Animated.View style={[styles.splashContent, { opacity, transform: [{ translateY }, { scale }] }]}>
        <View style={styles.logoContainer}>
          <LeafLogo size={90} />
        </View>
        <Text style={styles.brandTitle}>AirSentnel</Text>
        <View style={styles.taglineRow}>
          <Text style={styles.taglineDot}>Cleaner Air</Text>
          <Text style={styles.taglineBullet}> • </Text>
          <Text style={styles.taglineDot}>Safer Tomorrow</Text>
        </View>
        <Text style={styles.splashSubtitle}>
          Real-time insights. Smarter decisions.{'\n'}A healthier planet.
        </Text>
      </Animated.View>
    </View>
  );
}

export function LoadingScreen() {
  const rotation = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const dotScale = useRef([
    new Animated.Value(0.8),
    new Animated.Value(0.8),
    new Animated.Value(0.8),
  ]).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();

    // Spinning arc
    Animated.loop(
      Animated.timing(rotation, { toValue: 1, duration: 1200, useNativeDriver: true })
    ).start();

    // Pulsing dots
    const animateDots = () => {
      dotScale.forEach((dot, i) => {
        Animated.sequence([
          Animated.delay(i * 200),
          Animated.loop(
            Animated.sequence([
              Animated.spring(dot, { toValue: 1.4, friction: 4, useNativeDriver: true }),
              Animated.spring(dot, { toValue: 0.8, friction: 4, useNativeDriver: true }),
            ])
          ),
        ]).start();
      });
    };
    animateDots();
  }, []);

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.loadingContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF9F6" />
      <LinearGradient colors={['#EEF9F6', '#D6F5EC', '#C0EDDF']} style={StyleSheet.absoluteFill} />
      <CityscapeBackground />

      <Animated.View style={[styles.loadingContent, { opacity, transform: [{ translateY }] }]}>
        <View style={styles.logoContainer}>
          <LeafLogo size={80} />
        </View>
        <Text style={styles.brandTitle}>AirSentnel</Text>
        <View style={styles.taglineRow}>
          <Text style={styles.taglineDot}>Cleaner Air</Text>
          <Text style={styles.taglineBullet}> • </Text>
          <Text style={styles.taglineDot}>Safer Tomorrow</Text>
        </View>

        <View style={styles.spinnerWrap}>
          <Animated.View style={[styles.spinnerRing, { transform: [{ rotate: spin }] }]}>
            <View style={styles.spinnerDot} />
          </Animated.View>
        </View>

        <Text style={styles.loadingTitle}>Loading...</Text>
        <Text style={styles.loadingSubtitle}>Fetching latest air quality data{'\n'}and map information.</Text>

        <View style={styles.dotsRow}>
          {dotScale.map((dot, i) => (
            <Animated.View
              key={i}
              style={[styles.dot, { transform: [{ scale: dot }] }]}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#EEF9F6' },
  splashContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  loadingContainer: { flex: 1, backgroundColor: '#EEF9F6' },
  loadingContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  logoContainer: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(11,155,106,0.08)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
  },
  brandTitle: { fontSize: 36, fontWeight: '800', color: '#0F2B24', letterSpacing: -0.5, marginBottom: 6 },
  taglineRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  taglineDot: { fontSize: 15, color: '#3D7A65', fontWeight: '500' },
  taglineBullet: { fontSize: 15, color: '#0B9B6A', fontWeight: '700' },
  splashSubtitle: { fontSize: 16, color: '#4A7A6A', textAlign: 'center', lineHeight: 26, fontWeight: '400' },
  spinnerWrap: { marginTop: 40, marginBottom: 24, width: 64, height: 64, justifyContent: 'center', alignItems: 'center' },
  spinnerRing: {
    width: 56, height: 56, borderRadius: 28,
    borderWidth: 4, borderColor: 'transparent',
    borderTopColor: '#0B9B6A', borderRightColor: '#0DCCB5',
    justifyContent: 'flex-start', alignItems: 'flex-end',
  },
  spinnerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B9B6A', marginTop: -2, marginRight: -2 },
  loadingTitle: { fontSize: 22, fontWeight: '700', color: '#0B9B6A', marginBottom: 8 },
  loadingSubtitle: { fontSize: 14, color: '#5A8A7A', textAlign: 'center', lineHeight: 22 },
  dotsRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#0B9B6A' },
});
