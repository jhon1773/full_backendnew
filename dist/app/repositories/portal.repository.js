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
exports.createPortalSeed = exports.updatePortalStatus = exports.listPortals = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../database/postgres/connection");
function listPortals() {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('SELECT * FROM portals ORDER BY country ASC');
        return result.rows;
    });
}
exports.listPortals = listPortals;
function updatePortalStatus(id, status) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query(`UPDATE portals SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`, [id, status]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.updatePortalStatus = updatePortalStatus;
function createPortalSeed(name, country, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = crypto_1.default.randomUUID();
        const result = yield (0, connection_1.getPool)().query(`INSERT INTO portals (id, name, country, status) VALUES ($1, $2, $3, $4) RETURNING *`, [id, name, country, status]);
        return result.rows[0];
    });
}
exports.createPortalSeed = createPortalSeed;
