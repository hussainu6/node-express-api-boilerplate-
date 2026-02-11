import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../../cache/client';
import { rateLimitKey, incrementRateLimit } from '../../cache/rateLimit';
import { AppError, ErrorCode } from '../errors';
import { config } from '../../config';

export type RateLimitContext = 'web' | 'mobile';

function getLimitConfig(context: RateLimitContext): { max: number; windowMs: number } {
  if (context === 'mobile') {
    return {
      max: config.RATE_LIMIT_MOBILE_MAX,
      windowMs: config.RATE_LIMIT_MOBILE_WINDOW_MS,
    };
  }
  return {
    max: config.RATE_LIMIT_WEB_MAX,
    windowMs: config.RATE_LIMIT_WEB_WINDOW_MS,
  };
}

export function rateLimitMiddleware(context: RateLimitContext) {
  const { max, windowMs } = getLimitConfig(context);

  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const redis = getRedis();
    const identifier = req.user?.id ?? req.ip ?? req.socket.remoteAddress ?? 'anonymous';
    const key = rateLimitKey(context, identifier);

    if (redis) {
      try {
        const { current } = await incrementRateLimit(redis, key, windowMs);
        if (current > max) {
          next(new AppError(ErrorCode.TOO_MANY_REQUESTS, 'Too many requests', 429));
          return;
        }
      } catch {
        // On Redis failure, allow request (fail open)
      }
    }
    next();
  };
}
