import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { getRedis } from '../cache';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const checks: Record<string, string> = {
    app: 'ok',
    env: config.NODE_ENV,
    version: config.APP_VERSION,
  };

  try {
    await prisma.$connect();
    checks.mongodb = 'ok';
  } catch {
    checks.mongodb = 'error';
  }

  try {
    const redis = getRedis();
    if (redis) {
      await redis.ping();
      checks.redis = 'ok';
    } else {
      checks.redis = 'not_connected';
    }
  } catch {
    checks.redis = 'error';
  }

  const ok = checks.mongodb === 'ok' && (checks.redis === 'ok' || checks.redis === 'not_connected');
  res.status(ok ? 200 : 503).json({
    success: ok,
    message: ok ? 'Healthy' : 'Unhealthy',
    data: checks,
  });
});

export default router;
