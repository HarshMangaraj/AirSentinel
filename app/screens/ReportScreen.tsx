import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Feather } from '@expo/vector-icons';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';
import { useTheme } from '../context/ThemeContext';
import { uploadReportImage } from '../lib/storage';
import { submitReport } from '../lib/api';
import { getDeviceLocation, reverseGeocode } from '../lib/location';
import { type as typeScale, spacing, radius } from '../theme/tokens';

const CATEGORIES = ['Smoke', 'Road Dust', 'Waste Burning', 'Industrial Emission', 'Other'];

export function ReportScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function useCurrentLocation() {
    const loc = await getDeviceLocation();
    if (loc) {
      const label = await reverseGeocode(loc.lat, loc.lon);
      setLocationLabel(label);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setErrorMsg('');

    const loc = await getDeviceLocation();
    if (!loc) {
      setErrorMsg('Location permission is needed to submit a report.');
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
        description,
        category: category || undefined,
        media_url: mediaUrl,
        lat: loc.lat,
        lon: loc.lon,
      });
      setShowToast(true);
      setDescription('');
      setCategory(null);
      setImageUri(null);
      setTimeout(() => {
        setShowToast(false);
        navigation.goBack();
      }, 1400);
    } catch {
      setErrorMsg('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.paper }]}>
      <Toast message="Report submitted. Thank you." visible={showToast} />

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={[typeScale.title, { color: colors.ink, marginBottom: spacing.md }]}>Report Pollution</Text>

        <Pressable onPress={pickImage}>
          <GlassCard style={styles.imagePicker}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.image} />
            ) : (
              <View style={{ alignItems: 'center' }}>
                <Feather name="camera" size={22} color={colors.muted} />
                <Text style={{ color: colors.muted, marginTop: 6 }}>Add Photo or Video</Text>
                <Text style={[typeScale.small, { color: colors.muted, marginTop: 2 }]}>(Optional evidence)</Text>
              </View>
            )}
          </GlassCard>
        </Pressable>

        <Text style={[typeScale.label, { color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Pollution Type
        </Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            return (
              <Pressable key={cat} onPress={() => setCategory(cat)} style={styles.categoryItem}>
                <View
                  style={[
                    styles.categoryChip,
                    { borderColor: colors.glassBorder, backgroundColor: colors.glass },
                    active && { backgroundColor: colors.signal, borderColor: colors.signal },
                  ]}
                >
                  <Text style={[typeScale.body, { color: active ? '#FFF' : colors.ink }]}>{cat}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <Text style={[typeScale.label, { color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Location
        </Text>
        <Pressable onPress={useCurrentLocation}>
          <GlassCard style={styles.locationRow} intensity={25}>
            <Feather name="map-pin" size={16} color={colors.signal} style={{ marginRight: 8 }} />
            <Text style={[typeScale.body, { color: colors.ink, flex: 1 }]}>
              {locationLabel || 'Use current location'}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.muted} />
          </GlassCard>
        </Pressable>

        <Text style={[typeScale.label, { color: colors.ink, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
          Description
        </Text>
        <GlassCard style={styles.inputCard}>
          <TextInput
            style={[typeScale.body, { color: colors.ink, minHeight: 80, textAlignVertical: 'top' }]}
            placeholder="Describe what you observed..."
            placeholderTextColor={colors.muted}
            multiline
            maxLength={500}
            value={description}
            onChangeText={setDescription}
          />
        </GlassCard>
        <Text style={[typeScale.small, { color: colors.muted, textAlign: 'right', marginTop: 2 }]}>
          {description.length}/500
        </Text>

        {errorMsg ? (
          <Text style={[typeScale.small, { color: colors.danger, marginTop: spacing.sm }]}>{errorMsg}</Text>
        ) : null}

        <View style={{ marginTop: spacing.lg }}>
          <Button label={submitting ? 'Submitting...' : 'Submit Report'} onPress={handleSubmit} loading={submitting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imagePicker: { height: 160, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  categoryItem: {},
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  inputCard: {},
});