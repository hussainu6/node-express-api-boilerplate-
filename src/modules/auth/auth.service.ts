import bcrypt from 'bcrypt';
import {
  getRedis,
  setRefreshToken,
  consumeRefreshToken,
  addAccessTokenToBlacklist,
} from '../../cache';
import { getRoleByName } from '../role';
import { createUser, findByEmail } from '../user';
import { AppError, ErrorCode } from '../../common/errors';
import { signAccessToken, signRefreshToken, getRefreshTokenTtlSeconds } from './tokens';
import type { TokenContext } from './tokens';

const SALT_ROUNDS = 10;

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  roleName?: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  user: { id: string; email: string; name: string | null; roleName: string; permissions: string[] };
}

export async function register(input: RegisterInput, context: TokenContext): Promise<LoginResult> {
  const existing = await findByEmail(input.email);
  if (existing) {
    throw new AppError(ErrorCode.CONFLICT, 'Email already registered', 409);
  }
  const roleName = input.roleName ?? 'USER';
  const role = await getRoleByName(roleName);
  if (!role) {
    throw new AppError(ErrorCode.BAD_REQUEST, 'Invalid role', 400);
  }
  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await createUser(input.email, hashedPassword, role.id, input.name);

  const redis = getRedis();
  const accessToken = signAccessToken(
    {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    },
    context
  );
  const refresh = signRefreshToken(
    {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    },
    context
  );
  if (redis) {
    const ttl = getRefreshTokenTtlSeconds(context);
    await setRefreshToken(redis, user.id, refresh.jti, ttl);
  }

  return {
    accessToken,
    refreshToken: refresh.token,
    expiresIn: refresh.expiresIn,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roleName: user.roleName,
      permissions: user.permissions,
    },
  };
}

export async function login(
  email: string,
  password: string,
  context: TokenContext
): Promise<LoginResult> {
  const user = await findByEmail(email);
  if (!user) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid email or password', 401);
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid email or password', 401);
  }

  const accessToken = signAccessToken(
    {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    },
    context
  );
  const refresh = signRefreshToken(
    {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.roleName,
      permissions: user.permissions,
    },
    context
  );

  const redis = getRedis();
  if (redis) {
    const ttl = getRefreshTokenTtlSeconds(context);
    await setRefreshToken(redis, user.id, refresh.jti, ttl);
  }

  return {
    accessToken,
    refreshToken: refresh.token,
    expiresIn: refresh.expiresIn,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      roleName: user.roleName,
      permissions: user.permissions,
    },
  };
}

export interface RefreshInput {
  refreshToken: string;
  context: TokenContext;
}

export async function refresh(input: RefreshInput): Promise<LoginResult> {
  const jwt = await import('jsonwebtoken');
  const { config } = await import('../../config');
  let decoded: { sub?: string; email?: string; roleId?: string; jti?: string; type?: string };
  try {
    decoded = jwt.verify(input.refreshToken, config.JWT_SECRET) as typeof decoded;
  } catch {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid or expired refresh token', 401);
  }
  if (decoded.type !== 'refresh' || !decoded.sub || !decoded.jti) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Invalid refresh token', 401);
  }

  const redis = getRedis();
  if (redis) {
    const consumed = await consumeRefreshToken(redis, decoded.sub, decoded.jti);
    if (!consumed) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Refresh token already used or revoked', 401);
    }
  }

  const { getRoleById } = await import('../role');
  const roleId = decoded.roleId ?? '';
  const roleData = await getRoleById(roleId);
  if (!roleData) {
    throw new AppError(ErrorCode.UNAUTHORIZED, 'Role not found', 401);
  }

  const accessToken = signAccessToken(
    {
      sub: decoded.sub,
      email: decoded.email ?? '',
      roleId: decoded.roleId ?? '',
      roleName: roleData.name,
      permissions: roleData.permissions,
    },
    input.context
  );
  const refresh = signRefreshToken(
    {
      sub: decoded.sub,
      email: decoded.email ?? '',
      roleId: decoded.roleId ?? '',
      roleName: roleData.name,
      permissions: roleData.permissions,
    },
    input.context
  );

  if (redis) {
    const ttl = getRefreshTokenTtlSeconds(input.context);
    await setRefreshToken(redis, decoded.sub, refresh.jti, ttl);
  }

  return {
    accessToken,
    refreshToken: refresh.token,
    expiresIn: refresh.expiresIn,
    user: {
      id: decoded.sub,
      email: decoded.email ?? '',
      name: null,
      roleName: roleData.name,
      permissions: roleData.permissions,
    },
  };
}

export async function logout(accessToken: string | null): Promise<void> {
  if (!accessToken) return;
  const redis = getRedis();
  if (redis) {
    await addAccessTokenToBlacklist(redis, accessToken, 900); // 15 min max
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}
