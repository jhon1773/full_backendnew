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

  await currentPool.query(`
    CREATE TABLE IF NOT EXISTS portals (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      country VARCHAR(80) UNIQUE NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('activo', 'inactivo')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await currentPool.query(`
    CREATE TABLE IF NOT EXISTS contact_requests (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(180) NOT NULL,
      phone VARCHAR(40) NOT NULL,
      purpose VARCHAR(255) NOT NULL,
      country VARCHAR(80) NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('pendiente', 'gestionada', 'respondida')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await currentPool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      photo_url TEXT NOT NULL,
      text TEXT NOT NULL,
      country VARCHAR(80) NOT NULL,
      instagram_url TEXT,
      facebook_url TEXT,
      publication_status VARCHAR(20) NOT NULL CHECK (publication_status IN ('borrador', 'publicado', 'despublicado')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await currentPool.query(`
    CREATE TABLE IF NOT EXISTS news (
      id UUID PRIMARY KEY,
      title VARCHAR(180) NOT NULL,
      summary TEXT NOT NULL,
      content TEXT NOT NULL,
      country VARCHAR(80) NOT NULL,
      author VARCHAR(120) NOT NULL,
      image_url TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('borrador', 'publicado')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await seedPortals(currentPool);
}

async function seedPortals(currentPool: DbPool): Promise<void> {
  const result = await currentPool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM portals');
  const count = Number(result.rows[0]?.count ?? '0');
  if (count > 0) {
    return;
  }

  await currentPool.query(`
    INSERT INTO portals (id, name, country, status)
    VALUES
      (gen_random_uuid(), 'Portal Colombia', 'Colombia', 'activo'),
      (gen_random_uuid(), 'Portal Chile', 'Chile', 'activo'),
      (gen_random_uuid(), 'Portal Ecuador', 'Ecuador', 'inactivo')
  `).catch(async () => {
    // pg-mem and vanilla postgres may not have gen_random_uuid enabled in tests.
    await currentPool.query(`
      INSERT INTO portals (id, name, country, status)
      VALUES
        (uuid_generate_v4(), 'Portal Colombia', 'Colombia', 'activo'),
        (uuid_generate_v4(), 'Portal Chile', 'Chile', 'activo'),
        (uuid_generate_v4(), 'Portal Ecuador', 'Ecuador', 'inactivo')
    `).catch(async () => {
      const portals = [
        { id: '11111111-1111-1111-1111-111111111111', name: 'Portal Colombia', country: 'Colombia', status: 'activo' },
        { id: '22222222-2222-2222-2222-222222222222', name: 'Portal Chile', country: 'Chile', status: 'activo' },
        { id: '33333333-3333-3333-3333-333333333333', name: 'Portal Ecuador', country: 'Ecuador', status: 'inactivo' },
      ];

      for (const portal of portals) {
        await currentPool.query(
          `INSERT INTO portals (id, name, country, status) VALUES ($1, $2, $3, $4)`,
          [portal.id, portal.name, portal.country, portal.status]
        );
      }
    });
  });
}
