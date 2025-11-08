import type { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import app from '../src/app';
import { createTestPool } from './utils/testDb';
import { createTenant } from '../src/db/tenantManager';
import { getPool } from '../src/db/connection';

type MockAuthRequest = Request & {
  user?: {
    id: string;
    role: 'admin' | 'teacher' | 'student' | 'superadmin';
    tenantId: string;
    email: string;
    tokenId: string;
  };
};

jest.mock('../src/middleware/authenticate', () => ({
  __esModule: true,
  default: (req: MockAuthRequest, _res: Response, next: NextFunction) => {
    req.user = {
      id: 'auth-user',
      role: 'admin',
      tenantId: 'tenant_alpha',
      email: `admin@test.com`,
      tokenId: 'token'
    };
    next();
  }
}));

jest.mock('../src/middleware/tenantResolver', () => {
  const actual = jest.requireActual('../src/middleware/tenantResolver');
  return actual;
});

jest.mock('../src/db/connection', () => ({
  getPool: jest.fn(),
  closePool: jest.fn()
}));

const mockedGetPool = getPool as unknown as jest.Mock;

describe('Attendance routes', () => {
  beforeAll(async () => {
    const testPool = await createTestPool();
    mockedGetPool.mockReturnValue(testPool.pool);
    await createTenant(
      {
        name: 'Attendance School',
        schemaName: 'tenant_alpha'
      },
      testPool.pool
    );

    await testPool.pool.query(
      `
        INSERT INTO tenant_alpha.students (first_name, last_name, admission_number)
        VALUES ('Test', 'Student', 'ADM-001')
      `
    );
  });

  const teacherHeaders = { Authorization: 'Bearer fake', 'x-tenant-id': 'tenant_alpha' };

  it('marks attendance in bulk and fetches history', async () => {
    const studentIdResult = await mockedGetPool().query(
      `SELECT id FROM tenant_alpha.students WHERE admission_number = 'ADM-001' LIMIT 1`
    );
    const studentId = studentIdResult.rows[0].id as string;

    const mark = await request(app)
      .post('/attendance/mark')
      .set(teacherHeaders)
      .send({
        records: [
          {
            studentId,
            classId: 'Class-A',
            status: 'present',
            markedBy: '11111111-1111-1111-1111-111111111111',
            date: '2025-01-01'
          }
        ]
      });

    expect(mark.status).toBe(204);

    const secondMark = await request(app)
      .post('/attendance/mark')
      .set(teacherHeaders)
      .send({
        records: [
          {
            studentId,
            classId: 'Class-A',
            status: 'present',
            markedBy: '11111111-1111-1111-1111-111111111111',
            date: '2025-01-01'
          }
        ]
      });

    expect(secondMark.status).toBe(204);

    const history = await request(app)
      .get(`/attendance/${studentId}`)
      .set(teacherHeaders);

    expect(history.status).toBe(200);
    expect(history.body.history.length).toBeGreaterThanOrEqual(1);
  });

  it('returns class report', async () => {
    const report = await request(app)
      .get('/attendance/report/class')
      .set(teacherHeaders)
      .query({ class_id: 'Class-A', date: '2025-01-01' });

    expect(report.status).toBe(200);
    expect(report.body.length).toBeGreaterThanOrEqual(1);
  });
});

