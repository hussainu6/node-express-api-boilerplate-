import jwt, { type SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config';

export type TokenContext = 'web' | 'mobile';

const expiresIn = {
  access: {
    web: config.JWT_ACCESS_WEB_EXPIRES_IN,
    mobile: config.JWT_ACCESS_MOBILE_EXPIRES_IN,
  },
  refresh: {
    web: config.JWT_REFRESH_WEB_EXPIRES_IN,
    mobile: config.JWT_REFRESH_MOBILE_EXPIRES_IN,
  },
};

export interface TokenPayload {
  sub: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  jti?: string;
  type: 'access' | 'refresh';
}

export function signAccessToken(
  payload: Omit<TokenPayload, 'type' | 'jti'>,
  context: TokenContext
): string {
  const jti = uuidv4();
  return jwt.sign(
    {
      ...payload,
      type: 'access',
      jti,
    },
    config.JWT_SECRET,
    { expiresIn: expiresIn.access[context] } as SignOptions
  );
}

export function signRefreshToken(
  payload: Omit<TokenPayload, 'type' | 'jti'>,
  context: TokenContext
): { token: string; jti: string; expiresIn: string } {
  const jti = uuidv4();
  const exp = expiresIn.refresh[context];
  const token = jwt.sign(
    {
      ...payload,
      type: 'refresh',
      jti,
    },
    config.JWT_SECRET,
    { expiresIn: exp } as SignOptions
  );
  return { token, jti, expiresIn: exp };
}

export function getRefreshTokenTtlSeconds(context: TokenContext): number {
  const exp = expiresIn.refresh[context];
  // simple parse: 7d -> 7*24*3600, 30d -> 30*24*3600
  const match = exp.match(/^(\d+)([dm])$/);
  if (!match) return 7 * 24 * 3600;
  const n = parseInt(match[1], 10);
  if (match[2] === 'd') return n * 24 * 3600;
  return n * 60; // m
}
