import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { ProfilePhotoProvider } from './context/ProfilePhotoContext';
import { RootNavigator } from './navigation/RootNavigator';

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <ProfilePhotoProvider>
            <RootNavigator />
          </ProfilePhotoProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
}