import type Redis from 'ioredis';
import jwt from 'jsonwebtoken';

const BLACKLIST_PREFIX = 'blacklist:';

export async function addAccessTokenToBlacklist(
  redis: Redis,
  token: string,
  ttlSeconds: number
): Promise<void> {
  try {
    const decoded = jwt.decode(token) as { jti?: string; exp?: number } | null;
    if (decoded?.jti) {
      const key = `${BLACKLIST_PREFIX}${decoded.jti}`;
      const remaining = decoded.exp
        ? Math.max(0, decoded.exp - Math.floor(Date.now() / 1000))
        : ttlSeconds;
      await redis.set(key, '1', 'EX', Math.min(remaining, 900)); // cap 15 min
    }
  } catch {
    // ignore
  }
}

export async function isAccessTokenBlacklisted(redis: Redis, token: string): Promise<boolean> {
  try {
    const decoded = jwt.decode(token) as { jti?: string } | null;
    if (decoded?.jti) {
      const key = `${BLACKLIST_PREFIX}${decoded.jti}`;
      const v = await redis.get(key);
      return v === '1';
    }
  } catch {
    // ignore
  }
  return false;
}
