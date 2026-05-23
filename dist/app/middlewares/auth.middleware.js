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
exports.authorize = exports.authenticate = void 0;
const jwt_1 = require("../helpers/jwt");
const token_blacklist_repository_1 = require("../repositories/token-blacklist.repository");
const user_repository_1 = require("../repositories/user.repository");
function authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) {
                res.status(401).json({ ok: false, error_message: 'No se proporcionó token' });
                return;
            }
            const token = authHeader.split(' ')[1];
            // Verifica si el token está en la blacklist (cerró sesión previamente)
            const black = yield (0, token_blacklist_repository_1.findBlacklistedToken)(token);
            if (black) {
                res.status(401).json({ ok: false, error_message: 'Token inválido o expirado (logout)' });
                return;
            }
            const [valid, result] = (0, jwt_1.checkToken)(token);
            if (!valid) {
                res.status(401).json({ ok: false, error_message: 'Token inválido o expirado' });
                return;
            }
            if (typeof result !== 'string') {
                res.status(401).json({ ok: false, error_message: 'Token inválido o expirado' });
                return;
            }
            const user = yield (0, user_repository_1.findUserById)(result);
            if (!user) {
                res.status(401).json({ ok: false, error_message: 'Usuario no encontrado' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(500).json({ ok: false, error_message: 'Error de autenticación' });
        }
    });
}
exports.authenticate = authenticate;
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ ok: false, error_message: 'No autenticado' });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                ok: false,
                error_message: 'Acceso denegado: no tienes permisos para este módulo'
            });
            return;
        }
        next();
    };
}
exports.authorize = authorize;
