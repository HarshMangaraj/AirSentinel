import { useState, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getReport } from '../lib/api';
import { type as typeScale, spacing, radius } from '../theme/tokens';

const STAGES = ['pending', 'reviewed', 'verified', 'dismissed'];
const STAGE_LABELS: Record<string, string> = {
  pending: 'Received',
  reviewed: 'Under Review',
  verified: 'Verified',
  dismissed: 'Dismissed',
};

export function ReportStatusScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors } = useTheme();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReport(id).then(setReport).finally(() => setLoading(false));
  }, [id]);

  const currentIndex = report ? STAGES.indexOf(report.status) : -1;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[typeScale.title, { color: colors.ink }]}>My Report</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.signal} style={{ marginTop: 60 }} />
      ) : !report ? (
        <Text style={[typeScale.body, { color: colors.muted, padding: spacing.md }]}>Report not found.</Text>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          {report.media_url && <Image source={{ uri: report.media_url }} style={styles.image} />}

          <View style={styles.timeline}>
            {STAGES.filter((s) => s !== 'dismissed' || report.status === 'dismissed').map((stage, i) => {
              const reached = i <= currentIndex;
              return (
                <View key={stage} style={styles.timelineRow}>
                  <View style={styles.timelineDotCol}>
                    <View style={[styles.dot, { backgroundColor: reached ? colors.signal : colors.glass, borderColor: reached ? colors.signal : colors.glassBorder }]}>
                      {reached && <Feather name="check" size={12} color="#FFF" />}
                    </View>
                    {i < STAGES.length - 1 && <View style={[styles.line, { backgroundColor: reached ? colors.signal : colors.glassBorder }]} />}
                  </View>
                  <View style={{ flex: 1, paddingBottom: spacing.lg }}>
                    <Text style={[typeScale.label, { color: reached ? colors.ink : colors.muted }]}>
                      {STAGE_LABELS[stage]}
                    </Text>
                    {stage === report.status && report.status_updated_at && (
                      <Text style={[typeScale.small, { color: colors.muted }]}>
                        {new Date(report.status_updated_at).toLocaleString()}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {report.status === 'verified' && (
            <View style={[styles.resolutionBox, { backgroundColor: colors.aqi.good + '15' }]}>
              <Text style={[typeScale.label, { color: colors.aqi.good }]}>Resolution</Text>
              <Text style={[typeScale.small, { color: colors.ink, marginTop: 4 }]}>
                Report verified by our system. Thank you for contributing to air quality monitoring.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
  image: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: spacing.lg },
  timeline: { marginTop: spacing.sm },
  timelineRow: { flexDirection: 'row' },
  timelineDotCol: { alignItems: 'center', marginRight: spacing.md },
  dot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  line: { width: 2, flex: 1, marginTop: 2 },
  resolutionBox: { padding: spacing.md, borderRadius: radius.md, marginTop: spacing.sm },
});