import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const { width: W } = Dimensions.get('window');

function LeafLogo({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path d="M40 10 C20 10 8 28 10 50 C12 70 30 72 42 68 C54 64 70 52 68 32 C66 14 52 8 40 10Z" fill="#0B9B6A" />
      <Path d="M40 18 C26 18 16 32 18 48 C20 62 32 65 42 61 C52 57 62 47 60 34 C58 20 48 16 40 18Z" fill="#0DCCB5" opacity={0.5} />
      <Path d="M40 68 Q38 58 36 45" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M36 45 Q28 38 22 30" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d="M36 45 Q44 40 52 32" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function AnimatedInput({ icon, placeholder, value, onChangeText, keyboardType, multiline, maxLength, rightText }: any) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, { toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }, [focused]);

  const borderColor = borderAnim.interpolate({ inputRange: [0, 1], outputRange: ['#E2EBE8', '#0B9B6A'] });
  const shadowOpacity = borderAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.12] });

  return (
    <Animated.View style={[
      styles.inputContainer,
      multiline && { height: 90, alignItems: 'flex-start' },
      { borderColor, shadowOpacity, shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, elevation: focused ? 4 : 0 }
    ]}>
      <View style={[styles.inputIconWrap, multiline && { paddingTop: 14 }]}>
        <Feather name={icon} size={18} color={focused ? '#0B9B6A' : '#94A3B8'} />
      </View>
      <TextInput
        style={[styles.inputField, multiline && { height: 80, textAlignVertical: 'top', paddingTop: 14 }]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="words"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        multiline={multiline}
        maxLength={maxLength}
      />
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
    </Animated.View>
  );
}

// Step indicator
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.stepRow}>
      {Array.from({ length: total }).map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.stepDot,
            i < current
              ? { backgroundColor: '#0B9B6A', width: 24 }
              : i === current
              ? { backgroundColor: '#0B9B6A', width: 32 }
              : { backgroundColor: '#D0EBE4', width: 8 }
          ]}
        />
      ))}
    </View>
  );
}

export function ProfileSetupScreen({ navigation }: any) {
  const { session, refreshProfile } = useAuth();
  const [step, setStep] = useState(0); // 0 = name, 1 = phone, 2 = bio
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Animate on step change
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, [step]);

  function validateStep(): boolean {
    if (step === 0 && fullName.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters).');
      return false;
    }
    if (step === 1 && phone.trim().length > 0 && !/^[+\d\s-]{7,15}$/.test(phone.trim())) {
      setError('Enter a valid phone number or leave it blank.');
      return false;
    }
    setError('');
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step < 2) {
      setStep(s => s + 1);
    } else {
      saveProfile();
    }
  }


  async function saveProfile() {
    if (!session?.user.id) return;
    setLoading(true);
    try {
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: fullName.trim(),
        phone: phone.trim() || null,
        bio: bio.trim() || null,
        avatar_url: null,
        created_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      if (upsertError) {
        // Table not created yet in Supabase
        if (
          upsertError.message.includes('schema cache') ||
          upsertError.message.includes('does not exist') ||
          upsertError.message.includes('relation') ||
          upsertError.code === 'PGRST204' ||
          upsertError.code === '42P01'
        ) {
          // Fallback: save name to Supabase Auth user_metadata so app can proceed
          await supabase.auth.updateUser({
            data: { full_name: fullName.trim(), phone: phone.trim() || null, bio: bio.trim() || null }
          });
          // Force refresh so navigator can proceed
          await refreshProfile();
          return;
        }
        setError(upsertError.message);
      } else {
        await refreshProfile();
      }
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  }


  const steps = [
    {
      icon: 'user',
      title: "What's your name?",
      subtitle: `This is how you'll appear in AirSentinel and to the community.`,
      field: (
        <AnimatedInput
          icon="user"
          placeholder="Full Name"
          value={fullName}
          onChangeText={(t: string) => { setFullName(t); setError(''); }}
        />
      ),
    },
    {
      icon: 'phone',
      title: 'Your phone number',
      subtitle: 'Optional — used for emergency alerts and account recovery.',
      field: (
        <AnimatedInput
          icon="phone"
          placeholder="Phone Number (optional)"
          value={phone}
          onChangeText={(t: string) => { setPhone(t); setError(''); }}
          keyboardType="phone-pad"
        />
      ),
    },
    {
      icon: 'edit-3',
      title: 'Tell us about yourself',
      subtitle: 'Optional — a short bio shown on your public profile.',
      field: (
        <AnimatedInput
          icon="edit-3"
          placeholder="Short bio (optional)"
          value={bio}
          onChangeText={(t: string) => { setBio(t); setError(''); }}
          multiline
          maxLength={120}
          rightText={`${bio.length}/120`}
        />
      ),
    },
  ];

  const currentStep = steps[step];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FFFE" />
      <LinearGradient colors={['#F8FFFE', '#EEF9F6', '#F8FFFE']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
            {/* Header */}
            <View style={styles.header}>
              {step > 0 ? (
                <Pressable onPress={() => { setError(''); setStep(s => s - 1); }} style={styles.backBtn}>
                  <Feather name="arrow-left" size={20} color="#0F2B24" />
                </Pressable>
              ) : <View style={styles.backBtn} />}
              <View style={styles.logoMini}>
                <LeafLogo size={28} />
              </View>
              <View style={styles.backBtn} />
            </View>

            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Step indicator */}
              <StepIndicator current={step} total={3} />

              {/* Icon badge */}
              <View style={styles.iconBadge}>
                <Feather name={currentStep.icon as any} size={32} color="#0B9B6A" />
              </View>

              {/* Titles */}
              <Text style={styles.stepTitle}>{currentStep.title}</Text>
              <Text style={styles.stepSubtitle}>{currentStep.subtitle}</Text>

              {/* Email display */}
              {step === 0 && (
                <View style={styles.emailChip}>
                  <Feather name="mail" size={14} color="#0B9B6A" />
                  <Text style={styles.emailChipText}>{session?.user.email}</Text>
                </View>
              )}

              {/* Field */}
              <View style={styles.fieldWrap}>
                {currentStep.field}
              </View>

              {/* Error */}
              {error ? (
                <View style={styles.errorRow}>
                  <Feather name="alert-circle" size={14} color="#EF4444" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* CTA Button */}
              <Pressable onPress={handleNext} disabled={loading} style={({ pressed }) => [
                styles.ctaBtn, pressed && { opacity: 0.88, transform: [{ scale: 0.98 }] }
              ]}>
                <LinearGradient
                  colors={['#0B9B6A', '#0DCCB5']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.ctaBtnText}>{step < 2 ? 'Continue' : 'Finish Setup'}</Text>
                      <Feather name={step < 2 ? 'arrow-right' : 'check-circle'} size={20} color="#FFF" style={{ marginLeft: 8 }} />
                    </>
                  )}
                </LinearGradient>
              </Pressable>

              {/* Skip for optional steps */}
              {step > 0 && (
                <Pressable onPress={() => step < 2 ? setStep(s => s + 1) : saveProfile()} style={styles.skipBtn}>
                  <Text style={styles.skipText}>Skip for now</Text>
                </Pressable>
              )}

              {/* Progress note */}
              <Text style={styles.progressNote}>Step {step + 1} of 3</Text>
            </Animated.View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFE' },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  logoMini: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  content: { paddingHorizontal: 28, paddingTop: 12 },
  stepRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginBottom: 36 },
  stepDot: { height: 8, borderRadius: 4, backgroundColor: '#D0EBE4' },
  iconBadge: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(11,155,106,0.1)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 24, alignSelf: 'center',
    shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  stepTitle: { fontSize: 26, fontWeight: '800', color: '#0F2B24', marginBottom: 10, textAlign: 'center' },
  stepSubtitle: { fontSize: 15, color: '#5A8A7A', lineHeight: 23, textAlign: 'center', marginBottom: 20 },
  emailChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(11,155,106,0.08)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, alignSelf: 'center', marginBottom: 20,
  },
  emailChipText: { fontSize: 13, color: '#0B9B6A', fontWeight: '600' },
  fieldWrap: { marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1.5,
    overflow: 'hidden', height: 52,
  },
  inputIconWrap: { paddingLeft: 16, paddingRight: 10 },
  inputField: { flex: 1, height: 52, fontSize: 15, color: '#0F2B24', paddingVertical: 0 },
  rightText: { paddingRight: 14, fontSize: 12, color: '#94A3B8' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '500', flex: 1 },
  ctaBtn: { marginTop: 20 },
  ctaGradient: {
    borderRadius: 14, height: 54, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  ctaBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },
  skipBtn: { alignSelf: 'center', marginTop: 16, paddingVertical: 8, paddingHorizontal: 16 },
  skipText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  progressNote: { textAlign: 'center', fontSize: 12, color: '#B0C4BC', marginTop: 12 },
});
