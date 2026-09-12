import { getSupabase } from './supabase';

type LimitResult = { ok: boolean; retryAfter: number };

const localLimits = new Map<string, { count: number; resetAt: number }>();

function clientIdentifier(request: Request, identity?: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return identity ? `${identity}:${ip}` : ip;
}

/**
 * Lightweight fixed-window rate limiter.
 * Backed by Supabase in production, with an in-memory fallback for local development.
 */
export async function rateLimit(
  request: Request,
  scope: string,
  limit: number,
  windowSeconds: number,
  identity?: string
): Promise<LimitResult> {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `hum-medicals:rate:${scope}:${clientIdentifier(request, identity)}:${bucket}`;
  const now = Date.now();
  const resetAt = (bucket + 1) * windowSeconds * 1000;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data: current } = await supabase.from('rate_limits').select('*').eq('key', key).maybeSingle();
      if (!current) {
        await supabase.from('rate_limits').insert({ key, count: 1, reset_at: resetAt });
        return { ok: true, retryAfter: windowSeconds };
      }
      const nextCount = current.count + 1;
      await supabase.from('rate_limits').update({ count: nextCount }).eq('key', key);
      return {
        ok: nextCount <= limit,
        retryAfter: Math.max(1, Math.ceil((resetAt - now) / 1000)),
      };
    } catch {
      // Fallback to local limits if DB rate limiting encounters a transient issue
    }
  }

  const current = localLimits.get(key);
  if (!current || current.resetAt <= now) {
    localLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfter: windowSeconds };
  }
  current.count += 1;
  return {
    ok: current.count <= limit,
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({ message: 'Too many requests. Please wait a moment and try again.' }),
    {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
    }
  );
}
