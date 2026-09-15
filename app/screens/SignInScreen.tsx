import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { type as typeScale, spacing } from '../theme/tokens';

export function SignInScreen({ navigation }: any) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <Screen style={styles.container}>
      <Text style={[typeScale.hero, { color: colors.ink }]}>AirSentinel</Text>
      <Text style={[typeScale.body, { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        Enter your email and we'll send you a one-time code to sign in.
      </Text>
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={error}
      />
      <Button label="Send code" onPress={sendCode} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
});