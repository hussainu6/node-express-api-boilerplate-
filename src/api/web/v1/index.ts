import { Router } from 'express';
import { rateLimitMiddleware } from '../../../common/middlewares';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import usersRoutes from './routes/users.routes';

const router = Router();

router.use(rateLimitMiddleware('web'));
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/users', usersRoutes);

export default router;
