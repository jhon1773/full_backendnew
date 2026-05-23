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
exports.toggleNewsStatus = exports.deleteNews = exports.updateNews = exports.createNews = exports.listNews = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../database/postgres/connection");
function listNews(filter = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const clauses = [];
        const values = [];
        if (filter.country) {
            values.push(filter.country);
            clauses.push(`country = $${values.length}`);
        }
        if (filter.status) {
            values.push(filter.status);
            clauses.push(`status = $${values.length}`);
        }
        const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        const result = yield (0, connection_1.getPool)().query(`SELECT * FROM news ${whereClause} ORDER BY created_at DESC`, values);
        return result.rows;
    });
}
exports.listNews = listNews;
function createNews(input) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const id = crypto_1.default.randomUUID();
        const result = yield (0, connection_1.getPool)().query(`INSERT INTO news (id, title, summary, content, country, author, image_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`, [
            id,
            input.title,
            input.summary,
            input.content,
            input.country,
            input.author,
            (_a = input.image_url) !== null && _a !== void 0 ? _a : null,
            (_b = input.status) !== null && _b !== void 0 ? _b : 'borrador',
        ]);
        return result.rows[0];
    });
}
exports.createNews = createNews;
function updateNews(id, input) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query(`UPDATE news
     SET title = COALESCE($2, title),
         summary = COALESCE($3, summary),
         content = COALESCE($4, content),
         country = COALESCE($5, country),
         author = COALESCE($6, author),
         image_url = COALESCE($7, image_url),
         status = COALESCE($8, status),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [
            id,
            (_a = input.title) !== null && _a !== void 0 ? _a : null,
            (_b = input.summary) !== null && _b !== void 0 ? _b : null,
            (_c = input.content) !== null && _c !== void 0 ? _c : null,
            (_d = input.country) !== null && _d !== void 0 ? _d : null,
            (_e = input.author) !== null && _e !== void 0 ? _e : null,
            (_f = input.image_url) !== null && _f !== void 0 ? _f : null,
            (_g = input.status) !== null && _g !== void 0 ? _g : null,
        ]);
        return (_h = result.rows[0]) !== null && _h !== void 0 ? _h : null;
    });
}
exports.updateNews = updateNews;
function deleteNews(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('DELETE FROM news WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
exports.deleteNews = deleteNews;
function toggleNewsStatus(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const current = yield (0, connection_1.getPool)().query('SELECT * FROM news WHERE id = $1 LIMIT 1', [id]);
        const news = current.rows[0];
        if (!news)
            return null;
        const nextStatus = news.status === 'publicado' ? 'borrador' : 'publicado';
        const result = yield (0, connection_1.getPool)().query(`UPDATE news SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, nextStatus]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.toggleNewsStatus = toggleNewsStatus;
