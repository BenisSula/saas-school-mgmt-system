import type { PoolClient } from 'pg';
import { assertValidSchemaName } from '../db/tenantManager';

export interface AttendanceMark {
  studentId: string;
  classId?: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  date: string;
  metadata?: Record<string, unknown>;
}

export async function markAttendance(
  client: PoolClient,
  schemaName: string,
  records: AttendanceMark[]
): Promise<void> {
  assertValidSchemaName(schemaName);
  const query = `
    INSERT INTO ${schemaName}.attendance_records (student_id, class_id, status, marked_by, attendance_date, metadata)
    VALUES ($1, $2, $3, $4, $5, $6::jsonb)
    ON CONFLICT (student_id, class_id, attendance_date)
    DO UPDATE SET
      status = EXCLUDED.status,
      marked_by = EXCLUDED.marked_by,
      metadata = EXCLUDED.metadata,
      recorded_at = NOW()
  `;

  for (const record of records) {
    await client.query(query, [
      record.studentId,
      record.classId ?? null,
      record.status,
      record.markedBy,
      record.date,
      JSON.stringify(record.metadata ?? {})
    ]);
  }

  console.info('[audit] attendance_mark', {
    count: records.length,
    students: records.map((record) => record.studentId),
    dateRange: {
      from: records[0]?.date,
      to: records[records.length - 1]?.date
    }
  });
}

export async function getStudentAttendance(
  client: PoolClient,
  schemaName: string,
  studentId: string,
  from?: string,
  to?: string
) {
  assertValidSchemaName(schemaName);
  const params: unknown[] = [studentId];
  const where: string[] = ['student_id = $1'];

  if (from) {
    params.push(from);
    where.push(`attendance_date >= $${params.length}`);
  }

  if (to) {
    params.push(to);
    where.push(`attendance_date <= $${params.length}`);
  }

  const result = await client.query(
    `
      SELECT *
      FROM ${schemaName}.attendance_records
      WHERE ${where.join(' AND ')}
      ORDER BY attendance_date DESC
    `,
    params
  );

  return result.rows;
}

export async function getClassReport(
  client: PoolClient,
  schemaName: string,
  classId: string,
  date: string
) {
  assertValidSchemaName(schemaName);
  const result = await client.query(
    `
      SELECT
        status,
        COUNT(*) AS count
      FROM ${schemaName}.attendance_records
      WHERE class_id = $1
        AND attendance_date = $2
      GROUP BY status
    `,
    [classId, date]
  );

  return result.rows;
}

export async function getAttendanceSummary(
  client: PoolClient,
  schemaName: string,
  studentId: string
) {
  assertValidSchemaName(schemaName);
  const result = await client.query(
    `
      SELECT
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END)::float AS present_count,
        COUNT(*)::float AS total_count
      FROM ${schemaName}.attendance_records
      WHERE student_id = $1
    `,
    [studentId]
  );

  const row = result.rows[0];
  const total = row.total_count ?? 0;
  const present = row.present_count ?? 0;
  const percentage = total === 0 ? 0 : (present / total) * 100;

  return {
    present,
    total,
    percentage
  };
}

