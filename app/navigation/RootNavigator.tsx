import { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { SignInScreen } from '../screens/SignInScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { ReportStatusScreen } from '../screens/ReportStatusScreen';
import { HealthSafetyScreen } from '../screens/HealthSafetyScreen';
import { MainTabs } from './MainTabs';
import { HotspotDetailScreen } from '../screens/HotspotDetailScreen';
import { SplashScreen, LoadingScreen } from '../components/SplashScreenUI';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { session, loading, profile, profileLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (loading || (session && profileLoading)) return <LoadingScreen />;

  // Logged in but no profile set up yet → go to setup
  const needsSetup = session && !profile;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!session ? (
          // ── AUTH FLOW ──────────────────────────────────────────
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          </>
        ) : needsSetup ? (
          // ── PROFILE SETUP FLOW ─────────────────────────────────
          <>
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          // ── MAIN APP ───────────────────────────────────────────
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="ReportStatus" component={ReportStatusScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="HealthSafety" component={HealthSafetyScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="HotspotDetail" component={HotspotDetailScreen} options={{ presentation: 'modal' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}