import fs from 'fs';
import path from 'path';
import { getSupabase, supabaseStorageError } from './supabase';

export type Subscriber = { email: string; subscribedAt: string };
const subscribersPath = path.join(process.cwd(), 'data', 'subscribers.json');
const isHosted = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL) || Boolean(process.env.CF_PAGES);

function readLocal(): Subscriber[] {
  try {
    return JSON.parse(fs.readFileSync(subscribersPath, 'utf8') || '[]') as Subscriber[];
  } catch {
    return [];
  }
}

function writeLocal(items: Subscriber[]) {
  try {
    fs.mkdirSync(path.dirname(subscribersPath), { recursive: true });
    fs.writeFileSync(subscribersPath, JSON.stringify(items, null, 2));
  } catch {
    // Ignore filesystem write errors in read-only hosted environments
  }
}

export async function addSubscriber(email: string): Promise<{ subscriber: Subscriber; created: boolean }> {
  const normalized = email.trim().toLowerCase();
  const subscriber: Subscriber = { email: normalized, subscribedAt: new Date().toISOString() };

  const supabase = getSupabase();
  if (supabase) {
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

  if (isHosted) throw supabaseStorageError();
  const items = readLocal();
  if (items.some((item) => item.email === normalized)) {
    return { subscriber: items.find((item) => item.email === normalized)!, created: false };
  }
  items.push(subscriber);
  writeLocal(items);
  return { subscriber, created: true };
}
