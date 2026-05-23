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
exports.deleteContactRequest = exports.updateContactRequestStatus = exports.findContactRequestById = exports.listContactRequests = exports.createContactRequest = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../database/postgres/connection");
function createContactRequest(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = crypto_1.default.randomUUID();
        const result = yield (0, connection_1.getPool)().query(`INSERT INTO contact_requests (id, name, email, phone, purpose, country, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
     RETURNING *`, [id, input.name, input.email, input.phone, input.purpose, input.country]);
        return result.rows[0];
    });
}
exports.createContactRequest = createContactRequest;
function listContactRequests(filter = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const clauses = [];
        const values = [];
        if (filter.status) {
            values.push(filter.status);
            clauses.push(`status = $${values.length}`);
        }
        if (filter.country) {
            values.push(filter.country);
            clauses.push(`country = $${values.length}`);
        }
        const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
        const result = yield (0, connection_1.getPool)().query(`SELECT * FROM contact_requests ${whereClause} ORDER BY created_at DESC`, values);
        return result.rows;
    });
}
exports.listContactRequests = listContactRequests;
function findContactRequestById(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('SELECT * FROM contact_requests WHERE id = $1 LIMIT 1', [id]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.findContactRequestById = findContactRequestById;
function updateContactRequestStatus(id, status) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query(`UPDATE contact_requests SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, status]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.updateContactRequestStatus = updateContactRequestStatus;
function deleteContactRequest(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('DELETE FROM contact_requests WHERE id = $1', [id]);
        return ((_a = result.rowCount) !== null && _a !== void 0 ? _a : 0) > 0;
    });
}
exports.deleteContactRequest = deleteContactRequest;
