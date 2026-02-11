import type { Request, Response } from 'express';
import { listUsers } from '../../../../modules/user';
import { sendSuccess } from '../../../../common/utils/response';
import { defaultPagination } from '../../../../common/types';

export async function listUsersHandler(req: Request, res: Response): Promise<void> {
  const { page = defaultPagination.page, limit = defaultPagination.limit } = req.query as {
    page?: number;
    limit?: number;
  };
  const { users, total } = await listUsers(page, limit);
  const totalPages = Math.ceil(total / limit);
  sendSuccess(res, { users }, 'Users retrieved', {
    requestId: req.requestId,
    pagination: { page, limit, total, totalPages },
  });
}
