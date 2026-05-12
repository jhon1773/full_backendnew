import request from 'supertest';
import { newDb } from 'pg-mem';
import server from '../../src/app/app';
import { setPool, closePool } from '../../src/app/database/postgres/connection';

jest.setTimeout(30000);

describe('Auth flows with PostgreSQL', () => {
  let token: string;
  let app: any;
  let pool: any;

  beforeAll(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
    setPool(pool);

    await pool.query(`
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id BIGSERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL
      );
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at
      ON token_blacklist (expires_at);
    `);

    app = server.app;
  });

  afterAll(async () => {
    await closePool();
  });

  test('create user -> returns token and user', async () => {
    const res = await request(app)
      .post('/api/v1/user/create')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        phone: '5551234',
        password: 'password',
        role: 'admin_pais',
        country: 'Colombia',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('login with created user', async () => {
    const res = await request(app)
      .post('/api/v1/user/')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  test('access metrics with token', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.metrics).toBeDefined();
  });

  test('logout invalidates token', async () => {
    const res = await request(app)
      .post('/api/v1/user/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  test('token no longer valid after logout', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/metrics')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });
});
