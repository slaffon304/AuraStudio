import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const { Pool } = pg;

const connectionString = (process.env.DATABASE_URL || '').trim();
export const isDbConfigured = Boolean(connectionString);

export const pool = isDbConfigured
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000
    })
  : null;

if (pool) {
  pool.on('error', (err: Error) => {
    console.error('Unexpected database pool error:', err);
  });
}

export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
  if (!pool) {
    throw new Error('DATABASE_URL is not configured; use supabaseAdmin instead');
  }
  const result = await pool.query(text, params);
  return result.rows as T[];
}

