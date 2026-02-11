import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, validate } from '../../../../common/middlewares';
import { requirePermission } from '../../../../common/guards';
import * as profileController from '../controllers/profile.controller';

const router = Router();
const updateProfileSchema = {
  body: z.object({ name: z.string().max(120).optional() }),
};

router.use(requireAuth('web'));
router.get('/', profileController.getProfile);
router.patch(
  '/',
  requirePermission('profile:update'),
  validate(updateProfileSchema),
  profileController.updateProfileHandler
);

export default router;
