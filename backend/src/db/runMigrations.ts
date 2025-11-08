import { promises as fs } from 'fs';
import path from 'path';
import type { Pool } from 'pg';

export async function runMigrations(pool: Pool): Promise<void> {
  const migrationsDir = path.resolve(__dirname, 'migrations');
  const files = (await fs.readdir(migrationsDir))
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = await fs.readFile(filePath, 'utf-8');
    await pool.query(sql);
  }
}

