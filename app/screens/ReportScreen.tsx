import { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView, Modal, ActivityIndicator,
  Animated, TouchableOpacity, KeyboardAvoidingView, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";
import { Toast } from "../components/Toast";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { uploadReportImage } from "../lib/storage";
import { submitReport, getMyReports, NearbyReport } from "../lib/api";
import { getDeviceLocation, reverseGeocode } from "../lib/location";
import { type as typeScale, spacing, radius } from "../theme/tokens";

const CATEGORIES = ["Smoke", "Road Dust", "Waste Burning", "Industrial Emission", "Other"];
const TEAL = "#10B981";

function AnimatedPress({ onPress, style, children }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Pressable
      onPressIn={() => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
      onPress={onPress}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

// Dummy data for visual enhancement
const DUMMY_REPORTS: NearbyReport[] = [
  {
    id: "dummy-1", description: "Heavy smoke from construction site", category: "Smoke",
    media_url: "https://images.unsplash.com/photo-1611273426858-450d873bc363?auto=format&fit=crop&w=400&q=80",
    lat: 0, lon: 0, status: "pending", created_at: new Date().toISOString(), distance_km: 2.4
  },
  {
    id: "dummy-2", description: "Industrial emissions", category: "Industrial Emission",
    media_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80",
    lat: 0, lon: 0, status: "resolved", created_at: new Date(Date.now() - 86400000).toISOString(), distance_km: 12.1
  }
];

export function ReportScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [recentReports, setRecentReports] = useState<NearbyReport[]>(DUMMY_REPORTS);
  const [loadingReports, setLoadingReports] = useState(true);

  useEffect(() => { fetchReports(); }, []);

  function fetchReports() {
    setLoadingReports(true);
    getMyReports()
      .then((data) => setRecentReports([...data, ...DUMMY_REPORTS]))
      .catch(() => {})
      .finally(() => setLoadingReports(false));
  }

  async function openCamera() {
    setOptionsModalVisible(false);
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setFormModalVisible(true);
      fetchLocation();
    }
  }

  async function openGallery() {
    setOptionsModalVisible(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
      setFormModalVisible(true);
      fetchLocation();
    }
  }

  async function handleLocationOnly() {
    setOptionsModalVisible(false);
    setImageUri(null);
    setFormModalVisible(true);
    fetchLocation();
  }

  async function fetchLocation() {
    const loc = await getDeviceLocation();
    if (loc) {
      setLocationCoords(loc);
      const label = await reverseGeocode(loc.lat, loc.lon);
      setLocationLabel(label);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMsg("");

    if (!locationCoords) {
      setErrorMsg("Location is required.");
      setSubmitting(false);
      return;
    }

    let mediaUrl: string | undefined;
    if (imageUri) {
      const uploaded = await uploadReportImage(imageUri);
      mediaUrl = uploaded || undefined;
    }

    try {
      await submitReport({
        description, category: category || undefined, media_url: mediaUrl,
        lat: locationCoords.lat, lon: locationCoords.lon,
      });
      setShowToast(true);
      setFormModalVisible(false);
      setDescription(""); setCategory(null); setImageUri(null);
      fetchReports();
      setTimeout(() => setShowToast(false), 2000);
    } catch {
      setErrorMsg("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const PollutantBar = ({ label, value, max, color }: any) => {
    const pct = Math.min((value / max) * 100, 100);
    return (
      <View style={{ marginBottom: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
          <Text style={[typeScale.small, { color: colors.ink }]}>{label}</Text>
          <Text style={[typeScale.small, { color: colors.muted }]}>{value} µg/m³</Text>
        </View>
        <View style={{ height: 6, backgroundColor: isDark ? "#334155" : "#E2E8F0", borderRadius: 3, overflow: "hidden" }}>
          <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 3 }} />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <Toast message="Report sent to Authority Panel for review." visible={showToast} />
      
      <View style={styles.header}>
        <Text style={[typeScale.title, { color: colors.ink }]}>Community Reports</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Compressed Hero Card */}
        <AnimatedPress onPress={() => setOptionsModalVisible(true)}>
          <GlassCard 
            intensity={isDark ? 20 : 40} 
            style={[styles.heroCard, { 
              paddingVertical: spacing.xl,
              borderColor: 'rgba(255, 0, 60, 0.8)', 
              borderWidth: 1.5,
              shadowColor: '#FF003C',
              shadowOpacity: 0.6,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8
            }]}
          >
            <View style={[styles.heroIconWrap, { backgroundColor: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)' }]}>
              <Feather name="camera" size={28} color={TEAL} />
            </View>
            <Text style={[typeScale.title, { color: colors.ink, fontSize: 20, marginTop: 12, marginBottom: 4, textAlign: 'center' }]}>
              Report Air Pollution
            </Text>
            <Text style={[typeScale.body, { color: colors.muted, textAlign: 'center', paddingHorizontal: 20 }]}>
              Tap to share a photo or video and help authorities make the city cleaner.
            </Text>
          </GlassCard>
        </AnimatedPress>

        {/* Graph Section */}
        <Text style={[typeScale.label, { color: colors.ink, marginTop: spacing.xl, marginBottom: spacing.md }]}>AQI Trend</Text>
        <GlassCard intensity={25} style={{ padding: spacing.md, marginBottom: spacing.lg }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
            <Text style={[typeScale.small, { color: colors.muted }]}>Last 7 Days</Text>
            <Feather name="calendar" size={16} color={colors.muted} />
          </View>
          
          <View style={{ height: 120, width: "100%", marginBottom: 12 }}>
            <Svg height="100%" width="100%" viewBox="0 0 300 120">
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={TEAL} stopOpacity="0.3" />
                  <Stop offset="1" stopColor={TEAL} stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Path d="M0 120 L0 80 Q 25 60 50 70 T 100 50 T 150 70 T 200 40 T 250 80 T 300 30 L300 120 Z" fill="url(#grad)" />
              <Path d="M0 80 Q 25 60 50 70 T 100 50 T 150 70 T 200 40 T 250 80 T 300 30" fill="none" stroke={TEAL} strokeWidth="3" />
            </Svg>
          </View>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 10 }}>
            {[{l:"Good", c:colors.aqi.good}, {l:"Moderate", c:colors.aqi.moderate}, {l:"Poor", c:colors.aqi.unhealthy}, {l:"Severe", c:colors.aqi.hazardous}].map(item => (
              <View key={item.l} style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.c, marginRight: 6 }} />
                <Text style={{ fontSize: 10, color: colors.muted }}>{item.l}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Pollutants Section */}
        <Text style={[typeScale.label, { color: colors.ink, marginBottom: spacing.md }]}>Pollutant Levels</Text>
        <GlassCard intensity={25} style={{ padding: spacing.md, marginBottom: spacing.lg }}>
          <PollutantBar label="PM2.5" value={18} max={50} color={colors.aqi.good} />
          <PollutantBar label="PM10" value={32} max={100} color={colors.aqi.good} />
          <PollutantBar label="NO₂" value={12} max={50} color={colors.aqi.good} />
          <PollutantBar label="SO₂" value={6} max={50} color={colors.aqi.good} />
        </GlassCard>

        {/* Recent Reports List */}
        <Text style={[typeScale.label, { color: colors.ink, marginBottom: spacing.md }]}>Recent Reports</Text>
        {loadingReports ? (
          <ActivityIndicator color={TEAL} style={{ marginTop: 40 }} />
        ) : recentReports.length === 0 ? (
          <GlassCard intensity={25} style={{ padding: spacing.lg, alignItems: "center" }}><Text style={[typeScale.body, { color: colors.muted }]}>No recent reports.</Text></GlassCard>
        ) : (
          recentReports.map((report) => (
            <AnimatedPress key={report.id} onPress={() => navigation.navigate("ReportStatus", { id: report.id })}>
              <GlassCard style={styles.reportRow} intensity={20}>
                {report.media_url ? (
                  <Image source={{ uri: report.media_url }} style={styles.reportImage} />
                ) : (
                  <View style={[styles.reportImage, { backgroundColor: isDark ? "#334155" : "#E2E8F0", alignItems: "center", justifyContent: "center" }]}><Feather name="image" size={20} color={colors.muted} /></View>
                )}
                
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[typeScale.label, { color: colors.ink }]} numberOfLines={1}>
                    {report.category || report.description || "Air Pollution"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                    <Text style={[typeScale.small, { color: colors.muted }]}>
                      {report.distance_km ? `${report.distance_km} km away` : "Nearby"} · 
                    </Text>
                    <Text style={[typeScale.small, { color: report.status === "pending" ? "#F59E0B" : TEAL, marginLeft: 4 }]}>
                      {report.status === "pending" ? "Pending Review" : "Verified"}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </GlassCard>
            </AnimatedPress>
          ))
        )}
      </ScrollView>

      {/* Options Modal (Pop up on card tap) */}
      <Modal visible={optionsModalVisible} animationType="fade" transparent={true} onRequestClose={() => setOptionsModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setOptionsModalVisible(false)}>
          <View style={[styles.optionsModal, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
            <View style={[styles.handle, { backgroundColor: colors.glassBorder }]} />
            <Text style={[typeScale.title, { color: colors.ink, fontSize: 18, marginBottom: 20, textAlign: "center" }]}>Report Source</Text>
            
            <View style={styles.heroActionRow}>
              <AnimatedPress onPress={openCamera} style={styles.actionItem}>
                <View style={[styles.actionCircle, { borderColor: TEAL }]}><Feather name="camera" size={22} color={TEAL} /></View>
                <Text style={[typeScale.small, { color: colors.ink, marginTop: 8 }]}>Take Photo</Text>
              </AnimatedPress>
              <AnimatedPress onPress={openGallery} style={styles.actionItem}>
                <View style={[styles.actionCircle, { borderColor: TEAL }]}><Feather name="image" size={22} color={TEAL} /></View>
                <Text style={[typeScale.small, { color: colors.ink, marginTop: 8 }]}>Choose Photo</Text>
              </AnimatedPress>
              <AnimatedPress onPress={handleLocationOnly} style={styles.actionItem}>
                <View style={[styles.actionCircle, { borderColor: TEAL }]}><Feather name="map-pin" size={22} color={TEAL} /></View>
                <Text style={[typeScale.small, { color: colors.ink, marginTop: 8 }]}>Location</Text>
              </AnimatedPress>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Form Modal */}
      <Modal visible={formModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: "flex-end" }}>
            <View style={[styles.modalContent, { backgroundColor: isDark ? "#1E293B" : "#FFFFFF" }]}>
              <View style={styles.modalHeader}>
                <Text style={[typeScale.title, { color: colors.ink, fontSize: 18 }]}>Complete Report</Text>
                <TouchableOpacity onPress={() => setFormModalVisible(false)}><Feather name="x" size={24} color={colors.ink} /></TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {imageUri && <Image source={{ uri: imageUri }} style={{ width: "100%", height: 160, borderRadius: radius.md, marginBottom: spacing.md }} />}

                <Text style={[typeScale.label, { color: colors.ink, marginBottom: 8 }]}>Pollution Type</Text>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat} onPress={() => setCategory(cat)}
                      style={[
                        styles.categoryChip, { borderColor: colors.glassBorder, backgroundColor: isDark ? "#334155" : "#F1F5F9" },
                        category === cat && { backgroundColor: TEAL, borderColor: TEAL },
                      ]}
                    >
                      <Text style={[typeScale.body, { fontSize: 14, color: category === cat ? "#FFF" : colors.ink }]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[typeScale.label, { color: colors.ink, marginTop: spacing.lg, marginBottom: 8 }]}>Description</Text>
                <TextInput
                  style={[styles.input, { color: colors.ink, borderColor: colors.glassBorder, backgroundColor: isDark ? "#0F172A" : "#F8FAFC" }]}
                  placeholder="Describe what you observed..." placeholderTextColor={colors.muted} multiline
                  value={description} onChangeText={setDescription}
                />

                <Text style={[typeScale.label, { color: colors.ink, marginTop: spacing.lg, marginBottom: 8 }]}>Location</Text>
                <View style={[styles.locationRow, { backgroundColor: isDark ? "#334155" : "#F1F5F9", borderColor: colors.glassBorder, borderWidth: 1 }]}>
                  <Feather name="map-pin" size={16} color={TEAL} style={{ marginRight: 8 }} />
                  <Text style={[typeScale.body, { color: colors.ink, flex: 1, fontSize: 14 }]} numberOfLines={1}>{locationLabel || "Fetching location..."}</Text>
                </View>

                {errorMsg ? <Text style={{ color: colors.danger, marginTop: 10, fontSize: 13 }}>{errorMsg}</Text> : null}

                <View style={{ marginTop: spacing.xl, marginBottom: spacing.xl }}>
                  <Button label={submitting ? "Sending to Authority..." : "Submit Report"} onPress={handleSubmit} loading={submitting} />
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm },
  
  heroCard: {
    borderRadius: 20,
    padding: spacing.md,
    alignItems: "center",
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  heroActionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 10,
  },
  actionItem: { alignItems: "center" },
  actionCircle: {
    width: 54, height: 54, borderRadius: 27, borderWidth: 1.5, backgroundColor: "#FFFFFF",
    alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },

  reportRow: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm, padding: 12 },
  reportImage: { width: 56, height: 56, borderRadius: 12 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  optionsModal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 20 },
  
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  input: { minHeight: 100, borderWidth: 1, borderRadius: radius.md, padding: 14, textAlignVertical: "top", fontSize: 15 },
  locationRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: radius.md },
});
