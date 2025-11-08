import type { PoolClient } from 'pg';
import { TeacherInput } from '../validators/teacherValidator';
import { assertValidSchemaName } from '../db/tenantManager';

const table = 'teachers';

function tableName(schema: string): string {
  assertValidSchemaName(schema);
  return `${schema}.${table}`;
}

export async function listTeachers(client: PoolClient, schema: string) {
  const result = await client.query(`SELECT * FROM ${tableName(schema)} ORDER BY created_at DESC`);
  return result.rows;
}

export async function getTeacher(client: PoolClient, schema: string, id: string) {
  const result = await client.query(`SELECT * FROM ${tableName(schema)} WHERE id = $1`, [id]);
  return result.rows[0];
}

export async function createTeacher(client: PoolClient, schema: string, payload: TeacherInput) {
  const result = await client.query(
    `
      INSERT INTO ${tableName(schema)} (name, email, subjects, assigned_classes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
    [payload.name, payload.email, JSON.stringify(payload.subjects ?? []), JSON.stringify(payload.assignedClasses ?? [])]
  );

  return result.rows[0];
}

export async function updateTeacher(
  client: PoolClient,
  schema: string,
  id: string,
  payload: Partial<TeacherInput>
) {
  const existing = await getTeacher(client, schema, id);
  if (!existing) {
    return null;
  }

  const next = {
    name: payload.name ?? existing.name,
    email: payload.email ?? existing.email,
    subjects: JSON.stringify(payload.subjects ?? existing.subjects),
    assigned_classes: JSON.stringify(payload.assignedClasses ?? existing.assigned_classes)
  };

  const result = await client.query(
    `
      UPDATE ${tableName(schema)}
      SET name = $1,
          email = $2,
          subjects = $3,
          assigned_classes = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `,
    [next.name, next.email, next.subjects, next.assigned_classes, id]
  );

  return result.rows[0];
}

export async function deleteTeacher(client: PoolClient, schema: string, id: string) {
  await client.query(`DELETE FROM ${tableName(schema)} WHERE id = $1`, [id]);
}

