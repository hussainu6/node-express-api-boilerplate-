import type { Request } from 'express';
import { requirePermission } from '../../src/common/guards/permission';
import { requireOwnership } from '../../src/common/guards/ownership';

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    user: undefined,
    params: {},
    body: {},
    ...overrides,
  } as Request;
}

describe('requirePermission', () => {
  it('calls next() when user has permission', (done) => {
    const req = mockReq({
      user: {
        id: '1',
        email: 'a@b.com',
        roleId: 'r1',
        roleName: 'USER',
        permissions: ['profile:read', 'profile:update'],
      },
    });
    const res = {} as any;
    requirePermission('profile:read')(req, res, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });

  it('calls next(error) when user lacks permission', (done) => {
    const req = mockReq({
      user: {
        id: '1',
        email: 'a@b.com',
        roleId: 'r1',
        roleName: 'USER',
        permissions: ['profile:read'],
      },
    });
    const res = {} as any;
    requirePermission('user:delete')(req, res, (err: unknown) => {
      expect(err).toBeDefined();
      expect((err as any).code).toBe('FORBIDDEN');
      done();
    });
  });

  it('allows ADMIN role', (done) => {
    const req = mockReq({
      user: {
        id: '1',
        email: 'a@b.com',
        roleId: 'r1',
        roleName: 'ADMIN',
        permissions: ['profile:read'],
      },
    });
    requirePermission('user:delete')(req, {} as any, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });
});

describe('requireOwnership', () => {
  it('calls next() when user owns resource', (done) => {
    const req = mockReq({
      user: { id: 'user1', email: 'u@b.com', roleId: 'r1', roleName: 'USER', permissions: [] },
      params: { userId: 'user1' },
    });
    requireOwnership((r) => r.params.userId as string)(req, {} as any, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });

  it('calls next(error) when user does not own resource', (done) => {
    const req = mockReq({
      user: { id: 'user1', email: 'u@b.com', roleId: 'r1', roleName: 'USER', permissions: [] },
      params: { userId: 'user2' },
    });
    requireOwnership((r) => r.params.userId as string)(req, {} as any, (err: unknown) => {
      expect(err).toBeDefined();
      expect((err as any).code).toBe('FORBIDDEN');
      done();
    });
  });

  it('allows ADMIN to access any resource', (done) => {
    const req = mockReq({
      user: {
        id: 'admin1',
        email: 'admin@b.com',
        roleId: 'r1',
        roleName: 'ADMIN',
        permissions: ['*'],
      },
      params: { userId: 'user2' },
    });
    requireOwnership((r) => r.params.userId as string)(req, {} as any, (err) => {
      expect(err).toBeUndefined();
      done();
    });
  });
});
