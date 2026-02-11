import type { JwtPayload } from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: AuthUser;
      jwtPayload?: JwtPayload & {
        sub: string;
        email: string;
        roleId: string;
        permissions?: string[];
      };
    }
  }
}

export {};
