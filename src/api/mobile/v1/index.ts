import { Router } from 'express';
import { rateLimitMiddleware } from '../../../common/middlewares';
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';

const router = Router();

router.use(rateLimitMiddleware('mobile'));
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);

export default router;
