import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://axotonxklayqedvzzbzp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZB0zWamRnI51pFDOXWczdg_8RKBiT5R';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});