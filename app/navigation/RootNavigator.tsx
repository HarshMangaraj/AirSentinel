import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SignInScreen } from '../screens/SignInScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';
import { EventDetailsScreen } from '../screens/EventDetailsScreen';
import { ReportStatusScreen } from '../screens/ReportStatusScreen';
import { HealthSafetyScreen } from '../screens/HealthSafetyScreen';
import { MainTabs } from './MainTabs';
import { HotspotDetailScreen } from '../screens/HotspotDetailScreen';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { session, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.paper }}>
        <ActivityIndicator color={colors.signal} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="ReportStatus" component={ReportStatusScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="HealthSafety" component={HealthSafetyScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="HotspotDetail" component={HotspotDetailScreen} options={{ presentation: 'modal' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}