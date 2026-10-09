import { createHmac, randomBytes } from 'node:crypto';

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}
export interface RateLimiter {
  check(clientAddress: string): RateLimitDecision;
}

/** Bounded, per-process protection. API Gateway applies the shared production throttle. */
export function createRateLimiter(options: {
  max: number;
  windowMs: number;
  maxKeys: number;
  now?: () => number;
}): RateLimiter {
  const now = options.now || Date.now;
  const salt = randomBytes(32);
  const buckets = new Map<string, { count: number; expiresAt: number }>();
  return {
    check(clientAddress) {
      const timestamp = now();
      // Expiry is time-based, never LRU eviction that could reset an attacker's allowance.
      for (const [key, value] of buckets) if (value.expiresAt <= timestamp) buckets.delete(key);
      const key = createHmac('sha256', salt)
        .update(clientAddress || 'unknown')
        .digest('hex');
      const existing = buckets.get(key);
      if (existing) {
        const retryAfterSeconds = Math.max(1, Math.ceil((existing.expiresAt - timestamp) / 1_000));
        if (existing.count >= options.max) return { allowed: false, retryAfterSeconds };
        existing.count += 1;
        return { allowed: true, retryAfterSeconds: 0 };
      }
      if (buckets.size >= options.maxKeys) {
        return {
          allowed: false,
          retryAfterSeconds: Math.max(1, Math.ceil(options.windowMs / 1_000)),
        };
      }
      buckets.set(key, { count: 1, expiresAt: timestamp + options.windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    },
  };
}
