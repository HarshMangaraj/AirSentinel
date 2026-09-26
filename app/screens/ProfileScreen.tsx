import { useState, useEffect, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator,
  ScrollView, Switch, Animated, TouchableOpacity, Alert, Image, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { GlassCard } from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useProfilePhoto } from "../context/ProfilePhotoContext";
import { getMyReports, NearbyReport } from "../lib/api";
import { type as typeScale, spacing, radius } from "../theme/tokens";

type Screen = "profile" | "reports" | "settings" | "accountInfo" | "badges";
const TEAL = "#10B981";

function AnimatedPress({ onPress, style, children }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 3 }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 3 }).start()}
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

function LanguagePicker({ visible, onClose, current, onSelect, isDark, colors }: any) {
  const langs = [
    { code: "en" as const, native: "English", label: "English" },
    { code: "hi" as const, native: "हिन्दी", label: "Hindi" },
  ];
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={lp.overlay} onPress={onClose}>
        <View style={[lp.sheet, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
          <View style={[lp.handle, { backgroundColor: colors.glassBorder }]} />
          <Text style={[typeScale.label, { color: colors.ink, marginBottom: 20, textAlign: "center", fontSize: 17 }]}>
            Select Language / भाषा चुनें
          </Text>
          {langs.map((l) => {
            const sel = current === l.code;
            return (
              <TouchableOpacity
                key={l.code}
                onPress={() => { onSelect(l.code); onClose(); }}
                style={[lp.option, { borderColor: sel ? TEAL : colors.glassBorder, backgroundColor: sel ? TEAL + "15" : "transparent" }]}
              >
                <View>
                  <Text style={[typeScale.label, { color: colors.ink }]}>{l.native}</Text>
                  <Text style={[typeScale.small, { color: colors.muted }]}>{l.label}</Text>
                </View>
                {sel && <Feather name="check" size={20} color={TEAL} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const lp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  option: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1.5, borderRadius: 14, padding: 16, marginBottom: 12 },
});

export function ProfileScreen({ navigation }: any) {
  const { session, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const { photoUri, setPhotoUri } = useProfilePhoto();
  const [reports, setReports] = useState<NearbyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState<Screen>("profile");
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [locationOn, setLocationOn] = useState(true);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  const reportsShared = reports.length;
  const locationsMonitored = reportsShared > 0 ? Math.min(reportsShared + 3, 12) : 8;
  const communityActions = Math.floor(reportsShared / 4) + 3;
  const langLabel = language === "hi" ? "हिन्दी" : "English";

  const displayName = session?.user.email?.split("@")[0]
    ? session.user.email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
    : "AirSentinel User";

  useEffect(() => {
    getMyReports().then(setReports).finally(() => setLoading(false));
  }, []);

  async function pickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Please allow photo library access."); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets[0]?.uri) setPhotoUri(r.assets[0].uri);
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") { Alert.alert("Permission needed", "Please allow camera access."); return; }
    const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!r.canceled && r.assets[0]?.uri) setPhotoUri(r.assets[0].uri);
  }

  function showPhotoOptions() {
    const opts: any[] = [
      { text: t.cancel, style: "cancel" },
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Library", onPress: pickPhoto },
    ];
    if (photoUri) opts.push({ text: t.removePhoto, style: "destructive", onPress: () => setPhotoUri(null) });
    Alert.alert(t.changePhoto, undefined, opts);
  }

  const handleLogOut = () => {
    Alert.alert(t.logOutConfirm, t.logOutMessage, [
      { text: t.cancel, style: "cancel" },
      { text: t.logOut, style: "destructive", onPress: signOut },
    ]);
  };

  // Sub-components defined inside main component so they capture context vars
  function Header({ title, onBack }: { title: string; onBack?: () => void }) {
    return (
      <View style={[s.header, { borderBottomColor: colors.glassBorder }]}>
        {onBack
          ? <TouchableOpacity onPress={onBack} style={s.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Feather name="arrow-left" size={22} color={colors.ink} /></TouchableOpacity>
          : <View style={s.headerBtn} />}
        <Text style={[typeScale.title, { color: colors.ink, fontSize: 20 }]}>{title}</Text>
        {title === t.profile
          ? <TouchableOpacity onPress={() => setScreen("settings")} style={s.headerBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}><Feather name="settings" size={22} color={colors.ink} /></TouchableOpacity>
          : <View style={s.headerBtn} />}
      </View>
    );
  }

  function MenuRow({ icon, label, onPress, iconColor }: { icon: any; label: string; onPress: () => void; iconColor?: string }) {
    return (
      <AnimatedPress onPress={onPress}>
        <View style={[s.menuRow, { borderBottomColor: colors.glassBorder }]}>
          <View style={[s.menuIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)" }]}>
            <Feather name={icon} size={18} color={iconColor || colors.ink} />
          </View>
          <Text style={[s.menuLabel, { color: iconColor || colors.ink }]}>{label}</Text>
          <Feather name="chevron-right" size={18} color={iconColor || colors.muted} />
        </View>
      </AnimatedPress>
    );
  }

  function ToggleRow({ icon, label, value, onChange }: { icon: any; label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
      <View style={[s.menuRow, { borderBottomColor: colors.glassBorder }]}>
        <View style={[s.menuIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)" }]}>
          <Feather name={icon} size={18} color={colors.ink} />
        </View>
        <Text style={[s.menuLabel, { color: colors.ink }]}>{label}</Text>
        <Switch value={value} onValueChange={onChange} trackColor={{ false: isDark ? "#334155" : "#CBD5E1", true: TEAL }} thumbColor="#fff" ios_backgroundColor={isDark ? "#334155" : "#CBD5E1"} />
      </View>
    );
  }

  function ValueRow({ icon, label, value, onPress }: { icon: any; label: string; value: string; onPress?: () => void }) {
    return (
      <AnimatedPress onPress={onPress || (() => {})}>
        <View style={[s.menuRow, { borderBottomColor: colors.glassBorder }]}>
          <View style={[s.menuIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)" }]}>
            <Feather name={icon} size={18} color={colors.ink} />
          </View>
          <Text style={[s.menuLabel, { color: colors.ink }]}>{label}</Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={[typeScale.small, { color: colors.muted, marginRight: 4 }]}>{value}</Text>
            <Feather name="chevron-right" size={16} color={colors.muted} />
          </View>
        </View>
      </AnimatedPress>
    );
  }

  function SectionTitle({ title }: { title: string }) {
    return <Text style={[s.sectionTitle, { color: colors.muted }]}>{title}</Text>;
  }

  function Avatar({ size = 72 }: { size?: number }) {
    return (
      <TouchableOpacity onPress={showPhotoOptions} activeOpacity={0.85}>
        <View style={[s.avatarOuter, { borderColor: TEAL, width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]}>
          {photoUri
            ? <Image source={{ uri: photoUri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
            : <View style={[s.avatarInner, { backgroundColor: isDark ? "#1E3A2F" : "#D1FAE5", width: size, height: size, borderRadius: size / 2 }]}>
                <Feather name="user" size={Math.floor(size * 0.44)} color={TEAL} />
              </View>}
          <View style={[s.cameraBtn, { backgroundColor: TEAL }]}>
            <Feather name="camera" size={10} color="#fff" />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // ── My Reports Screen ────────────────────────────────────────────────────
  if (screen === "reports") {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.paper }]}>
        <Header title={t.myReports} onBack={() => setScreen("profile")} />
        <ScrollView contentContainerStyle={s.scroll}>
          {loading
            ? <ActivityIndicator color={TEAL} style={{ marginTop: 40 }} />
            : reports.length === 0
              ? <GlassCard style={{ padding: spacing.lg }} intensity={25}><Text style={[typeScale.body, { color: colors.muted, textAlign: "center" }]}>{t.noReports}</Text></GlassCard>
              : reports.map((r) => (
                  <AnimatedPress key={r.id} onPress={() => navigation.getParent()?.navigate("ReportStatus", { id: r.id })}>
                    <GlassCard style={s.reportRow} intensity={25}>
                      <View style={[s.reportDot, { backgroundColor: r.status === "resolved" ? TEAL : r.status === "in_progress" ? "#F59E0B" : "#64748B" }]} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[typeScale.label, { color: colors.ink }]}>{r.category || r.description || "Pollution report"}</Text>
                        <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>{r.status?.replace("_", " ")} · {r.created_at ? new Date(r.created_at).toLocaleDateString() : ""}</Text>
                      </View>
                      <Feather name="chevron-right" size={16} color={colors.muted} />
                    </GlassCard>
                  </AnimatedPress>
                ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Account Info Screen ───────────────────────────────────────────────────
  if (screen === "accountInfo") {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.paper }]}>
        <Header title={t.accountInformation} onBack={() => setScreen("profile")} />
        <ScrollView contentContainerStyle={s.scroll}>
          <View style={{ alignItems: "center", marginBottom: spacing.lg }}>
            <Avatar size={90} />
            <TouchableOpacity onPress={showPhotoOptions} style={[s.changePhotoBtn, { borderColor: TEAL }]}>
              <Feather name="camera" size={14} color={TEAL} />
              <Text style={[typeScale.small, { color: TEAL, marginLeft: 6 }]}>{t.changePhoto}</Text>
            </TouchableOpacity>
          </View>
          <GlassCard style={s.infoCard} intensity={25}>
            <View style={s.infoRow}><Text style={[typeScale.small, { color: colors.muted }]}>{t.displayName}</Text><Text style={[typeScale.label, { color: colors.ink }]}>{displayName}</Text></View>
            <View style={[s.divider, { backgroundColor: colors.glassBorder }]} />
            <View style={s.infoRow}><Text style={[typeScale.small, { color: colors.muted }]}>{t.email}</Text><Text style={[typeScale.label, { color: colors.ink }]} numberOfLines={1}>{session?.user.email || "—"}</Text></View>
            <View style={[s.divider, { backgroundColor: colors.glassBorder }]} />
            <View style={s.infoRow}>
              <Text style={[typeScale.small, { color: colors.muted }]}>{t.memberSince}</Text>
              <Text style={[typeScale.label, { color: colors.ink }]}>{session?.user.created_at ? new Date(session.user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "—"}</Text>
            </View>
          </GlassCard>
          <AnimatedPress onPress={() => {}}>
            <View style={[s.editBtn, { backgroundColor: TEAL }]}>
              <Feather name="edit-2" size={16} color="#fff" />
              <Text style={[typeScale.label, { color: "#fff", marginLeft: 8 }]}>{t.editProfile}</Text>
            </View>
          </AnimatedPress>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Badges Screen ─────────────────────────────────────────────────────────
  if (screen === "badges") {
    const badgeList = [
      { emoji: "📍", name: t.reportPro, level: 1, desc: t.reportProDesc, color: "#6366F1", bg: "#EEF2FF" },
      { emoji: "🤝", name: t.communityAlly, level: 1, desc: t.communityAllyDesc, color: "#F59E0B", bg: "#FFF7ED" },
      { emoji: "🛡️", name: t.sentinelScout, level: 1, desc: t.sentinelScoutDesc, color: TEAL, bg: "#ECFDF5" },
    ];
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.paper }]}>
        <Header title={t.badgesAchievements} onBack={() => setScreen("profile")} />
        <ScrollView contentContainerStyle={s.scroll}>
          <Text style={[typeScale.small, { color: colors.muted, textAlign: "center", marginBottom: spacing.md }]}>{t.badgesSubtitle}</Text>
          {badgeList.map((b) => (
            <GlassCard key={b.name} style={s.badgeCard} intensity={25}>
              <View style={[s.badgeEmoji, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : b.bg }]}><Text style={{ fontSize: 28 }}>{b.emoji}</Text></View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[typeScale.label, { color: colors.ink }]}>{b.name}</Text>
                <Text style={[typeScale.small, { color: b.color, marginTop: 2 }]}>{t.level} {b.level}</Text>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>{b.desc}</Text>
              </View>
              <View style={[s.lvlBadge, { backgroundColor: b.color + "20" }]}>
                <Text style={{ fontSize: 11, fontFamily: "Inter_600SemiBold", color: b.color }}>Lv {b.level}</Text>
              </View>
            </GlassCard>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Settings Screen ───────────────────────────────────────────────────────
  if (screen === "settings") {
    return (
      <SafeAreaView style={[s.container, { backgroundColor: colors.paper }]}>
        <Header title={t.settings} onBack={() => setScreen("profile")} />
        <ScrollView contentContainerStyle={s.scroll}>
          <SectionTitle title={t.account} />
          <GlassCard style={s.sectionCard} intensity={20}>
            <MenuRow icon="user" label={t.personalInformation} onPress={() => setScreen("accountInfo")} />
            <MenuRow icon="lock" label={t.changePassword} onPress={() => Alert.alert(t.changePassword, t.changePasswordMsg)} />
            <MenuRow icon="shield" label={t.twoFactorAuth} onPress={() => Alert.alert(t.twoFactorAuth, t.twoFactorMsg)} />
            <MenuRow icon="eye" label={t.privacySecurity} onPress={() => Alert.alert(t.privacySecurity, t.privacyMsg)} />
          </GlassCard>
          <SectionTitle title={t.appSettings} />
          <GlassCard style={s.sectionCard} intensity={20}>
            <ToggleRow icon="bell" label={t.notifications} value={notificationsOn} onChange={setNotificationsOn} />
            <ToggleRow icon="map-pin" label={t.locationServices} value={locationOn} onChange={setLocationOn} />
            <ValueRow icon="globe" label={t.language} value={langLabel} onPress={() => setLangPickerOpen(true)} />
            <ValueRow icon="percent" label={t.units} value="Statics" />
          </GlassCard>
          <SectionTitle title={t.support} />
          <GlassCard style={s.sectionCard} intensity={20}>
            <MenuRow icon="help-circle" label={t.helpSupport} onPress={() => navigation.getParent()?.navigate("HealthSafety")} />
            <MenuRow icon="info" label={t.aboutApp} onPress={() => Alert.alert(t.aboutApp, t.aboutText)} />
          </GlassCard>
          <AnimatedPress onPress={handleLogOut}>
            <View style={[s.logoutRow, { borderColor: colors.danger + "40", backgroundColor: colors.danger + "0D" }]}>
              <Feather name="log-out" size={18} color={colors.danger} />
              <Text style={[typeScale.label, { color: colors.danger, marginLeft: 12 }]}>{t.logOut}</Text>
            </View>
          </AnimatedPress>
        </ScrollView>
        <LanguagePicker visible={langPickerOpen} onClose={() => setLangPickerOpen(false)} current={language} onSelect={setLanguage} isDark={isDark} colors={colors} />
      </SafeAreaView>
    );
  }

  // ── Main Profile Screen ───────────────────────────────────────────────────
  const badges = [
    { emoji: "📍", name: t.reportPro, sub: `(${t.level} 1)`, color: "#6366F1", bg: "#EEF2FF" },
    { emoji: "🤝", name: t.communityAlly, sub: `(${t.level} 1)`, color: "#F59E0B", bg: "#FFF7ED" },
    { emoji: "🛡️", name: t.sentinelScout, sub: `(${t.level} 1)`, color: TEAL, bg: "#ECFDF5" },
  ];

  return (
    <SafeAreaView style={[s.container, { backgroundColor: colors.paper }]}>
      <Header title={t.profile} />
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <GlassCard style={s.profileCard} intensity={20}>
          <View style={s.profileRow}>
            <Avatar size={72} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={[typeScale.label, { color: colors.ink, fontSize: 18, marginBottom: 2 }]} numberOfLines={1}>{displayName}</Text>
              <Text style={[typeScale.small, { color: colors.muted, marginBottom: 4 }]}>{t.userSubtitle} · {t.ecoEnthusiast}</Text>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Feather name="map-pin" size={11} color={colors.muted} />
                <Text style={[typeScale.small, { color: colors.muted, marginLeft: 3 }]}>{t.india}</Text>
              </View>
            </View>
          </View>
          <AnimatedPress onPress={() => setScreen("accountInfo")}>
            <View style={[s.editBtn, { backgroundColor: TEAL }]}>
              <Text style={[typeScale.label, { color: "#fff" }]}>{t.editProfile}</Text>
            </View>
          </AnimatedPress>
        </GlassCard>

        {/* Stats Row */}
        <View style={s.statsRow}>
          {[
            { label: t.reportsShared, value: loading ? "—" : String(reportsShared) },
            { label: t.locationsMonitored, value: loading ? "—" : String(locationsMonitored) },
            { label: t.communityActions, value: loading ? "—" : String(communityActions) },
          ].map((stat) => (
            <GlassCard key={stat.label} style={s.statCard} intensity={20}>
              <Text style={[s.statNum, { color: colors.ink }]}>{stat.value}</Text>
              <Text style={[typeScale.small, { color: colors.muted, textAlign: "center", marginTop: 2 }]}>{stat.label}</Text>
            </GlassCard>
          ))}
        </View>

        {/* Account Information */}
        <AnimatedPress onPress={() => setScreen("accountInfo")}>
          <GlassCard style={s.navCard} intensity={20}>
            <View style={[s.navIcon, { backgroundColor: isDark ? "rgba(99,102,241,0.15)" : "#EEF2FF" }]}><Feather name="user" size={18} color="#6366F1" /></View>
            <Text style={[typeScale.label, { color: colors.ink, flex: 1, marginLeft: 12 }]}>{t.accountInformation}</Text>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </GlassCard>
        </AnimatedPress>

        {/* Badges & Achievements */}
        <GlassCard style={s.badgeSection} intensity={20}>
          <AnimatedPress onPress={() => setScreen("badges")}>
            <View style={s.badgeSectionHeader}>
              <View style={[s.navIcon, { backgroundColor: isDark ? "rgba(245,158,11,0.15)" : "#FFF7ED" }]}><Feather name="award" size={18} color="#F59E0B" /></View>
              <Text style={[typeScale.label, { color: colors.ink, flex: 1, marginLeft: 12 }]}>{t.badgesAchievements}</Text>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </View>
          </AnimatedPress>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
            {badges.map((b) => (
              <AnimatedPress key={b.name} onPress={() => setScreen("badges")}>
                <View style={s.badgeChip}>
                  <View style={[s.badgeCircle, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : b.bg }]}>
                    <Text style={{ fontSize: 28 }}>{b.emoji}</Text>
                    <View style={[s.badgeLvlDot, { backgroundColor: b.color }]}><Text style={{ fontSize: 9, color: "#fff", fontFamily: "Inter_700Bold" }}>10</Text></View>
                  </View>
                  <Text style={[typeScale.small, { color: colors.ink, textAlign: "center", marginTop: 6 }]}>{b.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.muted, textAlign: "center", fontFamily: "Inter_400Regular" }}>{b.sub}</Text>
                </View>
              </AnimatedPress>
            ))}
          </ScrollView>
        </GlassCard>

        {/* App Preferences */}
        <GlassCard style={s.prefsCard} intensity={20}>
          <View style={s.prefHeader}><Feather name="sliders" size={18} color={colors.ink} /><Text style={[typeScale.label, { color: colors.ink, marginLeft: 10 }]}>{t.appPreferences}</Text></View>
          <ToggleRow icon="bell" label={t.notifications} value={notificationsOn} onChange={setNotificationsOn} />
          <ToggleRow icon="map-pin" label={t.locationServices} value={locationOn} onChange={setLocationOn} />
          <ToggleRow icon="moon" label={t.darkMode} value={isDark} onChange={toggleTheme} />
          <AnimatedPress onPress={() => setLangPickerOpen(true)}>
            <View style={[s.menuRow, { borderBottomWidth: 0 }]}>
              <View style={[s.menuIcon, { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)" }]}><Feather name="globe" size={18} color={colors.ink} /></View>
              <Text style={[s.menuLabel, { color: colors.ink }]}>{t.language}</Text>
              <View style={[s.langChip, { backgroundColor: TEAL + "15", borderColor: TEAL + "40" }]}><Text style={{ fontSize: 12, color: TEAL, fontFamily: "Inter_600SemiBold" }}>{langLabel}</Text></View>
              <Feather name="chevron-right" size={16} color={colors.muted} style={{ marginLeft: 6 }} />
            </View>
          </AnimatedPress>
        </GlassCard>

        {/* My Reports */}
        <AnimatedPress onPress={() => setScreen("reports")}>
          <GlassCard style={s.navCard} intensity={20}>
            <View style={[s.navIcon, { backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "#ECFDF5" }]}><Feather name="file-text" size={18} color={TEAL} /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typeScale.label, { color: colors.ink }]}>{t.myReports}</Text>
              <Text style={[typeScale.small, { color: colors.muted }]}>{t.trackReports}</Text>
            </View>
            <View style={[s.countBadge, { backgroundColor: TEAL }]}><Text style={{ fontSize: 11, color: "#fff", fontFamily: "Inter_700Bold" }}>{loading ? "…" : reportsShared}</Text></View>
            <Feather name="chevron-right" size={18} color={colors.muted} style={{ marginLeft: 8 }} />
          </GlassCard>
        </AnimatedPress>

        {/* Health & Safety */}
        <AnimatedPress onPress={() => navigation.getParent()?.navigate("HealthSafety")}>
          <GlassCard style={s.navCard} intensity={20}>
            <View style={[s.navIcon, { backgroundColor: isDark ? "rgba(239,68,68,0.15)" : "#FEF2F2" }]}><Feather name="heart" size={18} color="#EF4444" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typeScale.label, { color: colors.ink }]}>{t.healthSafety}</Text>
              <Text style={[typeScale.small, { color: colors.muted }]}>{t.healthSafetyDesc}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </GlassCard>
        </AnimatedPress>

        {/* Settings */}
        <AnimatedPress onPress={() => setScreen("settings")}>
          <GlassCard style={s.navCard} intensity={20}>
            <View style={[s.navIcon, { backgroundColor: isDark ? "rgba(100,116,139,0.15)" : "#F1F5F9" }]}><Feather name="settings" size={18} color="#64748B" /></View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[typeScale.label, { color: colors.ink }]}>{t.settings}</Text>
              <Text style={[typeScale.small, { color: colors.muted }]}>{t.settingsDesc}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.muted} />
          </GlassCard>
        </AnimatedPress>

        {/* Log Out */}
        <AnimatedPress onPress={handleLogOut}>
          <View style={[s.logoutRow, { borderColor: colors.danger + "40", backgroundColor: colors.danger + "0D", marginBottom: spacing.xl }]}>
            <Feather name="log-out" size={18} color={colors.danger} />
            <Text style={[typeScale.label, { color: colors.danger, marginLeft: 12 }]}>{t.logOut}</Text>
          </View>
        </AnimatedPress>

      </ScrollView>

      <LanguagePicker visible={langPickerOpen} onClose={() => setLangPickerOpen(false)} current={language} onSelect={setLanguage} isDark={isDark} colors={colors} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 64 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, paddingVertical: 14, borderBottomWidth: 1 },
  headerBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  avatarOuter: { borderWidth: 2.5, alignItems: "center", justifyContent: "center", position: "relative" },
  avatarInner: { alignItems: "center", justifyContent: "center" },
  cameraBtn: { position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  changePhotoBtn: { flexDirection: "row", alignItems: "center", marginTop: 10, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  profileCard: { marginBottom: spacing.sm, padding: spacing.md },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.md },
  editBtn: { borderRadius: radius.xl, paddingVertical: 12, alignItems: "center", justifyContent: "center", flexDirection: "row" },
  statsRow: { flexDirection: "row", marginBottom: spacing.sm, gap: 8 },
  statCard: { flex: 1, alignItems: "center", padding: spacing.sm },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold", lineHeight: 28 },
  navCard: { flexDirection: "row", alignItems: "center", padding: spacing.md, marginBottom: spacing.sm },
  navIcon: { width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeSection: { marginBottom: spacing.sm, padding: spacing.md },
  badgeSectionHeader: { flexDirection: "row", alignItems: "center" },
  badgeChip: { alignItems: "center", marginRight: spacing.md, width: 88 },
  badgeCircle: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", position: "relative" },
  badgeLvlDot: { position: "absolute", bottom: 2, right: 2, width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  prefsCard: { marginBottom: spacing.sm, padding: spacing.md },
  prefHeader: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  menuRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  langChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  sectionCard: { padding: 0, marginBottom: spacing.sm, paddingHorizontal: spacing.md },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.6, marginBottom: 6, marginTop: spacing.sm, textTransform: "uppercase" },
  infoCard: { padding: spacing.md, marginBottom: spacing.md },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  divider: { height: StyleSheet.hairlineWidth },
  badgeCard: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm, padding: spacing.md },
  badgeEmoji: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  lvlBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  reportRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  reportDot: { width: 10, height: 10, borderRadius: 5 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, minWidth: 28, alignItems: "center" },
  logoutRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, marginBottom: spacing.sm },
});
