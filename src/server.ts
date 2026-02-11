import 'dotenv/config';
import app from './app';
import { config } from './config';
import { logger } from './common/logger';
import { closeRedis } from './cache';
import { startEmailWorker } from './jobs';

const port = config.PORT;

const emailWorker = startEmailWorker();

const server = app.listen(port, () => {
  logger.info({ port, env: config.NODE_ENV }, 'Server started');
});

function gracefulShutdown(signal: string): void {
  logger.info({ signal }, 'Shutting down');
  server.close(() => {
    Promise.all([emailWorker.close(), closeRedis()])
      .then(() => {
        logger.info('Shutdown complete');
        process.exit(0);
      })
      .catch((err) => {
        logger.error({ err }, 'Error during shutdown');
        process.exit(1);
      });
  });
  setTimeout(() => {
    logger.warn('Forced shutdown');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
