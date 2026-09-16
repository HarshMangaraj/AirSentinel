import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SignInScreen } from '../screens/SignInScreen';
import { VerifyOtpScreen } from '../screens/VerifyOtpScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ReportScreen } from '../screens/ReportScreen';

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
                        <Stack.Screen name="Home" component={HomeScreen} />
                        <Stack.Screen name="Report" component={ReportScreen} options={{ presentation: 'modal' }} />
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