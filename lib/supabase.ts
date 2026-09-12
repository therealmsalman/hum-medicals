import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: SupabaseClient<any, 'public', any> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): SupabaseClient<any, 'public', any> | null {
  if (!supabaseUrl || !supabaseKey) return null;
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}

export function supabaseStorageError(): Error {
  return new Error(
    'Supabase storage is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment, then redeploy.'
  );
}
