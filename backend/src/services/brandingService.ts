import type { PoolClient } from 'pg';
import { BrandingInput } from '../validators/brandingValidator';
import { assertValidSchemaName } from '../db/tenantManager';

const table = 'branding_settings';

function tableName(schema: string): string {
  assertValidSchemaName(schema);
  return `${schema}.${table}`;
}

export async function getBranding(client: PoolClient, schema: string) {
  const result = await client.query(
    `SELECT * FROM ${tableName(schema)} ORDER BY updated_at DESC LIMIT 1`
  );
  return result.rows[0] ?? null;
}

export async function upsertBranding(
  client: PoolClient,
  schema: string,
  payload: BrandingInput
) {
  const existing = await getBranding(client, schema);

  if (!existing) {
    const result = await client.query(
      `
        INSERT INTO ${tableName(schema)} (logo_url, primary_color, secondary_color, theme_flags, typography, navigation)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `,
      [
        payload.logoUrl ?? null,
        payload.primaryColor ?? null,
        payload.secondaryColor ?? null,
        JSON.stringify(payload.themeFlags ?? {}),
        JSON.stringify(payload.typography ?? {}),
        JSON.stringify(payload.navigation ?? {})
      ]
    );

    return result.rows[0];
  }

  const result = await client.query(
    `
      UPDATE ${tableName(schema)}
      SET logo_url = $1,
          primary_color = $2,
          secondary_color = $3,
          theme_flags = $4,
          typography = $5,
          navigation = $6,
          updated_at = NOW()
      WHERE id = $7
      RETURNING *
    `,
    [
      payload.logoUrl ?? existing.logo_url,
      payload.primaryColor ?? existing.primary_color,
      payload.secondaryColor ?? existing.secondary_color,
      JSON.stringify(payload.themeFlags ?? existing.theme_flags ?? {}),
      JSON.stringify(payload.typography ?? existing.typography ?? {}),
      JSON.stringify(payload.navigation ?? existing.navigation ?? {}),
      existing.id
    ]
  );

  return result.rows[0];
}

