import { Queue, Worker } from 'bullmq';
import { config } from '../config';
import { logger } from '../common/logger';

const connection = {
  host: new URL(config.REDIS_URL).hostname,
  port: parseInt(new URL(config.REDIS_URL).port || '6379', 10),
};

const queueName = 'email';

export const emailQueue = new Queue(queueName, {
  connection,
  prefix: config.REDIS_KEY_PREFIX,
});

export interface EmailJobData {
  to: string;
  subject: string;
  body: string;
}

export async function addEmailJob(data: EmailJobData): Promise<void> {
  await emailQueue.add('send', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
}

export function startEmailWorker(): Worker<EmailJobData> {
  const worker = new Worker<EmailJobData>(
    queueName,
    async (job) => {
      const { to, subject } = job.data;
      logger.info({ to, subject, jobId: job.id }, 'Email job (mock send)');
      // In production: use nodemailer, SendGrid, etc.
      return { sent: true, to, subject };
    },
    { connection, prefix: config.REDIS_KEY_PREFIX }
  );
  worker.on('failed', (job, err) => {
    logger.warn({ jobId: job?.id, err: err.message }, 'Email job failed');
  });
  return worker;
}
