import crypto from 'crypto';
import type { PoolClient } from 'pg';
import { assertValidSchemaName } from '../db/tenantManager';
import { academicTermSchema, classSchema } from '../validators/termValidator';
import { z } from 'zod';

type AcademicTermInput = z.infer<typeof academicTermSchema>;
type ClassInput = z.infer<typeof classSchema>;

export async function createOrUpdateTerm(
  client: PoolClient,
  schema: string,
  input: AcademicTermInput
) {
  assertValidSchemaName(schema);
  const result = await client.query(
    `
      INSERT INTO ${schema}.academic_terms (id, name, starts_on, ends_on, metadata)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id)
      DO UPDATE SET
        name = EXCLUDED.name,
        starts_on = EXCLUDED.starts_on,
        ends_on = EXCLUDED.ends_on,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `,
    [
      crypto.randomUUID(),
      input.name,
      new Date(input.startsOn),
      new Date(input.endsOn),
      JSON.stringify(input.metadata ?? {})
    ]
  );

  console.info('[audit] term_saved', {
    tenantSchema: schema,
    termId: result.rows[0].id,
    name: input.name
  });

  return result.rows[0];
}

export async function listTerms(client: PoolClient, schema: string) {
  const result = await client.query(
    `SELECT * FROM ${schema}.academic_terms ORDER BY starts_on DESC`
  );
  return result.rows;
}

export async function createOrUpdateClass(
  client: PoolClient,
  schema: string,
  input: ClassInput
) {
  assertValidSchemaName(schema);
  const id = crypto.randomUUID();
  const result = await client.query(
    `
      INSERT INTO ${schema}.classes (id, name, description, metadata)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name)
      DO UPDATE SET
        description = EXCLUDED.description,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
      RETURNING *
    `,
    [id, input.name, input.description ?? null, JSON.stringify(input.metadata ?? {})]
  );

  console.info('[audit] class_saved', {
    tenantSchema: schema,
    classId: result.rows[0].id,
    name: input.name
  });

  return result.rows[0];
}

export async function listClasses(client: PoolClient, schema: string) {
  const result = await client.query(`SELECT * FROM ${schema}.classes ORDER BY name ASC`);
  return result.rows;
}


