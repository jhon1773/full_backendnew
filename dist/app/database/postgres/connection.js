"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.dbConnection = exports.getPool = exports.setPool = void 0;
const pg_1 = require("pg");
const config_1 = require("../../../config");
let pool = null;
function setPool(customPool) {
    pool = customPool;
}
exports.setPool = setPool;
function getPool() {
    if (!pool) {
        throw new Error('La conexión a PostgreSQL no fue inicializada');
    }
    return pool;
}
exports.getPool = getPool;
function dbConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const connectionString = process.env.DB_CONNECTION || config_1.CONFIG.db;
            const createdPool = new pg_1.Pool({ connectionString });
            yield createdPool.query('SELECT 1');
            yield initializeSchema(createdPool);
            pool = createdPool;
            console.log('connected to the database');
        }
        catch (error) {
            console.log('error connecting to the database', { error });
            throw new Error('error en la base de datos');
        }
    });
}
exports.dbConnection = dbConnection;
function closePool() {
    return __awaiter(this, void 0, void 0, function* () {
        if (pool) {
            yield pool.end();
            pool = null;
        }
    });
}
exports.closePool = closePool;
function initializeSchema(currentPool) {
    return __awaiter(this, void 0, void 0, function* () {
        yield currentPool.query(`
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
        yield currentPool.query(`
    CREATE TABLE IF NOT EXISTS token_blacklist (
      id BIGSERIAL PRIMARY KEY,
      token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL
    );
  `);
        yield currentPool.query(`
    CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at
    ON token_blacklist (expires_at);
  `);
        yield currentPool.query(`
    CREATE TABLE IF NOT EXISTS portals (
      id UUID PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      country VARCHAR(80) UNIQUE NOT NULL,
      status VARCHAR(20) NOT NULL CHECK (status IN ('activo', 'inactivo')),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
        yield currentPool.query(`
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
        yield currentPool.query(`
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
        yield currentPool.query(`
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
        yield seedPortals(currentPool);
    });
}
function seedPortals(currentPool) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield currentPool.query('SELECT COUNT(*)::text AS count FROM portals');
        const count = Number((_b = (_a = result.rows[0]) === null || _a === void 0 ? void 0 : _a.count) !== null && _b !== void 0 ? _b : '0');
        if (count > 0) {
            return;
        }
        yield currentPool.query(`
    INSERT INTO portals (id, name, country, status)
    VALUES
      (gen_random_uuid(), 'Portal Colombia', 'Colombia', 'activo'),
      (gen_random_uuid(), 'Portal Chile', 'Chile', 'activo'),
      (gen_random_uuid(), 'Portal Ecuador', 'Ecuador', 'inactivo')
  `).catch(() => __awaiter(this, void 0, void 0, function* () {
            // pg-mem and vanilla postgres may not have gen_random_uuid enabled in tests.
            yield currentPool.query(`
      INSERT INTO portals (id, name, country, status)
      VALUES
        (uuid_generate_v4(), 'Portal Colombia', 'Colombia', 'activo'),
        (uuid_generate_v4(), 'Portal Chile', 'Chile', 'activo'),
        (uuid_generate_v4(), 'Portal Ecuador', 'Ecuador', 'inactivo')
    `).catch(() => __awaiter(this, void 0, void 0, function* () {
                const portals = [
                    { id: '11111111-1111-1111-1111-111111111111', name: 'Portal Colombia', country: 'Colombia', status: 'activo' },
                    { id: '22222222-2222-2222-2222-222222222222', name: 'Portal Chile', country: 'Chile', status: 'activo' },
                    { id: '33333333-3333-3333-3333-333333333333', name: 'Portal Ecuador', country: 'Ecuador', status: 'inactivo' },
                ];
                for (const portal of portals) {
                    yield currentPool.query(`INSERT INTO portals (id, name, country, status) VALUES ($1, $2, $3, $4)`, [portal.id, portal.name, portal.country, portal.status]);
                }
            }));
        }));
    });
}
