import request from 'supertest';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import app from '../src/app';
import { createTestPool } from './utils/testDb';
import { createTenant } from '../src/db/tenantManager';
import { getPool } from '../src/db/connection';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    role: string;
    tenantId: string;
    email: string;
    tokenId: string;
  };
};

jest.mock('../src/middleware/authenticate', () => ({
  __esModule: true,
  default: (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    req.user = {
      id: 'super-admin',
      role: 'superadmin',
      tenantId: 'tenant_alpha',
      email: 'super@test.com',
      tokenId: 'token'
    };
    next();
  }
}));

jest.mock('../src/db/connection', () => ({
  getPool: jest.fn(),
  closePool: jest.fn()
}));

const mockedGetPool = getPool as unknown as jest.Mock;

describe('User management routes', () => {
  const headers = { Authorization: 'Bearer fake', 'x-tenant-id': 'tenant_alpha' };
  let tenantId: string;
  let targetUserId: string;

  beforeAll(async () => {
    const { pool } = await createTestPool();
    mockedGetPool.mockReturnValue(pool);

    const tenant = await createTenant(
      {
        name: 'Alpha Academy',
        schemaName: 'tenant_alpha'
      },
      pool
    );
    tenantId = tenant.id;

    targetUserId = randomUUID();
    await pool.query(
      `
        INSERT INTO shared.users (id, email, password_hash, role, tenant_id, is_verified)
        VALUES ($1, 'teacher@test.com', 'hash', 'teacher', $2, true)
      `,
      [targetUserId, tenantId]
    );
  });

  it('lists tenant users', async () => {
    const response = await request(app).get('/users').set(headers);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: targetUserId,
          email: 'teacher@test.com',
          role: 'teacher'
        })
      ])
    );
  });

  it('updates a user role', async () => {
    const response = await request(app)
      .patch(`/users/${targetUserId}/role`)
      .set(headers)
      .send({ role: 'admin' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: targetUserId,
      role: 'admin'
    });

    const listAfter = await request(app).get('/users').set(headers);
    const updated = (listAfter.body as Array<{ id: string; role: string }>).find(
      (user) => user.id === targetUserId
    );
    expect(updated).toBeDefined();
    expect(updated?.role).toBe('admin');
  });
});
