import type { Response } from 'express';
import type { ApiResponse, ApiMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message: string = 'Success',
  meta?: ApiMeta,
  statusCode: number = 200
): void {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && Object.keys(meta).length > 0 && { meta }),
  };
  res.status(statusCode).json(body);
}
