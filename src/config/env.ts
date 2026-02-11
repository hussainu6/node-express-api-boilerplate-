import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),
  API_PREFIX: z.string().default('/api'),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_KEY_PREFIX: z.string().default('app:'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_WEB_EXPIRES_IN: z.string().default('15m'),
  JWT_ACCESS_MOBILE_EXPIRES_IN: z.string().default('10m'),
  JWT_REFRESH_WEB_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_MOBILE_EXPIRES_IN: z.string().default('30d'),

  CORS_ORIGINS: z
    .string()
    .default('*')
    .transform((s) => (s === '*' ? '*' : s.split(',').map((o) => o.trim()))),

  RATE_LIMIT_WEB_MAX: z.coerce.number().positive().default(300),
  RATE_LIMIT_WEB_WINDOW_MS: z.coerce.number().positive().default(900000),
  RATE_LIMIT_MOBILE_MAX: z.coerce.number().positive().default(100),
  RATE_LIMIT_MOBILE_WINDOW_MS: z.coerce.number().positive().default(900000),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  OTP_TTL_SECONDS: z.coerce.number().positive().default(600),

  APP_NAME: z.string().default('backend-boilerplate'),
  APP_VERSION: z.string().default('1.0.0'),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const details = Object.entries(msg)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
      .join('; ');
    throw new Error(`Invalid environment: ${details}`);
  }
  return parsed.data;
}

export const config = loadEnv();
