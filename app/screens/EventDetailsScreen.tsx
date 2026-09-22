import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { getReport } from '../lib/api';
import { type as typeScale, spacing, radius } from '../theme/tokens';

export function EventDetailsScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(id).then(setReport).finally(() => setLoading(false));
  }, [id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[typeScale.title, { color: colors.ink }]}>Event Details</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.signal} style={{ marginTop: 60 }} />
      ) : !report ? (
        <Text style={[typeScale.body, { color: colors.muted, padding: spacing.md }]}>Report not found.</Text>
      ) : (
        <View style={{ padding: spacing.md }}>
          {report.media_url ? (
            <Image source={{ uri: report.media_url }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.noImage, { backgroundColor: colors.glass }]}>
              <Feather name="image" size={32} color={colors.muted} />
            </View>
          )}

          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: colors.signal + '22' }]}>
              <Text style={[typeScale.small, { color: colors.signal, fontFamily: 'Inter_600SemiBold' }]}>
                {report.category || 'Pollution report'}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: report.status === 'verified' ? colors.aqi.good + '22' : colors.muted + '22' }]}>
              <Text style={[typeScale.small, { color: report.status === 'verified' ? colors.aqi.good : colors.muted }]}>
                {report.status}
              </Text>
            </View>
          </View>

          <Text style={[typeScale.body, { color: colors.ink, marginTop: spacing.md }]}>
            {report.description || 'No description provided.'}
          </Text>

          <GlassCard style={styles.metaCard} intensity={25}>
            <View style={styles.metaRow}>
              <Feather name="clock" size={14} color={colors.muted} style={{ marginRight: 8 }} />
              <Text style={[typeScale.small, { color: colors.muted }]}>
                Reported {report.created_at ? new Date(report.created_at).toLocaleString() : 'unknown time'}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={14} color={colors.muted} style={{ marginRight: 8 }} />
              <Text style={[typeScale.small, { color: colors.muted }]}>
                {report.lat.toFixed(4)}, {report.lon.toFixed(4)}
              </Text>
            </View>
          </GlassCard>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  image: { width: '100%', height: 200, borderRadius: radius.lg, marginBottom: spacing.md },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', gap: spacing.sm },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.sm },
  metaCard: { marginTop: spacing.md, gap: spacing.xs },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
});