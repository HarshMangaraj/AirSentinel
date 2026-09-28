import { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Animated, Dimensions, KeyboardAvoidingView, Platform,
  ScrollView, StatusBar, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';
import { supabase } from '../lib/supabase';

const { width: W, height: H } = Dimensions.get('window');

function LeafLogo({ size = 52 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80">
      <Path
        d="M40 10 C20 10 8 28 10 50 C12 70 30 72 42 68 C54 64 70 52 68 32 C66 14 52 8 40 10Z"
        fill="#0B9B6A"
      />
      <Path
        d="M40 18 C26 18 16 32 18 48 C20 62 32 65 42 61 C52 57 62 47 60 34 C58 20 48 16 40 18Z"
        fill="#0DCCB5"
        opacity={0.5}
      />
      <Path d="M40 68 Q38 58 36 45" stroke="#FFF" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      <Path d="M36 45 Q28 38 22 30" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
      <Path d="M36 45 Q44 40 52 32" stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

function DecorativeLeaf({ style }: { style?: any }) {
  return (
    <View style={[{ position: 'absolute', opacity: 0.15 }, style]} pointerEvents="none">
      <Svg width={120} height={140} viewBox="0 0 80 100">
        <Path
          d="M40 5 C10 5 2 30 5 55 C8 80 28 88 45 82 C62 76 78 58 74 35 C70 12 55 3 40 5Z"
          fill="#0B9B6A"
        />
      </Svg>
    </View>
  );
}

function AnimatedInput({
  icon, placeholder, value, onChangeText, secureTextEntry, rightIcon, onRightIconPress, keyboardType
}: any) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0, duration: 200, useNativeDriver: false,
    }).start();
  }, [focused]);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focused || value ? 1 : 0, duration: 150, useNativeDriver: false,
    }).start();
  }, [focused, value]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1], outputRange: ['#E2EBE8', '#0B9B6A'],
  });
  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1], outputRange: [0, 0.15],
  });

  return (
    <Animated.View style={[
      styles.inputContainer,
      { borderColor, shadowOpacity, shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, elevation: focused ? 4 : 0 }
    ]}>
      <View style={styles.inputIconWrap}>
        <Feather name={icon} size={18} color={focused ? '#0B9B6A' : '#94A3B8'} />
      </View>
      <TextInput
        style={styles.inputField}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize="none"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {rightIcon && (
        <Pressable onPress={onRightIconPress} style={styles.inputRightIcon}>
          <Feather name={rightIcon} size={18} color="#94A3B8" />
        </Pressable>
      )}
    </Animated.View>
  );
}

function PressableButton({ label, onPress, loading, style, textStyle, variant = 'primary', icon }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.97, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0.9, duration: 80, useNativeDriver: true }),
    ]).start();
  };
  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} disabled={loading}>
      <Animated.View style={[{ transform: [{ scale }], opacity }, style]}>
        {variant === 'primary' ? (
          <LinearGradient
            colors={loading ? ['#82CCAE', '#82CCAE'] : ['#0B9B6A', '#0DCCB5']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            {loading ? (
              <Text style={[styles.primaryBtnText, textStyle]}>Please wait...</Text>
            ) : (
              <>
                <Text style={[styles.primaryBtnText, textStyle]}>{label}</Text>
                {icon && <Feather name={icon} size={18} color="#FFF" style={{ marginLeft: 8 }} />}
              </>
            )}
          </LinearGradient>
        ) : (
          <View style={styles.secondaryBtn}>
            {icon && <Text style={styles.socialIcon}>{icon}</Text>}
            <Text style={[styles.secondaryBtnText, textStyle]}>{label}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

export function SignInScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  async function sendCode() {
    if (!email.includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigation.navigate('VerifyOtp', { email });
  }

  async function handleGoogleSignIn() {
    Alert.alert('Google Sign In', 'Google sign in requires additional setup for native apps.');
  }
  async function handleAppleSignIn() {
    Alert.alert('Apple Sign In', 'Apple sign in requires additional setup for native apps.');
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FFFE" />
      <LinearGradient colors={['#F8FFFE', '#EEF9F6', '#F8FFFE']} style={StyleSheet.absoluteFill} />

      {/* Decorative leaves */}
      <DecorativeLeaf style={{ top: -30, right: -20, transform: [{ rotate: '-30deg' }, { scale: 1.2 }] }} />
      <DecorativeLeaf style={{ top: 60, right: 10, transform: [{ rotate: '-15deg' }, { scale: 0.8 }] }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
              {/* Logo & Brand */}
              <View style={styles.brandSection}>
                <View style={styles.logoWrap}>
                  <LeafLogo size={52} />
                </View>
                <Text style={styles.brandTitle}>AirSentnel</Text>
                <View style={styles.taglineRow}>
                  <Text style={styles.taglineText}>Cleaner Air</Text>
                  <Text style={styles.taglineBullet}> • </Text>
                  <Text style={styles.taglineText}>Safer Tomorrow</Text>
                </View>
              </View>

              {/* Welcome */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeTitle}>Welcome Back</Text>
                <Text style={styles.welcomeSubtitle}>
                  Sign in to continue monitoring{'\n'}air quality and keep your environment safe.
                </Text>
              </View>

              {/* Form */}
              <View style={styles.formSection}>
                <AnimatedInput
                  icon="user"
                  placeholder="Email or Phone Number"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />
                <View style={{ height: 14 }} />
                <AnimatedInput
                  icon="lock"
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  rightIcon={showPassword ? 'eye' : 'eye-off'}
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />

                {error ? (
                  <View style={styles.errorRow}>
                    <Feather name="alert-circle" size={14} color="#EF4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                ) : null}

                {/* Remember me & Forgot password */}
                <View style={styles.optionsRow}>
                  <Pressable onPress={() => setRememberMe(!rememberMe)} style={styles.rememberRow}>
                    <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                      {rememberMe && <Feather name="check" size={12} color="#FFF" />}
                    </View>
                    <Text style={styles.rememberText}>Remember me</Text>
                  </Pressable>
                  <Pressable>
                    <Text style={styles.forgotText}>Forgot password?</Text>
                  </Pressable>
                </View>

                {/* Login Button */}
                <PressableButton
                  label="Login"
                  onPress={sendCode}
                  loading={loading}
                  icon="arrow-right"
                />

                {/* Divider */}
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* Social Buttons */}
                <PressableButton
                  label="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="secondary"
                  icon="G"
                />
                <View style={{ height: 12 }} />
                <PressableButton
                  label="Continue with Apple"
                  onPress={handleAppleSignIn}
                  variant="secondary"
                  icon=""
                />

                {/* Sign Up */}
                <View style={styles.signUpRow}>
                  <Text style={styles.signUpPrompt}>Don't have an account? </Text>
                  <Pressable>
                    <Text style={styles.signUpLink}>Sign Up</Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FFFE' },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  content: { paddingHorizontal: 28 },

  brandSection: { alignItems: 'center', paddingTop: 32, marginBottom: 28 },
  logoWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(11,155,106,0.08)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 16, elevation: 6,
  },
  brandTitle: { fontSize: 30, fontWeight: '800', color: '#0F2B24', letterSpacing: -0.5, marginBottom: 4 },
  taglineRow: { flexDirection: 'row', alignItems: 'center' },
  taglineText: { fontSize: 13, color: '#4A7A6A', fontWeight: '500' },
  taglineBullet: { fontSize: 13, color: '#0B9B6A', fontWeight: '700' },

  welcomeSection: { marginBottom: 28 },
  welcomeTitle: { fontSize: 26, fontWeight: '800', color: '#0F2B24', marginBottom: 8 },
  welcomeSubtitle: { fontSize: 15, color: '#5A8A7A', lineHeight: 23 },

  formSection: {},

  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1.5,
    overflow: 'hidden', height: 52,
  },
  inputIconWrap: { paddingLeft: 16, paddingRight: 10 },
  inputField: { flex: 1, height: 52, fontSize: 15, color: '#0F2B24', paddingVertical: 0 },
  inputRightIcon: { paddingRight: 16, paddingLeft: 8, height: 52, justifyContent: 'center' },

  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, paddingHorizontal: 4 },
  errorText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },

  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 20 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5,
    borderColor: '#0B9B6A', justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxActive: { backgroundColor: '#0B9B6A', borderColor: '#0B9B6A' },
  rememberText: { fontSize: 14, color: '#4A7A6A', fontWeight: '500' },
  forgotText: { fontSize: 14, color: '#0B9B6A', fontWeight: '600' },

  primaryBtn: {
    borderRadius: 14, height: 54, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#0B9B6A', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#FFF' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2EBE8' },
  dividerText: { fontSize: 14, color: '#94A3B8', fontWeight: '500' },

  secondaryBtn: {
    borderRadius: 14, height: 54, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E2EBE8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 10,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '600', color: '#0F2B24' },
  socialIcon: { fontSize: 20, fontWeight: '700', color: '#0F2B24' },

  signUpRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 24 },
  signUpPrompt: { fontSize: 14, color: '#64748B' },
  signUpLink: { fontSize: 14, color: '#0B9B6A', fontWeight: '700' },
});