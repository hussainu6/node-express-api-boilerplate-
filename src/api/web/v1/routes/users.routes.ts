import { Router } from 'express';
import { validate, requireAuth } from '../../../../common/middlewares';
import { paginationSchema } from '../../../../common/validators';
import { requirePermission } from '../../../../common/guards';
import * as usersController from '../controllers/users.controller';

const router = Router();

router.use(requireAuth('web'));
router.use(requirePermission('user:read'));
router.get('/', validate({ query: paginationSchema }), usersController.listUsersHandler);

export default router;
