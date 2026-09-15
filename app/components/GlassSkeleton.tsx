import { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { GlassCard } from './GlassCard';
import { useTheme } from '../context/ThemeContext';
import { radius, spacing } from '../theme/tokens';

export function GlassSkeleton() {
  const { colors, isDark } = useTheme();
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacityAnim]);

  const blockBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <View style={styles.container}>
      {/* Hero Skeleton Card */}
      <GlassCard style={styles.heroSkeleton} intensity={40}>
        <View style={styles.heroHeader}>
          <Animated.View style={[styles.titleLine, { backgroundColor: blockBg, opacity: opacityAnim }]} />
          <Animated.View style={[styles.badgeLine, { backgroundColor: blockBg, opacity: opacityAnim }]} />
        </View>
        <Animated.View style={[styles.heroNum, { backgroundColor: blockBg, opacity: opacityAnim }]} />
        <Animated.View style={[styles.advisoryLine, { backgroundColor: blockBg, opacity: opacityAnim }]} />
      </GlassCard>

      {/* 2x2 Source Grid Skeleton */}
      <View style={styles.sourceGrid}>
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} style={styles.sourceSkeleton} intensity={30}>
            <Animated.View style={[styles.sourceLabel, { backgroundColor: blockBg, opacity: opacityAnim }]} />
            <Animated.View style={[styles.sourceValue, { backgroundColor: blockBg, opacity: opacityAnim }]} />
          </GlassCard>
        ))}
      </View>

      {/* Map Skeleton */}
      <GlassCard style={styles.mapSkeleton} intensity={25}>
        <Animated.View style={[styles.mapPlaceholder, { backgroundColor: blockBg, opacity: opacityAnim }]} />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, marginTop: spacing.xs },
  heroSkeleton: { padding: spacing.lg, gap: spacing.md },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleLine: { width: 110, height: 14, borderRadius: radius.sm },
  badgeLine: { width: 80, height: 22, borderRadius: radius.md },
  heroNum: { width: 130, height: 56, borderRadius: radius.md, marginVertical: 4 },
  advisoryLine: { width: '90%', height: 14, borderRadius: radius.sm },

  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sourceSkeleton: { width: '48.5%', padding: spacing.md, gap: spacing.sm, height: 80 },
  sourceLabel: { width: 55, height: 11, borderRadius: radius.sm },
  sourceValue: { width: 45, height: 26, borderRadius: radius.sm },

  mapSkeleton: { height: 260, padding: 0 },
  mapPlaceholder: { width: '100%', height: '100%', borderRadius: radius.lg },
});
