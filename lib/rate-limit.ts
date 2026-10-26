/*
 * Lightweight, stateless fixed-window rate limiter for the public lead form.
 * No external datastore — the in-memory map below protects against bursts on a
 * single instance. If you scale to many instances and need shared limits, swap
 * this for an edge KV (e.g. Vercel KV) without changing callers.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }
  bucket.count += 1;
  return { ok: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
}
