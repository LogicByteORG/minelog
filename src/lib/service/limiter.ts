const WINDOW_MS = 60_000;
const MAX_KEYS = 10_000;

const counts = new Map<string, { count: number; resetAt: number }>();

export type Hit = { ok: true } | { ok: false; retryAfter: number };

export function takeHit(key: string, limit: number, now = Date.now()): Hit {
  if (counts.size >= MAX_KEYS) {
    for (const [stale, entry] of counts) {
      if (entry.resetAt <= now) counts.delete(stale);
    }
    if (counts.size >= MAX_KEYS) counts.delete(counts.keys().next().value!);
  }

  const entry = counts.get(key);
  if (!entry || entry.resetAt <= now) {
    counts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (entry.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  entry.count += 1;
  return { ok: true };
}

