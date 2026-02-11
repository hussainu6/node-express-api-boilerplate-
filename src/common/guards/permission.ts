import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors';

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401));
      return;
    }
    const isAdmin = req.user.permissions.includes('*') || req.user.roleName === 'ADMIN';
    const hasPermission = req.user.permissions.includes(permission);
    if (isAdmin || hasPermission) {
      next();
      return;
    }
    next(new AppError(ErrorCode.FORBIDDEN, 'Insufficient permissions', 403));
  };
}
