"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
require("dotenv/config");
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || '5432';
const dbUser = process.env.DB_USERNAME || process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || 'postgres';
const dbName = process.env.DB_DATABASE || 'backend';
const dbNameTest = process.env.DB_DATABASE_TEST || `${dbName}_test`;
const defaultDbUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;
const defaultDbUrlTest = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbNameTest}`;
exports.CONFIG = {
    db: process.env.DB_CONNECTION || defaultDbUrl,
    db_test: process.env.DB_CONNECTION_TEST || defaultDbUrlTest,
    app: {
        port: process.env.APP_PORT || process.env.PORT || 3000,
        env: process.env.APP_ENV || 'development',
        apiPrefix: process.env.API_PREFIX || 'api/v1'
    },
    jwt_key: process.env.JWT_SECRET || process.env.JWT_KEY || 'dev_jwt_secret',
    jwt_expiration: process.env.JWT_EXPIRATION || '48h',
    uploads: {
        maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 10),
        uploadDest: process.env.UPLOAD_DEST || './uploads'
    },
    abono: {
        porcentajeDefault: Number(process.env.PORCENTAJE_ABONO_DEFAULT || 30)
    },
    aprobacion: {
        diasHabilesMin: Number(process.env.DIAS_HABILES_MIN || 5),
        diasHabilesMax: Number(process.env.DIAS_HABILES_MAX || 15)
    }
};
exports.default = exports.CONFIG;
