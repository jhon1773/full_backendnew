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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const pg_mem_1 = require("pg-mem");
const app_1 = __importDefault(require("../../src/app/app"));
const connection_1 = require("../../src/app/database/postgres/connection");
jest.setTimeout(30000);
describe('Auth flows with PostgreSQL', () => {
    let token;
    let app;
    let pool;
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, pg_mem_1.newDb)({ autoCreateForeignKeyIndices: true });
        const adapter = db.adapters.createPg();
        pool = new adapter.Pool();
        (0, connection_1.setPool)(pool);
        yield pool.query(`
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
        yield pool.query(`
      CREATE TABLE IF NOT EXISTS token_blacklist (
        id BIGSERIAL PRIMARY KEY,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL
      );
    `);
        yield pool.query(`
      CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at
      ON token_blacklist (expires_at);
    `);
        app = app_1.default.app;
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, connection_1.closePool)();
    }));
    test('create user -> returns token and user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
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
    }));
    test('login with created user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/v1/user/')
            .send({ email: 'test@example.com', password: 'password' });
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        token = res.body.token;
    }));
    test('access metrics with token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/metrics')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
        expect(res.body.metrics).toBeDefined();
    }));
    test('logout invalidates token', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .post('/api/v1/user/logout')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(200);
    }));
    test('token no longer valid after logout', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .get('/api/v1/dashboard/metrics')
            .set('Authorization', `Bearer ${token}`);
        expect(res.status).toBe(401);
    }));
});
