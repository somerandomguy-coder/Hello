import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Support both new Supabase "Publishable Key" and legacy "Anon Key" naming
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabasePublishableKey &&
  (supabaseUrl.includes('supabase.co') || supabaseUrl.includes('localhost') || supabaseUrl.includes('127.0.0.1')) &&
  supabasePublishableKey.length > 15
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey)
  : null;
