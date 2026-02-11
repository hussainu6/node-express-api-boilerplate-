import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import { config } from './config';
import { createRedis } from './cache';
import { requestIdMiddleware, errorHandler } from './common/middlewares';
import { setupSwagger } from './docs/swagger';
import healthRouter from './health';
import webV1 from './api/web/v1';
import mobileV1 from './api/mobile/v1';

const app = express();

createRedis();

app.use(helmet());
app.use(hpp());
app.use(
  cors({
    origin: config.CORS_ORIGINS === '*' ? true : config.CORS_ORIGINS,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(requestIdMiddleware);

app.use('/health', healthRouter);

const prefix = config.API_PREFIX || '/api';
app.use(`${prefix}/web/v1`, webV1);
app.use(`${prefix}/mobile/v1`, mobileV1);

setupSwagger(app, `${prefix}/docs`);

app.use(errorHandler);

export default app;
