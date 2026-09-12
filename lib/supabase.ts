import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL;

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_KEY;

const defaultKey = supabaseServiceKey || supabaseAnonKey;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbClient: SupabaseClient<any, 'public', any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authClient: SupabaseClient<any, 'public', any> | null = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let adminClient: SupabaseClient<any, 'public', any> | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && defaultKey);
}

export function getSupabaseConfig() {
  return {
    url: supabaseUrl || null,
    hasKey: Boolean(defaultKey),
    hasAnonKey: Boolean(supabaseAnonKey),
    hasServiceKey: Boolean(supabaseServiceKey),
    isConfigured: isSupabaseConfigured(),
  };
}

// Database client (uses service role key if available to bypass RLS, otherwise anon key)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabase(): SupabaseClient<any, 'public', any> | null {
  if (!supabaseUrl || !defaultKey) return null;
  if (!dbClient) {
    dbClient = createClient(supabaseUrl, defaultKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return dbClient;
}

// Client-facing Supabase Auth client (uses anon key so confirmation emails are dispatched)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAuthClient(): SupabaseClient<any, 'public', any> | null {
  const key = supabaseAnonKey || supabaseServiceKey;
  if (!supabaseUrl || !key) return null;
  if (!authClient) {
    authClient = createClient(supabaseUrl, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return authClient;
}

// Admin Supabase Auth client (uses service role key for admin user management)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getSupabaseAdmin(): SupabaseClient<any, 'public', any> | null {
  if (!supabaseUrl || !supabaseServiceKey) return null;
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return adminClient;
}

export function supabaseStorageError(): Error {
  return new Error(
    'Supabase storage is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your environment variables, then restart or redeploy.'
  );
}

