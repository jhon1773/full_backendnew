import { Pool } from 'pg';
import { CONFIG } from '../../../config';

export type DbPool = Pick<Pool, 'query' | 'end'>;

let pool: DbPool | null = null;

export function setPool(customPool: DbPool): void {
  pool = customPool;
}

export function getPool(): DbPool {
  if (!pool) {
    throw new Error('La conexión a PostgreSQL no fue inicializada');
  }

  return pool;
}

export async function dbConnection(): Promise<void> {
  try {
    const connectionString = process.env.DB_CONNECTION || CONFIG.db;
    const createdPool = new Pool({ connectionString });
    await createdPool.query('SELECT 1');
    await initializeSchema(createdPool);
    pool = createdPool;
    console.log('connected to the database');
  } catch (error) {
    console.log('error connecting to the database', { error });
    throw new Error('error en la base de datos');
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

async function initializeSchema(currentPool: DbPool): Promise<void> {
  await currentPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) UNIQUE NOT NULL,
      phone VARCHAR(40) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin_pais', 'editor')),
      country VARCHAR(80),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await currentPool.query(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id BIGSERIAL PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL
    );
  `);

  await currentPool.query(`
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at
    ON token_blacklist (expires_at);
  `);
}
