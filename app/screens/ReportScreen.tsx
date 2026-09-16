import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { useTheme } from '../context/ThemeContext';
import { uploadReportImage } from '../lib/storage';
import { submitReport } from '../lib/api';
import { getDeviceLocation } from '../lib/location';
import { type as typeScale, spacing, radius } from '../theme/tokens';

export function ReportScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function pickImage() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({ quality: 0.5 });
    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setMessage('');

    const loc = await getDeviceLocation();
    if (!loc) {
      setMessage('Location permission is needed to submit a report.');
      setSubmitting(false);
      return;
    }

    let mediaUrl: string | undefined;
    if (imageUri) {
      const uploaded = await uploadReportImage(imageUri);
      mediaUrl = uploaded || undefined;
    }

    try {
      await submitReport({ description, media_url: mediaUrl, lat: loc.lat, lon: loc.lon });
      setMessage('Report submitted. Thank you.');
      setDescription('');
      setImageUri(null);
      setTimeout(() => navigation.goBack(), 1200);
    } catch {
      setMessage('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.paper }]}>
      <Text style={[typeScale.title, { color: colors.ink, marginBottom: spacing.md }]}>Report pollution</Text>

      <Pressable onPress={pickImage}>
        <GlassCard style={styles.imagePicker}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={{ color: colors.muted }}>📷 Tap to take a photo</Text>
          )}
        </GlassCard>
      </Pressable>

      <GlassCard style={styles.inputCard}>
        <TextInput
          style={[typeScale.body, { color: colors.ink, minHeight: 80, textAlignVertical: 'top' }]}
          placeholder="What are you seeing? (smoke, burning, dust, etc.)"
          placeholderTextColor={colors.muted}
          multiline
          value={description}
          onChangeText={setDescription}
        />
      </GlassCard>

      {message ? <Text style={[typeScale.small, { color: colors.muted, marginBottom: spacing.sm }]}>{message}</Text> : null}

      <Button label={submitting ? 'Submitting...' : 'Submit report'} onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, paddingTop: 60 },
  imagePicker: { height: 180, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, padding: 0, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  inputCard: { marginBottom: spacing.md },
});