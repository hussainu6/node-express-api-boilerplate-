import type Redis from 'ioredis';

const REFRESH_PREFIX = 'refresh:';

export function refreshKey(userId: string, tokenId: string): string {
  return `${REFRESH_PREFIX}${userId}:${tokenId}`;
}

export async function setRefreshToken(
  redis: Redis,
  userId: string,
  tokenId: string,
  ttlSeconds: number
): Promise<void> {
  const key = refreshKey(userId, tokenId);
  await redis.set(key, '1', 'EX', ttlSeconds);
}

export async function getRefreshToken(
  redis: Redis,
  userId: string,
  tokenId: string
): Promise<boolean> {
  const key = refreshKey(userId, tokenId);
  const v = await redis.get(key);
  return v === '1';
}

export async function deleteRefreshToken(
  redis: Redis,
  userId: string,
  tokenId: string
): Promise<void> {
  const key = refreshKey(userId, tokenId);
  await redis.del(key);
}

/** Single-use: get and delete in one. Returns true if token was present. */
export async function consumeRefreshToken(
  redis: Redis,
  userId: string,
  tokenId: string
): Promise<boolean> {
  const key = refreshKey(userId, tokenId);
  const script = `
    if redis.call("GET", KEYS[1]) == "1" then
      redis.call("DEL", KEYS[1])
      return 1
    end
    return 0
  `;
  const result = await redis.eval(script, 1, key);
  return result === 1;
}
