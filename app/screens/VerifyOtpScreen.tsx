import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { colors, type, spacing } from '../theme/tokens';

export function VerifyOtpScreen({ route }: any) {
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function verify() {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Successful verification triggers onAuthStateChange in AuthContext,
    // which automatically routes into the app — no manual navigation needed here.
  }

  return (
    <Screen style={styles.container}>
      <Text style={type.title}>Check your email</Text>
      <Text style={[type.body, styles.subtitle]}>
        We sent a 6-digit code to {email}.
      </Text>
      <TextField
        label="Verification code"
        keyboardType="number-pad"
        maxLength={8}
        value={code}
        onChangeText={setCode}
        error={error}
      />
      <Button label="Verify" onPress={verify} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center' },
  subtitle: { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xl },
});