import type { Request, Response } from 'express';
import { register, login, refresh as doRefresh, logout } from '../../../../modules/auth';
import { sendSuccess } from '../../../../common/utils/response';

export async function registerHandler(req: Request, res: Response): Promise<void> {
  const { email, password, name } = req.body;
  const result = await register({ email, password, name }, 'web');
  sendSuccess(res, result, 'Registered successfully', undefined, 201);
}

export async function loginHandler(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  const result = await login(email, password, 'web');
  sendSuccess(res, result, 'Logged in');
}

export async function refreshHandler(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  const result = await doRefresh({ refreshToken, context: 'web' });
  sendSuccess(res, result, 'Token refreshed');
}

export async function logoutHandler(req: Request, res: Response): Promise<void> {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') ?? null;
  await logout(token);
  sendSuccess(res, null, 'Logged out');
}
