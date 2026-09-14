import { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { supabase } from './lib/supabase';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? `Error: ${error.message}` : 'Signed up! Check your email if confirmation is required.');
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }
    setMessage(`Signed in! Token: ${data.session?.access_token.slice(0, 20)}...`);
    console.log('FULL ACCESS TOKEN:', data.session?.access_token);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AirSentinel Auth Test</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Sign Up" onPress={signUp} />
      <View style={{ height: 10 }} />
      <Button title="Sign In" onPress={signIn} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  message: { marginTop: 20, textAlign: 'center' },
});