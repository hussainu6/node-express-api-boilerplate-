import type Redis from 'ioredis';

const RATE_PREFIX = 'ratelimit:';

export function rateLimitKey(api: string, identifier: string): string {
  return `${RATE_PREFIX}${api}:${identifier}`;
}

/**
 * Sliding window style: increment key and set TTL on first use.
 * Returns { current, ttl }.
 */
export async function incrementRateLimit(
  redis: Redis,
  key: string,
  windowMs: number
): Promise<{ current: number; ttl: number }> {
  const windowSec = Math.ceil(windowMs / 1000);
  const multi = redis.multi();
  multi.incr(key);
  multi.ttl(key);
  const results = await multi.exec();
  const incrResult = results?.[0]?.[1];
  const ttlResult = results?.[1]?.[1];
  const current = typeof incrResult === 'number' ? incrResult : 1;
  const ttl = typeof ttlResult === 'number' && ttlResult > 0 ? ttlResult : 0;
  if (ttl <= 0) {
    await redis.expire(key, windowSec);
  }
  return { current, ttl: ttl > 0 ? ttl : windowSec };
}
