import type { PoolClient } from 'pg';
import { SchoolInput } from '../validators/schoolValidator';
import { assertValidSchemaName } from '../db/tenantManager';

const table = 'schools';

function tableName(schema: string): string {
  assertValidSchemaName(schema);
  return `${schema}.${table}`;
}

export async function getSchool(client: PoolClient, schema: string) {
  const result = await client.query(
    `SELECT * FROM ${tableName(schema)} ORDER BY created_at ASC LIMIT 1`
  );
  return result.rows[0] ?? null;
}

export async function upsertSchool(client: PoolClient, schema: string, payload: SchoolInput) {
  const existing = await getSchool(client, schema);

  if (!existing) {
    const result = await client.query(
      `
        INSERT INTO ${tableName(schema)} (name, address)
        VALUES ($1, $2)
        RETURNING *
      `,
      [payload.name, JSON.stringify(payload.address ?? {})]
    );

    return result.rows[0];
  }

  const result = await client.query(
    `
      UPDATE ${tableName(schema)}
      SET name = $1,
          address = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `,
    [
      payload.name ?? existing.name,
      JSON.stringify(payload.address ?? existing.address ?? {}),
      existing.id
    ]
  );

  return result.rows[0];
}

