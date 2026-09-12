import { Redis } from '@upstash/redis';

type LimitResult = { ok: boolean; retryAfter: number };

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;
const localLimits = new Map<string, { count: number; resetAt: number }>();

function clientIdentifier(request: Request, identity?: string) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const ip = forwarded || request.headers.get('x-real-ip') || 'unknown';
  return identity ? `${identity}:${ip}` : ip;
}

/**
 * Lightweight fixed-window limit. Upstash makes this durable in production;
 * the in-memory fallback is only for local development.
 */
export async function rateLimit(request: Request, scope: string, limit: number, windowSeconds: number, identity?: string): Promise<LimitResult> {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `hum-medicals:rate:${scope}:${clientIdentifier(request, identity)}:${bucket}`;
  if (redis) {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds);
    return { ok: count <= limit, retryAfter: windowSeconds };
  }
  const current = localLimits.get(key);
  const now = Date.now();
  if (!current || current.resetAt <= now) {
    localLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, retryAfter: windowSeconds };
  }
  current.count += 1;
  return { ok: current.count <= limit, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export function rateLimitResponse(retryAfter: number) {
  return new Response(JSON.stringify({ message: 'Too many requests. Please wait a moment and try again.' }), {
    status: 429,
    headers: { 'Content-Type': 'application/json', 'Retry-After': String(retryAfter) },
  });
}
