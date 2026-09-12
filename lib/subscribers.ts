import { getSupabase, supabaseStorageError } from './supabase';

export type Subscriber = { email: string; subscribedAt: string };

export async function addSubscriber(email: string): Promise<{ subscriber: Subscriber; created: boolean }> {
  const normalized = email.trim().toLowerCase();
  const subscriber: Subscriber = { email: normalized, subscribedAt: new Date().toISOString() };

  const supabase = getSupabase();
  if (!supabase) throw supabaseStorageError();

  const { data: existing } = await supabase
    .from('subscribers')
    .select('*')
    .eq('email', normalized)
    .maybeSingle();

  if (existing) {
    return {
      subscriber: { email: existing.email, subscribedAt: existing.subscribed_at },
      created: false,
    };
  }

  const { error } = await supabase.from('subscribers').insert({
    email: normalized,
    subscribed_at: subscriber.subscribedAt,
  });
  if (error) throw new Error(error.message);
  return { subscriber, created: true };
}

