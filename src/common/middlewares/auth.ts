import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { AppError, ErrorCode } from '../errors';
import type { AuthUser } from '../types/express';
import { getRedis } from '../../cache/client';
import { isAccessTokenBlacklisted } from '../../cache/blacklist';

const JWT_SECRET = config.JWT_SECRET;

export type ApiContext = 'web' | 'mobile';

export function requireAuth(_context: ApiContext = 'web') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
        return;
      }

      const redis = getRedis();
      if (redis) {
        const blacklisted = await isAccessTokenBlacklisted(redis, token);
        if (blacklisted) {
          next(new AppError(ErrorCode.UNAUTHORIZED, 'Token revoked', 401));
          return;
        }
      }

      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
        sub: string;
        email: string;
        roleId: string;
        permissions?: string[];
        roleName?: string;
      };

      req.jwtPayload = decoded;
      req.user = {
        id: decoded.sub,
        email: decoded.email,
        roleId: decoded.roleId,
        roleName: decoded.roleName ?? 'USER',
        permissions: decoded.permissions ?? [],
      } as AuthUser;
      next();
    } catch {
      next(new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired token', 401));
    }
  };
}
