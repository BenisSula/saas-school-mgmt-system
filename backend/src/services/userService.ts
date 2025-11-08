import { getPool } from '../db/connection';

type UserRole = 'student' | 'teacher' | 'admin' | 'superadmin';

export interface TenantUser {
  id: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  created_at: string;
}

export async function listTenantUsers(tenantId: string): Promise<TenantUser[]> {
  const pool = getPool();
  const result = await pool.query(
    `
      SELECT id, email, role, is_verified, created_at
      FROM shared.users
      WHERE tenant_id = $1
      ORDER BY created_at DESC
    `,
    [tenantId]
  );
  return result.rows;
}

export async function updateTenantUserRole(
  tenantId: string,
  userId: string,
  role: UserRole,
  actorId: string
): Promise<TenantUser | null> {
  const pool = getPool();
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
        UPDATE shared.users
        SET role = $1
        WHERE id = $2
          AND tenant_id = $3
        RETURNING id, email, role, is_verified, created_at
      `,
      [role, userId, tenantId]
    );

    if (result.rowCount === 0) {
      return null;
    }

    console.info('[audit] user_role_updated', {
      tenantId,
      userId,
      newRole: role,
      actorId
    });

    return result.rows[0];
  } finally {
    client.release();
  }
}


