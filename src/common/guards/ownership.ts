import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors';

/**
 * Require that the authenticated user owns the resource.
 * Compare req.user.id with the resource owner id from req.params or req.body.
 * ADMIN (or role with *) bypasses the check.
 */
export function requireOwnership(getOwnerId: (req: Request) => string | undefined) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
      return;
    }
    const isAdmin = req.user.permissions.includes('*') || req.user.roleName === 'ADMIN';
    if (isAdmin) {
      next();
      return;
    }
    const ownerId = getOwnerId(req);
    if (ownerId === undefined) {
      next(new AppError(ErrorCode.FORBIDDEN, 'Resource owner could not be determined', 403));
      return;
    }
    if (req.user.id !== ownerId) {
      next(new AppError(ErrorCode.FORBIDDEN, 'Access denied to this resource', 403));
      return;
    }
    next();
  };
}
