import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, Image, Pressable, StyleSheet, ActivityIndicator,
  ScrollView, Animated, TouchableOpacity, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getReport } from '../lib/api';
import { supabase } from '../lib/supabase';
import { typography as typeScale, spacing, radius } from '../theme/tokens';

// Full status pipeline – matches backend + gov dashboard statuses
const STAGES: { key: string; label: string; icon: any; color: string }[] = [
  { key: 'pending',     label: 'Received',       icon: 'inbox',        color: '#64748B' },
  { key: 'reviewing',   label: 'Under Review',    icon: 'eye',          color: '#F59E0B' },
  { key: 'assigned',    label: 'Assigned',        icon: 'user-check',   color: '#6366F1' },
  { key: 'in_progress', label: 'Action Taken',    icon: 'tool',         color: '#0EA5E9' },
  { key: 'resolved',    label: 'Resolved ✓',      icon: 'check-circle', color: '#10B981' },
];

// Map various backend/gov-dashboard status strings to a stage key
function normalizeStatus(s: string): string {
  const v = (s || '').toLowerCase().replace(/ /g, '_');
  if (v === 'pending') return 'pending';
  if (v === 'reviewing' || v === 'reviewed' || v === 'under_review') return 'reviewing';
  if (v === 'assigned') return 'assigned';
  if (v === 'in_progress' || v === 'investigating' || v === 'in progress') return 'in_progress';
  // 'verified' is what the backend stores for resolved (PostgreSQL enum constraint)
  if (v === 'resolved' || v === 'verified') return 'resolved';
  return 'pending';
}

interface StatusUpdate {
  id: string;
  new_status: string;
  assigned_to: string | null;
  admin_notes: string | null;
  updated_by: string | null;
  created_at: string;
}

export function ReportStatusScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { colors, isDark } = useTheme();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Derived status from either live Supabase updates or the backend report
  const latestStatus = statusUpdates.length > 0
    ? normalizeStatus(statusUpdates[statusUpdates.length - 1].new_status)
    : normalizeStatus(report?.status || 'pending');

  const currentStageIndex = STAGES.findIndex(s => s.key === latestStatus);

  // Pulse animation for the active dot
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [latestStatus]);

  const [refreshing, setRefreshing] = useState(false);

  const refreshData = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    else setLoading(true);

    try {
      const [repData, histData] = await Promise.all([
        getReport(id).catch(() => null),
        supabase
          .from('report_status_updates')
          .select('*')
          .eq('report_id', id)
          .order('created_at', { ascending: true })
          .then(({ data }) => data || []),
      ]);

      if (repData) setReport(repData);
      if (histData && histData.length > 0) setStatusUpdates(histData as StatusUpdate[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  // Fetch initial report data
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Subscribe to real-time new updates for this report
  useEffect(() => {
    const channel = supabase
      .channel(`report-status-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'report_status_updates',
          filter: `report_id=eq.${id}`,
        },
        (payload) => {
          setStatusUpdates(prev => [...prev, payload.new as StatusUpdate]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  const latestUpdate = statusUpdates[statusUpdates.length - 1];
  const isResolved = latestStatus === 'resolved';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.ink} />
        </Pressable>
        <Text style={[typeScale.title, { color: colors.ink, fontSize: 18 }]}>Report Status</Text>
        <TouchableOpacity
          onPress={() => refreshData()}
          style={styles.refreshBtn}
          disabled={loading || refreshing}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={colors.signal} />
          ) : (
            <Feather name="refresh-cw" size={18} color={colors.ink} />
          )}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator color={colors.signal} style={{ marginTop: 60 }} />
      ) : !report && statusUpdates.length === 0 ? (
        <Text style={[typeScale.body, { color: colors.muted, padding: spacing.md }]}>
          Report not found.
        </Text>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 60 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => refreshData(true)}
              tintColor={colors.signal}
              colors={[colors.signal]}
            />
          }
        >

          {/* Status Banner */}
          <View style={[
            styles.banner,
            {
              backgroundColor: isResolved
                ? 'rgba(16,185,129,0.12)'
                : 'rgba(99,102,241,0.10)',
              borderColor: isResolved ? '#10B981' : '#6366F1',
            }
          ]}>
            <Feather
              name={isResolved ? 'check-circle' : 'activity'}
              size={20}
              color={isResolved ? '#10B981' : '#6366F1'}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typeScale.label, {
                color: isResolved ? '#10B981' : colors.ink,
                fontWeight: '700',
              }]}>
                {isResolved ? 'Issue Resolved!' : 'Tracking Your Report'}
              </Text>
              {latestUpdate && (
                <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>
                  Last updated · {new Date(latestUpdate.created_at).toLocaleString('en-IN', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </Text>
              )}
            </View>
          </View>

          {/* Photo */}
          {report?.media_url && (
            <Image source={{ uri: report.media_url }} style={styles.image} />
          )}

          {/* Timeline */}
          <View style={[styles.timelineCard, { backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#FFF', borderColor: colors.glassBorder }]}>
            <Text style={[typeScale.label, { color: colors.ink, marginBottom: 16, fontWeight: '700' }]}>
              📋 Progress Timeline
            </Text>
            {STAGES.map((stage, i) => {
              const reached = i <= currentStageIndex;
              const isActive = i === currentStageIndex;
              const isLast = i === STAGES.length - 1;

              // Find matching update for this stage
              const matchUpdate = statusUpdates.find(u =>
                normalizeStatus(u.new_status) === stage.key
              );

              return (
                <View key={stage.key} style={styles.timelineRow}>
                  {/* Dot + Line column */}
                  <View style={styles.dotCol}>
                    {isActive ? (
                      <Animated.View style={[
                        styles.dotOuter,
                        { borderColor: stage.color, transform: [{ scale: pulseAnim }] }
                      ]}>
                        <View style={[styles.dotInner, { backgroundColor: stage.color }]} />
                      </Animated.View>
                    ) : (
                      <View style={[
                        styles.dotSimple,
                        {
                          backgroundColor: reached ? stage.color : 'transparent',
                          borderColor: reached ? stage.color : colors.glassBorder,
                        }
                      ]}>
                        {reached && <Feather name="check" size={10} color="#FFF" />}
                      </View>
                    )}
                    {!isLast && (
                      <View style={[
                        styles.line,
                        { backgroundColor: reached && !isActive ? stage.color : colors.glassBorder }
                      ]} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1, paddingBottom: 24, paddingLeft: 4 }}>
                    <Text style={[
                      typeScale.label,
                      { color: reached ? colors.ink : colors.muted, fontWeight: isActive ? '700' : '500' }
                    ]}>
                      {stage.label}
                    </Text>

                    {matchUpdate && (
                      <View style={{ marginTop: 4 }}>
                        {matchUpdate.updated_by && (
                          <Text style={[typeScale.small, { color: colors.muted }]}>
                            By {matchUpdate.updated_by}
                          </Text>
                        )}
                        {matchUpdate.assigned_to && (
                          <Text style={[typeScale.small, { color: '#6366F1', marginTop: 2 }]}>
                            🏛️ {matchUpdate.assigned_to}
                          </Text>
                        )}
                        {matchUpdate.admin_notes && (
                          <Text style={[typeScale.small, { color: colors.muted, fontStyle: 'italic', marginTop: 2 }]}>
                            "{matchUpdate.admin_notes}"
                          </Text>
                        )}
                        <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>
                          {new Date(matchUpdate.created_at).toLocaleString('en-IN', {
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </Text>
                      </View>
                    )}

                    {/* Initial submission */}
                    {stage.key === 'pending' && !matchUpdate && report?.created_at && (
                      <Text style={[typeScale.small, { color: colors.muted, marginTop: 4 }]}>
                        {new Date(report.created_at).toLocaleString('en-IN', {
                          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Resolution box */}
          {isResolved && (
            <View style={[styles.resolutionBox, { backgroundColor: 'rgba(16,185,129,0.08)', borderColor: '#10B981' }]}>
              <Text style={[typeScale.label, { color: '#10B981', fontWeight: '700' }]}>
                ✅ Issue Resolved
              </Text>
              <Text style={[typeScale.small, { color: colors.ink, marginTop: 4, lineHeight: 20 }]}>
                {latestUpdate?.admin_notes
                  || 'The reported pollution issue has been addressed by the concerned department. Thank you for contributing to cleaner air.'}
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
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: spacing.md,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  refreshBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  banner: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.lg, borderWidth: 1.5,
    padding: 14, marginBottom: spacing.md,
  },
  image: { width: '100%', height: 160, borderRadius: radius.lg, marginBottom: spacing.md },
  timelineCard: {
    borderRadius: radius.lg, borderWidth: 1,
    padding: 16, marginBottom: spacing.md,
  },
  timelineRow: { flexDirection: 'row' },
  dotCol: { alignItems: 'center', width: 30, marginRight: 8 },
  dotOuter: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  dotInner: { width: 12, height: 12, borderRadius: 6 },
  dotSimple: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  line: { width: 2, flex: 1, marginTop: 3, marginBottom: 3 },
  resolutionBox: {
    padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5,
  },
});