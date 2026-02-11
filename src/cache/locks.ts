import type Redis from 'ioredis';

const LOCK_PREFIX = 'lock:';
const DEFAULT_TTL = 10;

export function lockKey(resource: string): string {
  return `${LOCK_PREFIX}${resource}`;
}

export async function acquireLock(
  redis: Redis,
  resource: string,
  ttlSeconds: number = DEFAULT_TTL
): Promise<boolean> {
  const key = lockKey(resource);
  const result = await redis.set(key, '1', 'EX', ttlSeconds, 'NX');
  return result === 'OK';
}

export async function releaseLock(redis: Redis, resource: string): Promise<void> {
  const key = lockKey(resource);
  await redis.del(key);
}
