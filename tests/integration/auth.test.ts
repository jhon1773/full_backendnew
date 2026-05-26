import request from 'supertest';
import { newDb } from 'pg-mem';
import server from '../../src/app/app';
import { setPool, closePool } from '../../src/app/database/postgres/connection';

jest.setTimeout(30000);

async function createSchema(pool: any): Promise<void> {
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
    CREATE TABLE IF NOT EXISTS portals (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      country VARCHAR(80) UNIQUE NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('activo', 'inactivo')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
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

  await pool.query(`
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

  await pool.query(`
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

  await pool.query(`
    INSERT INTO portals (id, name, country, status)
    VALUES
      ('11111111-1111-1111-1111-111111111111', 'Portal Colombia', 'Colombia', 'activo'),
      ('22222222-2222-2222-2222-222222222222', 'Portal Chile', 'Chile', 'activo'),
      ('33333333-3333-3333-3333-333333333333', 'Portal Ecuador', 'Ecuador', 'inactivo');
  `);
}

describe('RF-03 to RF-07 flows with PostgreSQL', () => {
  let app: any;
  let pool: any;
  let superToken = '';
  let adminToken = '';
  let editorToken = '';

  beforeAll(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    const adapter = db.adapters.createPg();
    pool = new adapter.Pool();
    setPool(pool);
    await createSchema(pool);
    app = server.app;

    const superadmin = await request(app).post('/api/v1/user/create').send({
      name: 'Super Admin',
      email: 'superadmin@example.com',
      phone: '3000000001',
      password: 'password',
      role: 'superadmin',
      country: 'Colombia',
    });
    superToken = superadmin.body.token;

    const admin = await request(app).post('/api/v1/user/create').send({
      name: 'Admin Pais',
      email: 'admin@example.com',
      phone: '3000000002',
      password: 'password',
      role: 'admin_pais',
      country: 'Colombia',
    });
    adminToken = admin.body.token;

    const editor = await request(app).post('/api/v1/user/create').send({
      name: 'Editor',
      email: 'editor@example.com',
      phone: '3000000003',
      password: 'password',
      role: 'editor',
      country: 'Colombia',
    });
    editorToken = editor.body.token;
  });

  afterAll(async () => {
    await closePool();
  });

  test('RF-03 superadmin can list portals', async () => {
    const res = await request(app)
      .get('/api/v1/portals')
      .set('Authorization', `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.portals).toHaveLength(3);
  });

  test('RF-03 admin_pais cannot list portals', async () => {
    const res = await request(app)
      .get('/api/v1/portals')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(403);
  });

  test('RF-07 public contact form creates request', async () => {
    const res = await request(app)
      .post('/api/v1/requests/public')
      .send({
        name: 'Visitante',
        email: 'visitante@example.com',
        phone: '3010000000',
        purpose: 'Quiero colaborar',
        country: 'Colombia',
      });

    expect(res.status).toBe(201);
    expect(res.body.request.status).toBe('pendiente');
  });

  test('RF-04 admin_pais lists only own country requests', async () => {
    await request(app)
      .post('/api/v1/requests/public')
      .send({
        name: 'Persona Chile',
        email: 'chile@example.com',
        phone: '3010000001',
        purpose: 'Ayuda',
        country: 'Chile',
      });

    const res = await request(app)
      .get('/api/v1/requests?status=pendiente')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.requests.every((item: any) => item.country === 'Colombia')).toBe(true);
  });

  test('RF-04 superadmin can update request status and see detail', async () => {
    const list = await request(app)
      .get('/api/v1/requests?status=pendiente')
      .set('Authorization', `Bearer ${superToken}`);

    const requestId = list.body.requests[0].id;

    const detail = await request(app)
      .get(`/api/v1/requests/${requestId}`)
      .set('Authorization', `Bearer ${superToken}`);

    expect(detail.status).toBe(200);

    const updated = await request(app)
      .patch(`/api/v1/requests/${requestId}/status`)
      .set('Authorization', `Bearer ${superToken}`)
      .send({ status: 'gestionada' });

    expect(updated.status).toBe(200);
    expect(updated.body.request.status).toBe('gestionada');
  });

  test('RF-05 admin/editor can create and toggle testimonial', async () => {
    const created = await request(app)
      .post('/api/v1/testimonials')
      .set('Authorization', `Bearer ${editorToken}`)
      .send({
        name: 'Testimonio Uno',
        photo_url: 'https://example.com/photo.jpg',
        text: 'Gran impacto social',
        country: 'Colombia',
        publication_status: 'borrador',
      });

    expect(created.status).toBe(201);

    const toggled = await request(app)
      .patch(`/api/v1/testimonials/${created.body.testimonial.id}/publication`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(toggled.status).toBe(200);
    expect(['publicado', 'despublicado']).toContain(toggled.body.testimonial.publication_status);
  });

  test('RF-06 admin/editor can create and toggle news', async () => {
    const created = await request(app)
      .post('/api/v1/news')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Nueva noticia',
        summary: 'Resumen breve',
        content: 'Contenido completo',
        country: 'Colombia',
        author: 'Redaccion',
        status: 'borrador',
      });

    expect(created.status).toBe(201);

    const toggled = await request(app)
      .patch(`/api/v1/news/${created.body.news.id}/status`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(toggled.status).toBe(200);
    expect(toggled.body.news.status).toBe('publicado');
  });

  test('RF-01 current session endpoint returns role, country and modules', async () => {
    const res = await request(app)
      .get('/api/v1/user/me')
      .set('Authorization', `Bearer ${superToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe('superadmin');
    expect(res.body.user.country).toBe('Colombia');
    expect(Array.isArray(res.body.modules)).toBe(true);
    expect(res.body.modules.some((module: any) => module.id === 'portals')).toBe(true);
  });
});