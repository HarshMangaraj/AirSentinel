import { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMyReports, NearbyReport } from '../lib/api';
import { type as typeScale, spacing, radius } from '../theme/tokens';

const MENU_ITEMS = [
  { icon: 'file-text', label: 'My Reports', sub: 'Track your submitted reports' },
  { icon: 'map-pin', label: 'Saved Locations', sub: 'Manage favourite places' },
  { icon: 'bell', label: 'Alert Preferences', sub: 'Choose what you want to be notified about' },
  { icon: 'heart', label: 'Health & Safety', sub: 'Tips for cleaner air and better health' },
  { icon: 'help-circle', label: 'Help & Support', sub: 'FAQs and contact' },
];

export function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { colors } = useTheme();
  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyReports()
      .then(setReports)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <View style={{ padding: spacing.md }}>
        <View style={styles.profileRow}>
          <View style={[styles.avatar, { backgroundColor: colors.signal }]}>
            <Feather name="user" size={24} color="#FFF" />
          </View>
          <View>
            <Text style={[typeScale.label, { color: colors.ink }]}>
              {session?.user.email?.split('@')[0]}
            </Text>
            <Text style={[typeScale.small, { color: colors.muted }]}>{session?.user.email}</Text>
          </View>
        </View>

        <GlassCard style={styles.impactCard} intensity={30}>
          <Feather name="award" size={18} color={colors.signal} style={{ marginRight: 10 }} />
          <View>
            <Text style={[typeScale.label, { color: colors.ink }]}>Community Impact</Text>
            <Text style={[typeScale.small, { color: colors.muted }]}>
              {loading ? '...' : `${reports.length} report${reports.length === 1 ? '' : 's'} submitted`}
            </Text>
          </View>
        </GlassCard>

        {MENU_ITEMS.map((item) => (
          <Pressable key={item.label}>
            <View style={styles.menuRow}>
              <Feather name={item.icon as any} size={18} color={colors.muted} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[typeScale.label, { color: colors.ink }]}>{item.label}</Text>
                <Text style={[typeScale.small, { color: colors.muted }]}>{item.sub}</Text>
              </View>
              <Feather name="chevron-right" size={16} color={colors.muted} />
            </View>
          </Pressable>
        ))}

        <Pressable onPress={signOut} style={{ marginTop: spacing.lg }}>
          <View style={[styles.signOutBtn, { borderColor: colors.danger }]}>
            <Text style={[typeScale.label, { color: colors.danger }]}>Log Out</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  impactCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  signOutBtn: { borderWidth: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
});