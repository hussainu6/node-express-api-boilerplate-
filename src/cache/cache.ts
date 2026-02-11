import type Redis from 'ioredis';

const CACHE_PREFIX = 'cache:';

export function cacheKey(apiKey: string, hash: string): string {
  return `${CACHE_PREFIX}${apiKey}:${hash}`;
}

export async function getCached<T>(redis: Redis, key: string): Promise<T | null> {
  const raw = await redis.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setCached(
  redis: Redis,
  key: string,
  value: unknown,
  ttlSeconds: number
): Promise<void> {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}
