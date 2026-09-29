import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, FlatList, Pressable, StyleSheet,
  ActivityIndicator, Animated, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getAlerts, Alert } from '../lib/api';
import { supabase } from '../lib/supabase';
import { spacing, typography as typeScale, radius } from '../theme/tokens';

const ICONS: Record<string, { name: any; color: string }> = {
  high:     { name: 'alert-triangle', color: '#EF4444' },
  moderate: { name: 'alert-circle',   color: '#F59E0B' },
  good:     { name: 'check-circle',   color: '#10B981' },
  info:     { name: 'info',           color: '#6366F1' },
  report:   { name: 'file-text',      color: '#0EA5E9' },
};

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pending:     { label: 'Received',     color: '#64748B', icon: 'inbox'        },
  reviewing:   { label: 'Under Review', color: '#F59E0B', icon: 'eye'          },
  assigned:    { label: 'Assigned',     color: '#6366F1', icon: 'user-check'   },
  in_progress: { label: 'In Progress',  color: '#0EA5E9', icon: 'tool'         },
  investigating:{ label: 'In Progress', color: '#0EA5E9', icon: 'tool'         },
  resolved:    { label: 'Resolved ✓',   color: '#10B981', icon: 'check-circle' },
};

interface ReportUpdate {
  id: string;
  report_id: string;
  new_status: string;
  assigned_to: string | null;
  admin_notes: string | null;
  updated_by: string | null;
  created_at: string;
}

function getStatusMeta(status: string) {
  const key = (status || '').toLowerCase().replace(/ /g, '_');
  if (key === 'resolved' || key === 'verified') return STATUS_META['resolved'];
  return STATUS_META[key] || STATUS_META['pending'];
}

function ReportUpdateCard({ item, colors }: { item: ReportUpdate; colors: any }) {
  const meta = getStatusMeta(item.new_status);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const shortId = item.report_id.slice(0, 8).toUpperCase();

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <GlassCard style={[styles.updateCard, { borderLeftColor: meta.color, borderLeftWidth: 3 }]} intensity={25}>
        <View style={[styles.updateIconWrap, { backgroundColor: meta.color + '18' }]}>
          <Feather name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.updateHeader}>
            <Text style={[typeScale.label, { color: colors.ink, fontWeight: '700', flex: 1 }]}>
              Report #{shortId}
            </Text>
            <View style={[styles.statusPill, { backgroundColor: meta.color + '18' }]}>
              <Text style={[typeScale.small, { color: meta.color, fontWeight: '700', fontSize: 10 }]}>
                {meta.label}
              </Text>
            </View>
          </View>
          {item.assigned_to && (
            <Text style={[typeScale.small, { color: '#6366F1', marginTop: 2 }]}>
              🏛️ Assigned to {item.assigned_to}
            </Text>
          )}
          {item.admin_notes && (
            <Text style={[typeScale.small, { color: colors.muted, marginTop: 2, fontStyle: 'italic' }]} numberOfLines={2}>
              "{item.admin_notes}"
            </Text>
          )}
          <Text style={[typeScale.small, { color: colors.muted, marginTop: 4 }]}>
            {item.updated_by ? `By ${item.updated_by} · ` : ''}
            {new Date(item.created_at).toLocaleString('en-IN', {
              day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
            })}
          </Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
}

export function AlertsScreen() {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [reportUpdates, setReportUpdates] = useState<ReportUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [newUpdateCount, setNewUpdateCount] = useState(0);

  const TABS = [
    { key: 'all',         label: t.all },
    { key: 'air_quality', label: t.airQuality },
    { key: 'health',      label: t.health },
    { key: 'reports',     label: `${t.reports}${newUpdateCount > 0 ? ` (${newUpdateCount})` : ''}` },
  ];

  const fetchData = useCallback(async (isPull = false) => {
    if (isPull) setRefreshing(true);
    else setLoading(true);

    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const [alertsRes, updatesRes] = await Promise.all([
        getAlerts().catch(() => []),
        supabase
          .from('report_status_updates')
          .select('*')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(50)
          .then(({ data }) => data || []),
      ]);

      const safeAlerts = (alertsRes as any)?.alerts || (Array.isArray(alertsRes) ? alertsRes : []);
      setAlerts(safeAlerts);
      if (updatesRes) setReportUpdates(updatesRes as ReportUpdate[]);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Real-time subscription – broadcasts status changes to ALL users
  useEffect(() => {
    const channel = supabase
      .channel('all-report-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'report_status_updates' },
        (payload) => {
          setReportUpdates(prev => [payload.new as ReportUpdate, ...prev]);
          if (activeTab !== 'reports') {
            setNewUpdateCount(n => n + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeTab]);

  // Clear badge when user opens Reports tab
  useEffect(() => {
    if (activeTab === 'reports') setNewUpdateCount(0);
  }, [activeTab]);

  const safeAlerts = alerts || [];
  const filteredAlerts = activeTab === 'all'
    ? safeAlerts
    : safeAlerts.filter((a) => a.category === activeTab);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={[typeScale.title, { color: colors.ink }]}>
          {t.alerts}
        </Text>
        <TouchableOpacity
          onPress={() => fetchData()}
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

      {/* Tabs */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)}>
              <View style={[styles.tab, active && { backgroundColor: colors.signal }]}>
                <Text style={[typeScale.small, { color: active ? '#FFF' : colors.muted }]}>
                  {tab.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Reports Updates Tab */}
      {activeTab === 'reports' ? (
        reportUpdates.length === 0 ? (
          <GlassCard style={styles.emptyCard} intensity={25}>
            <Feather name="file-text" size={28} color={colors.muted} style={{ marginBottom: 8 }} />
            <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center' }]}>
              No report updates yet.{'\n'}Government actions will appear here in real-time.
            </Text>
          </GlassCard>
        ) : (
          <FlatList
            data={reportUpdates}
            keyExtractor={(u) => u.id}
            contentContainerStyle={{ gap: spacing.sm }}
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            renderItem={({ item }) => <ReportUpdateCard item={item} colors={colors} />}
          />
        )
      ) : loading && !refreshing ? (
        <ActivityIndicator color={colors.signal} style={{ marginTop: 40 }} />
      ) : filteredAlerts.length === 0 ? (
        <GlassCard style={styles.emptyCard} intensity={25}>
          <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center' }]}>
            {t.noAlerts}
          </Text>
        </GlassCard>
      ) : (
        <FlatList
          data={filteredAlerts}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ gap: spacing.sm }}
          refreshing={refreshing}
          onRefresh={() => fetchData(true)}
          renderItem={({ item }) => {
            const icon = ICONS[item.severity] || ICONS.info;
            return (
              <GlassCard style={styles.alertCard} intensity={30}>
                <Feather name={icon.name} size={20} color={icon.color} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typeScale.label, { color: colors.ink }]}>{item.title}</Text>
                  <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>
                    {item.message}
                  </Text>
                </View>
              </GlassCard>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: spacing.md },
  refreshBtn:  { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  tabRow:      { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  tab:         { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.05)' },
  emptyCard:   { padding: spacing.xl, alignItems: 'center' },
  alertCard:   { flexDirection: 'row', alignItems: 'flex-start' },
  updateCard:  { flexDirection: 'row', alignItems: 'flex-start', overflow: 'hidden' },
  updateIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  updateHeader:   { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  statusPill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 8 },
});