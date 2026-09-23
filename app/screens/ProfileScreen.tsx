import { useState, useEffect } from 'react';
import { View, Text, Pressable, TextInput, Switch, Linking, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getMyReports, getSavedLocations, addSavedLocation, deleteSavedLocation, NearbyReport, SavedLocation } from '../lib/api';
import { getAlertPreferences, setAlertPreferences, AlertPreferences } from '../lib/preferences';
import { getDeviceLocation } from '../lib/location';
import { type as typeScale, spacing, radius } from '../theme/tokens';

type ViewState = 'menu' | 'reports' | 'saved' | 'alerts' | 'help';

const FAQS = [
  { q: 'Where does the AQI data come from?', a: 'We average live readings from WAQI, Open-Meteo, OpenAQ, OpenWeather, and government CPCB stations where available, so no single source can mislead you.' },
  { q: 'How does the AI hotspot detection work?', a: 'We compare every monitored city\'s current AQI against the statistical average across all cities right now, flagging genuine outliers rather than using one fixed number.' },
  { q: 'Will my reports be verified?', a: 'Yes — every citizen report moves through a status timeline (Received → Under Review → Verified) which you can track under My Reports.' },
  { q: 'Is my location shared with anyone?', a: 'Your live location is used only to fetch nearby AQI and is never shared publicly. Report submissions include the coordinates you choose.' },
];

export function ProfileScreen({ navigation }: any) {
  const { session, signOut } = useAuth();
  const { colors } = useTheme();
  const [view, setView] = useState<ViewState>('menu');

  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [locLoading, setLocLoading] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [addingLoc, setAddingLoc] = useState(false);

  const [prefs, setPrefs] = useState<AlertPreferences>({ airQuality: true, health: true, reports: true });

  useEffect(() => {
    getMyReports().then(setReports).finally(() => setReportsLoading(false));
  }, []);

  useEffect(() => {
    if (view === 'saved') {
      setLocLoading(true);
      getSavedLocations().then(setLocations).finally(() => setLocLoading(false));
    }
    if (view === 'alerts') {
      getAlertPreferences().then(setPrefs);
    }
  }, [view]);

  async function handleAddLocation() {
    if (!newLabel.trim()) return;
    setAddingLoc(true);
    const loc = await getDeviceLocation();
    if (loc) {
      await addSavedLocation(newLabel.trim(), loc.lat, loc.lon).catch(() => {});
      const updated = await getSavedLocations().catch(() => []);
      setLocations(updated);
      setNewLabel('');
    }
    setAddingLoc(false);
  }

  async function handleDeleteLocation(id: string) {
    await deleteSavedLocation(id).catch(() => {});
    setLocations((prev) => prev.filter((l) => l.id !== id));
  }

  async function togglePref(key: keyof AlertPreferences) {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    await setAlertPreferences(updated);
  }

  const MENU_ITEMS: { icon: any; label: string; sub: string; onPress: () => void }[] = [
    { icon: 'file-text', label: 'My Reports', sub: 'Track your submitted reports', onPress: () => setView('reports') },
    { icon: 'map-pin', label: 'Saved Locations', sub: 'Manage favourite places', onPress: () => setView('saved') },
    { icon: 'bell', label: 'Alert Preferences', sub: 'Choose what you want to be notified about', onPress: () => setView('alerts') },
    { icon: 'heart', label: 'Health & Safety', sub: 'Tips for cleaner air and better health', onPress: () => navigation.getParent()?.navigate('HealthSafety') },
    { icon: 'help-circle', label: 'Help & Support', sub: 'FAQs and contact', onPress: () => setView('help') },
  ];

  const SubHeader = ({ title }: { title: string }) => (
    <View style={styles.subHeader}>
      <Pressable onPress={() => setView('menu')}>
        <Feather name="arrow-left" size={20} color={colors.ink} />
      </Pressable>
      <Text style={[typeScale.title, { color: colors.ink }]}>{title}</Text>
      <View style={{ width: 20 }} />
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {view === 'reports' && (
          <>
            <SubHeader title="My Reports" />
            {reportsLoading ? (
              <ActivityIndicator color={colors.signal} style={{ marginTop: 40 }} />
            ) : reports.length === 0 ? (
              <GlassCard style={{ padding: spacing.lg }} intensity={25}>
                <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center' }]}>
                  You haven't submitted any reports yet.
                </Text>
              </GlassCard>
            ) : (
              reports.map((r) => (
                <Pressable key={r.id} onPress={() => navigation.getParent()?.navigate('ReportStatus', { id: r.id })}>
                  <GlassCard style={styles.rowCard} intensity={25}>
                    <View style={{ flex: 1 }}>
                      <Text style={[typeScale.label, { color: colors.ink }]}>
                        {r.category || r.description || 'Pollution report'}
                      </Text>
                      <Text style={[typeScale.small, { color: colors.muted }]}>
                        {r.status} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.muted} />
                  </GlassCard>
                </Pressable>
              ))
            )}
          </>
        )}

        {view === 'saved' && (
          <>
            <SubHeader title="Saved Locations" />
            <GlassCard style={styles.addCard} intensity={30}>
              <TextInput
                style={[typeScale.body, { color: colors.ink, flex: 1 }]}
                placeholder="Label (e.g. Home, Office)"
                placeholderTextColor={colors.muted}
                value={newLabel}
                onChangeText={setNewLabel}
              />
              <Pressable onPress={handleAddLocation} disabled={addingLoc}>
                <Text style={{ color: colors.signal, fontFamily: 'Inter_600SemiBold' }}>
                  {addingLoc ? '...' : 'Add current'}
                </Text>
              </Pressable>
            </GlassCard>

            {locLoading ? (
              <ActivityIndicator color={colors.signal} style={{ marginTop: 20 }} />
            ) : locations.length === 0 ? (
              <GlassCard style={{ padding: spacing.lg, marginTop: spacing.sm }} intensity={25}>
                <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center' }]}>
                  No saved locations yet. Type a label and tap "Add current".
                </Text>
              </GlassCard>
            ) : (
              locations.map((l) => (
                <GlassCard key={l.id} style={[styles.rowCard, { marginTop: spacing.sm }]} intensity={25}>
                  <View style={{ flex: 1 }}>
                    <Text style={[typeScale.label, { color: colors.ink }]}>{l.label}</Text>
                    <Text style={[typeScale.small, { color: colors.muted }]}>
                      {l.lat.toFixed(3)}, {l.lon.toFixed(3)}
                    </Text>
                  </View>
                  <Pressable onPress={() => handleDeleteLocation(l.id)}>
                    <Feather name="trash-2" size={16} color={colors.danger} />
                  </Pressable>
                </GlassCard>
              ))
            )}
          </>
        )}

        {view === 'alerts' && (
          <>
            <SubHeader title="Alert Preferences" />
            <Text style={[typeScale.small, { color: colors.muted, marginBottom: spacing.md }]}>
              Choose which alert categories appear in your Alerts tab.
            </Text>
            {[
              { key: 'airQuality' as const, label: 'Air Quality Alerts', sub: 'Hotspots and pollution spikes' },
              { key: 'health' as const, label: 'Health Advisories', sub: 'Guidance based on current conditions' },
              { key: 'reports' as const, label: 'Community Reports', sub: 'New citizen reports nearby' },
            ].map((item) => (
              <GlassCard key={item.key} style={styles.rowCard} intensity={25}>
                <View style={{ flex: 1 }}>
                  <Text style={[typeScale.label, { color: colors.ink }]}>{item.label}</Text>
                  <Text style={[typeScale.small, { color: colors.muted }]}>{item.sub}</Text>
                </View>
                <Switch
                  value={prefs[item.key]}
                  onValueChange={() => togglePref(item.key)}
                  trackColor={{ false: colors.glassBorder, true: colors.signal }}
                />
              </GlassCard>
            ))}
          </>
        )}

        {view === 'help' && (
          <>
            <SubHeader title="Help & Support" />
            {FAQS.map((f, i) => (
              <GlassCard key={i} style={{ marginBottom: spacing.sm, padding: spacing.md }} intensity={25}>
                <Text style={[typeScale.label, { color: colors.ink }]}>{f.q}</Text>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: 4 }]}>{f.a}</Text>
              </GlassCard>
            ))}
            <Button
              label="Contact Support"
              onPress={() => Linking.openURL('mailto:support@airsentinel.app?subject=AirSentinel Support')}
            />
          </>
        )}

        {view === 'menu' && (
          <>
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
                  {reportsLoading ? '...' : `${reports.length} report${reports.length === 1 ? '' : 's'} submitted`}
                </Text>
              </View>
            </GlassCard>

            {MENU_ITEMS.map((item) => (
              <Pressable key={item.label} onPress={item.onPress}>
                <View style={styles.menuRow}>
                  <Feather name={item.icon} size={18} color={colors.muted} style={{ marginRight: 12 }} />
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
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  rowCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  addCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  profileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  impactCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  signOutBtn: { borderWidth: 1, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center' },
});