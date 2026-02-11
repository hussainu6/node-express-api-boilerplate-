import { Router } from 'express';
import { validate } from '../../../../common/middlewares';
import { z } from 'zod';
import { emailSchema, passwordSchema } from '../../../../common/validators';
import * as authController from '../controllers/auth.controller';

const router = Router();

const registerSchema = {
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(1).max(120).optional(),
  }),
};

const loginSchema = {
  body: z.object({
    email: emailSchema,
    password: z.string().min(1),
  }),
};

const refreshSchema = {
  body: z.object({
    refreshToken: z.string().min(1),
  }),
};

router.post('/register', validate(registerSchema), authController.registerHandler);
router.post('/login', validate(loginSchema), authController.loginHandler);
router.post('/refresh', validate(refreshSchema), authController.refreshHandler);
router.post('/logout', authController.logoutHandler);

export default router;
