/**
 * Integration tests for auth API.
 * Requires: MongoDB and Redis running, and run `pnpm db:push` and `pnpm db:seed` first.
 * Run with: pnpm test:integration (or npm run test:integration).
 */
import request from 'supertest';
import app from '../../src/app';

const API = '/api/web/v1';

describe('Auth API (Web)', () => {
  let accessToken: string;
  let refreshToken: string;

  it('POST /auth/register - validates body', async () => {
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email: 'invalid', password: 'short' })
      .expect(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /auth/register - creates user and returns tokens', async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request(app)
      .post(`${API}/auth/register`)
      .send({ email, password: 'Pass1234', name: 'Test User' })
      .expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
    expect(res.body.data.user.email).toBe(email);
    accessToken = res.body.data.accessToken;
    refreshToken = res.body.data.refreshToken;
  });

  it('GET /profile - requires auth', async () => {
    await request(app).get(`${API}/profile`).expect(401);
  });

  it('GET /profile - returns profile with valid token', async () => {
    const res = await request(app)
      .get(`${API}/profile`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('email');
  });

  it('POST /auth/refresh - returns new tokens', async () => {
    const res = await request(app).post(`${API}/auth/refresh`).send({ refreshToken }).expect(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).not.toBe(refreshToken);
  });

  it('POST /auth/logout - succeeds', async () => {
    await request(app)
      .post(`${API}/auth/logout`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);
  });
});
