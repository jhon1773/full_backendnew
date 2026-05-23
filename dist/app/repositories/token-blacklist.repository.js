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
exports.addBlacklistedToken = exports.findBlacklistedToken = void 0;
const connection_1 = require("../database/postgres/connection");
function findBlacklistedToken(token) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('SELECT * FROM token_blacklist WHERE token = $1 LIMIT 1', [token]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.findBlacklistedToken = findBlacklistedToken;
function addBlacklistedToken(token, expiresAt) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query(`INSERT INTO token_blacklist (token, expires_at)
     VALUES ($1, $2)
     RETURNING *`, [token, expiresAt]);
        return result.rows[0];
    });
}
exports.addBlacklistedToken = addBlacklistedToken;
