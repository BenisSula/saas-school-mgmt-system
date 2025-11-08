import type { PoolClient } from 'pg';
import { assertValidSchemaName } from '../db/tenantManager';

interface AttendanceReportFilters {
  from?: string;
  to?: string;
  classId?: string;
}

export async function getAttendanceSummary(
  client: PoolClient,
  schema: string,
  filters: AttendanceReportFilters
) {
  assertValidSchemaName(schema);
  const result = await client.query(
    `
      SELECT
        attendance_date,
        class_id,
        status,
        COUNT(*)::int AS count
      FROM ${schema}.attendance_records
      WHERE ($1::date IS NULL OR attendance_date >= $1::date)
        AND ($2::date IS NULL OR attendance_date <= $2::date)
        AND ($3::text IS NULL OR class_id = $3::text)
      GROUP BY attendance_date, class_id, status
      ORDER BY attendance_date DESC, class_id, status
    `,
    [filters.from ?? null, filters.to ?? null, filters.classId ?? null]
  );

  return result.rows;
}

export async function getGradeDistribution(
  client: PoolClient,
  schema: string,
  examId: string
) {
  assertValidSchemaName(schema);
  const result = await client.query(
    `
      SELECT
        subject,
        grade,
        COUNT(*)::int AS count,
        AVG(score)::float AS average_score
      FROM ${schema}.grades
      WHERE exam_id = $1
      GROUP BY subject, grade
      ORDER BY subject, grade
    `,
    [examId]
  );

  return result.rows;
}

export async function getFeeOutstanding(
  client: PoolClient,
  schema: string,
  status?: string
) {
  assertValidSchemaName(schema);
  const result = await client.query(
    `
      SELECT
        status,
        COUNT(*)::int AS invoice_count,
        SUM(total_amount)::float AS total_amount,
        SUM(amount_paid)::float AS total_paid
      FROM ${schema}.invoices fi
      WHERE ($1::text IS NULL OR status = $1::text)
      GROUP BY status
      ORDER BY status
    `,
    [status ?? null]
  );

  return result.rows;
}


