import type Redis from 'ioredis';
import { config } from '../config';

const OTP_PREFIX = 'otp:';
const TTL = config.OTP_TTL_SECONDS;

export function otpKey(phoneOrEmail: string, usage: string): string {
  return `${OTP_PREFIX}${phoneOrEmail}:${usage}`;
}

export async function setOtp(
  redis: Redis,
  phoneOrEmail: string,
  usage: string,
  code: string
): Promise<void> {
  const key = otpKey(phoneOrEmail, usage);
  await redis.set(key, code, 'EX', TTL);
}

export async function getOtp(
  redis: Redis,
  phoneOrEmail: string,
  usage: string
): Promise<string | null> {
  const key = otpKey(phoneOrEmail, usage);
  return redis.get(key);
}

export async function deleteOtp(redis: Redis, phoneOrEmail: string, usage: string): Promise<void> {
  const key = otpKey(phoneOrEmail, usage);
  await redis.del(key);
}

export async function verifyOtp(
  redis: Redis,
  phoneOrEmail: string,
  usage: string,
  code: string
): Promise<boolean> {
  const stored = await getOtp(redis, phoneOrEmail, usage);
  const ok = stored === code;
  if (ok) await deleteOtp(redis, phoneOrEmail, usage);
  return ok;
}
