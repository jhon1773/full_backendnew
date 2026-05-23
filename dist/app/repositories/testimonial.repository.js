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
exports.toggleTestimonialPublication = exports.deleteTestimonial = exports.updateTestimonial = exports.createTestimonial = exports.listTestimonials = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../database/postgres/connection");
function listTestimonials(filter = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const clauses = [];
        const values = [];
        if (filter.country) {
            values.push(filter.country);
            clauses.push(`country = $${values.length}`);
        }
        if (filter.publication_status) {
            values.push(filter.publication_status);
            clauses.push(`publication_status = $${values.length}`);
        }
        const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        const result = yield (0, connection_1.getPool)().query(`SELECT * FROM testimonials ${whereClause} ORDER BY created_at DESC`, values);
        return result.rows;
    });
}
exports.listTestimonials = listTestimonials;
function createTestimonial(input) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const id = crypto_1.default.randomUUID();
        const result = yield (0, connection_1.getPool)().query(`INSERT INTO testimonials (id, name, photo_url, text, country, instagram_url, facebook_url, publication_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`, [
            id,
            input.name,
            input.photo_url,
            input.text,
            input.country,
            (_a = input.instagram_url) !== null && _a !== void 0 ? _a : null,
            (_b = input.facebook_url) !== null && _b !== void 0 ? _b : null,
            (_c = input.publication_status) !== null && _c !== void 0 ? _c : 'borrador',
        ]);
        return result.rows[0];
    });
}
exports.createTestimonial = createTestimonial;
function updateTestimonial(id, input) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query(`UPDATE testimonials
     SET name = COALESCE($2, name),
         photo_url = COALESCE($3, photo_url),
         text = COALESCE($4, text),
         country = COALESCE($5, country),
         instagram_url = COALESCE($6, instagram_url),
         facebook_url = COALESCE($7, facebook_url),
         publication_status = COALESCE($8, publication_status),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`, [
            id,
            (_a = input.name) !== null && _a !== void 0 ? _a : null,
            (_b = input.photo_url) !== null && _b !== void 0 ? _b : null,
            (_c = input.text) !== null && _c !== void 0 ? _c : null,
            (_d = input.country) !== null && _d !== void 0 ? _d : null,
            (_e = input.instagram_url) !== null && _e !== void 0 ? _e : null,
            (_f = input.facebook_url) !== null && _f !== void 0 ? _f : null,
            (_g = input.publication_status) !== null && _g !== void 0 ? _g : null,
        ]);
        return (_h = result.rows[0]) !== null && _h !== void 0 ? _h : null;
    });
}
exports.updateTestimonial = updateTestimonial;
function deleteTestimonial(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('DELETE FROM testimonials WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
exports.deleteTestimonial = deleteTestimonial;
function toggleTestimonialPublication(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const current = yield (0, connection_1.getPool)().query('SELECT * FROM testimonials WHERE id = $1 LIMIT 1', [id]);
        const testimonial = current.rows[0];
        if (!testimonial)
            return null;
        const nextStatus = testimonial.publication_status === 'publicado' ? 'despublicado' : 'publicado';
        const result = yield (0, connection_1.getPool)().query(`UPDATE testimonials SET publication_status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, nextStatus]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.toggleTestimonialPublication = toggleTestimonialPublication;
