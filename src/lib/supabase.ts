import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabaseServerClient = () => {
  const headers: Record<string, string> = {};
  if (typeof window === 'undefined') {
    headers['x-bypass-key'] = 'margdarshak_secure_bypass_key_2026';
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers }
  });
};
