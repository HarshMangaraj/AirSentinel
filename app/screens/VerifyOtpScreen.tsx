import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { type as typeScale, spacing } from '../theme/tokens';

export function VerifyOtpScreen({ route }: any) {
  const { colors } = useTheme();
  const { email } = route.params;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function verify() {
    setError('');
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    setLoading(false);
    if (error) {
      setError(error.message);
    }
  }

  return (
    <Screen style={styles.container}>
      <Text style={[typeScale.title, { color: colors.ink }]}>Check your email</Text>
      <Text style={[typeScale.body, { color: colors.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
        We sent a 6-digit code to {email}.
      </Text>
      <TextField
        label="Verification code"
        keyboardType="number-pad"
        maxLength={6}
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
});