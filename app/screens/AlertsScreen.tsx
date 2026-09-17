import { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { useTheme } from '../context/ThemeContext';
import { getAlerts, Alert } from '../lib/api';
import { spacing, type as typeScale, radius } from '../theme/tokens';

const TABS = ['All', 'Air Quality', 'Health', 'Reports'];
const CATEGORY_MAP: Record<string, string> = { 'Air Quality': 'air_quality', Health: 'health', Reports: 'reports' };

const ICONS: Record<string, { name: any; color: string }> = {
  high: { name: 'alert-triangle', color: '#B23A3A' },
  moderate: { name: 'alert-circle', color: '#D9722F' },
  good: { name: 'check-circle', color: '#4C9A6A' },
  info: { name: 'info', color: '#2F6E5C' },
};

export function AlertsScreen() {
  const { colors } = useTheme();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    getAlerts()
      .then((data) => setAlerts(data.alerts))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'All' ? alerts : alerts.filter((a) => a.category === CATEGORY_MAP[activeTab]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <Text style={[typeScale.title, { color: colors.ink, marginBottom: spacing.md }]}>Alerts</Text>

      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable key={tab} onPress={() => setActiveTab(tab)}>
              <View style={[styles.tab, active && { backgroundColor: colors.signal }]}>
                <Text style={[typeScale.small, { color: active ? '#FFF' : colors.muted }]}>{tab}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator color={colors.signal} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <GlassCard style={styles.emptyCard} intensity={25}>
          <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center' }]}>No alerts right now.</Text>
        </GlassCard>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => {
            const icon = ICONS[item.severity] || ICONS.info;
            return (
              <GlassCard style={styles.alertCard} intensity={30}>
                <Feather name={icon.name} size={20} color={icon.color} style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[typeScale.label, { color: colors.ink }]}>{item.title}</Text>
                  <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>{item.message}</Text>
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
  container: { flex: 1, padding: spacing.md },
  tabRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, backgroundColor: 'rgba(0,0,0,0.05)' },
  emptyCard: { padding: spacing.xl },
  alertCard: { flexDirection: 'row', alignItems: 'flex-start' },
});