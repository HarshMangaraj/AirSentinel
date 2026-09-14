import 'react-native-url-polyfill/auto';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://axotonxklayqedvzzbzp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZB0zWamRnI51pFDOXWczdg_8RKBiT5R';

// Supabase expects a storage adapter with get/set/remove.
// expo-secure-store encrypts values on-device (Keychain on iOS, Keystore on Android).
const SecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});