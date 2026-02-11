import { register, login } from '../../src/modules/auth';

jest.mock('../../src/modules/user', () => ({
  createUser: jest.fn(),
  findByEmail: jest.fn(),
}));
jest.mock('../../src/modules/role', () => ({
  getRoleByName: jest.fn(),
}));
jest.mock('../../src/cache', () => ({
  getRedis: jest.fn(() => null),
  setRefreshToken: jest.fn(),
}));
jest.mock('bcrypt', () => ({
  hash: jest.fn((pw: string) => Promise.resolve(`hashed_${pw}`)),
  compare: jest.fn((pw: string, hash: string) => Promise.resolve(hash === `hashed_${pw}`)),
}));

const { createUser, findByEmail } = require('../../src/modules/user');
const { getRoleByName } = require('../../src/modules/role');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw CONFLICT if email already exists', async () => {
      (findByEmail as jest.Mock).mockResolvedValue({ id: '1', email: 'a@b.com' });
      await expect(
        register({ email: 'a@b.com', password: 'Pass1234', name: 'Test' }, 'web')
      ).rejects.toMatchObject({ code: 'CONFLICT', statusCode: 409 });
    });

    it('should create user and return tokens when role exists', async () => {
      (findByEmail as jest.Mock).mockResolvedValue(null);
      (getRoleByName as jest.Mock).mockResolvedValue({
        id: 'role1',
        name: 'USER',
        permissions: ['profile:read', 'profile:update'],
      });
      (createUser as jest.Mock).mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        name: 'Test',
        roleId: 'role1',
        roleName: 'USER',
        permissions: ['profile:read', 'profile:update'],
        createdAt: new Date(),
      });
      const result = await register(
        { email: 'a@b.com', password: 'Pass1234', name: 'Test' },
        'web'
      );
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('a@b.com');
      expect(createUser).toHaveBeenCalledWith('a@b.com', 'hashed_Pass1234', 'role1', 'Test');
    });
  });

  describe('login', () => {
    it('should throw UNAUTHORIZED if user not found', async () => {
      (findByEmail as jest.Mock).mockResolvedValue(null);
      await expect(login('a@b.com', 'Pass1234', 'web')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        statusCode: 401,
      });
    });

    it('should throw UNAUTHORIZED if password wrong', async () => {
      (findByEmail as jest.Mock).mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        password: 'hashed_Pass1234',
        roleName: 'USER',
        permissions: [],
      });
      await expect(login('a@b.com', 'WrongPass', 'web')).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
      });
    });

    it('should return tokens when credentials valid', async () => {
      (findByEmail as jest.Mock).mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        password: 'hashed_Pass1234',
        roleId: 'r1',
        roleName: 'USER',
        permissions: ['profile:read'],
      });
      const result = await login('a@b.com', 'Pass1234', 'web');
      expect(result.accessToken).toBeDefined();
      expect(result.user.email).toBe('a@b.com');
    });
  });
});
