import type { Request, Response } from 'express';
import { findById, updateProfile } from '../../../../modules/user';
import { AppError, ErrorCode } from '../../../../common/errors';
import { sendSuccess } from '../../../../common/utils/response';

export async function getProfile(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
  const user = await findById(userId);
  if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
  sendSuccess(
    res,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      roleName: user.roleName,
      createdAt: user.createdAt,
    },
    'Profile retrieved'
  );
}

export async function updateProfileHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  if (!userId) throw new AppError(ErrorCode.UNAUTHORIZED, 'Unauthorized', 401);
  const { name } = req.body;
  const user = await updateProfile(userId, { name });
  if (!user) throw new AppError(ErrorCode.NOT_FOUND, 'User not found', 404);
  sendSuccess(
    res,
    {
      id: user.id,
      email: user.email,
      name: user.name,
      roleName: user.roleName,
      createdAt: user.createdAt,
    },
    'Profile updated'
  );
}
