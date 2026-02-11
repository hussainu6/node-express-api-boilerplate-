import { Request, Response, NextFunction } from 'express';
import { isAppError } from '../errors';
import { logger } from '../logger';
import { config } from '../../config';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId;

  if (isAppError(err)) {
    logger.warn({ err: err.message, code: err.code, requestId });
    const body: Record<string, unknown> = {
      success: false,
      message: err.message,
      ...(requestId && { meta: { requestId } }),
    };
    if (err.details !== undefined && typeof err.details === 'object') {
      body.errors = err.details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  logger.error({ err, requestId });
  res.status(500).json({
    success: false,
    message: config.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message,
    ...(requestId && { meta: { requestId } }),
    ...(config.NODE_ENV !== 'production' && err instanceof Error && { stack: err.stack }),
  });
}
