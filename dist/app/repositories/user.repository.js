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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUser = exports.findUserById = exports.findUserByPhone = exports.findUserByEmail = exports.toPublicUser = void 0;
const crypto_1 = __importDefault(require("crypto"));
const connection_1 = require("../database/postgres/connection");
function toPublicUser(user) {
    const { password } = user, publicUser = __rest(user, ["password"]);
    return publicUser;
}
exports.toPublicUser = toPublicUser;
function findUserByEmail(email) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.findUserByEmail = findUserByEmail;
function findUserByPhone(phone) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.findUserByPhone = findUserByPhone;
function findUserById(id) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield (0, connection_1.getPool)().query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        return (_a = result.rows[0]) !== null && _a !== void 0 ? _a : null;
    });
}
exports.findUserById = findUserById;
function createUser(input) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const userId = crypto_1.default.randomUUID();
        const result = yield (0, connection_1.getPool)().query(`INSERT INTO users (id, name, email, phone, password, role, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`, [userId, input.name, input.email, input.phone, input.password, input.role, (_a = input.country) !== null && _a !== void 0 ? _a : null]);
        return result.rows[0];
    });
}
exports.createUser = createUser;
