import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// The public website deliberately uses anonymous, column-limited access even
// when an administrator is signed in. Admin screens use client.ts instead.
export const publicSupabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'sevendevx-public' } },
);
