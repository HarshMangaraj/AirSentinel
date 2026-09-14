import { Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, type, spacing } from '../theme/tokens';

export function HomeScreen() {
  const { session, signOut } = useAuth();

  return (
    <Screen>
      <Text style={type.title}>You're in.</Text>
      <Text style={[type.body, styles.email]}>{session?.user.email}</Text>
      <Text style={[type.body, styles.note]}>
        This is where the live AQI map and city selector will live (Phase 4).
      </Text>
      <Button label="Sign out" onPress={signOut} variant="secondary" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  email: { color: colors.muted, marginTop: spacing.xs, marginBottom: spacing.lg },
  note: { color: colors.muted, marginBottom: spacing.xl },
});