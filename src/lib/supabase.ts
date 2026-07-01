// src/lib/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';
import type { Database } from '../types/database';

// ⭐ ENV CHECK — this tells us if .env is loading correctly
console.log(
  "ENV CHECK:",
  SUPABASE_URL,
  SUPABASE_ANON_KEY ? "KEY OK" : "NO KEY"
);

// ⭐ Hard fail if env variables are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY. Your .env file is not loading.'
  );
}

// ⭐ Create the Supabase client
export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
