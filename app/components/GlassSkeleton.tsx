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
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 800,
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
      <GlassCard style={styles.heroSkeleton} intensity={50}>
        <Animated.View style={[styles.titleLine, { backgroundColor: blockBg, opacity: opacityAnim }]} />
        <Animated.View style={[styles.heroNum, { backgroundColor: blockBg, opacity: opacityAnim }]} />
        <View style={styles.heroFooter}>
          <Animated.View style={[styles.dot, { backgroundColor: colors.signal, opacity: opacityAnim }]} />
          <Animated.View style={[styles.badgeLine, { backgroundColor: blockBg, opacity: opacityAnim }]} />
        </View>
      </GlassCard>

      {/* 2x2 Source Grid Skeleton */}
      <View style={styles.sourceGrid}>
        {[1, 2, 3, 4].map((i) => (
          <GlassCard key={i} style={styles.sourceSkeleton} intensity={35}>
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
  container: { gap: spacing.md, marginTop: spacing.sm },
  heroSkeleton: { paddingVertical: spacing.xl, gap: spacing.md, alignItems: 'flex-start' },
  titleLine: { width: 120, height: 16, borderRadius: radius.sm },
  heroNum: { width: 140, height: 60, borderRadius: radius.md },
  heroFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 12, height: 12, borderRadius: 6 },
  badgeLine: { width: 90, height: 16, borderRadius: radius.sm },

  sourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  sourceSkeleton: { width: '47.5%', padding: spacing.md, gap: spacing.sm, height: 85 },
  sourceLabel: { width: 60, height: 12, borderRadius: radius.sm },
  sourceValue: { width: 50, height: 28, borderRadius: radius.sm },

  mapSkeleton: { height: 260, padding: 0, justifyContent: 'center', alignItems: 'center' },
  mapPlaceholder: { width: '100%', height: '100%', borderRadius: radius.lg },
});
