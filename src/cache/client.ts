import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../common/logger';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  return redis;
}

export function createRedis(): Redis {
  if (redis) return redis;
  const keyPrefix = config.REDIS_KEY_PREFIX;
  redis = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
    keyPrefix: keyPrefix.endsWith(':') ? keyPrefix : `${keyPrefix}:`,
  });
  redis.on('error', (err) => logger.warn({ err: err.message }, 'Redis error'));
  redis.on('connect', () => logger.debug('Redis connected'));
  return redis;
}

export function closeRedis(): Promise<void> {
  if (!redis) return Promise.resolve();
  const r = redis;
  redis = null;
  return r.quit().then(() => undefined);
}

export function prefixKey(key: string): string {
  const p = config.REDIS_KEY_PREFIX;
  return p.endsWith(':') ? `${p}${key}` : `${p}:${key}`;
}
