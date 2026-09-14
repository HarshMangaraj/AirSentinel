import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from './context/AuthContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}