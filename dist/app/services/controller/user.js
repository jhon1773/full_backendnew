"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.UserController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../../helpers/jwt");
const user_repository_1 = require("../../repositories/user.repository");
const token_blacklist_repository_1 = require("../../repositories/token-blacklist.repository");
class UserController {
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // let  name = req.body.name;
            let { email, phone, password } = req.body;
            try {
                const find_email = yield (0, user_repository_1.findUserByEmail)(email);
                if (find_email)
                    return res.status(400).json({ ok: false, error_message: 'este correo ya esta registrado' });
                const find_phone = yield (0, user_repository_1.findUserByPhone)(phone);
                if (find_phone)
                    return res.status(400).json({ ok: false, error_message: 'este numero de telefono ya esta registrado' });
                const salt = bcryptjs_1.default.genSaltSync(10);
                password = bcryptjs_1.default.hashSync(password, salt);
                const user = {
                    name: req.body.name,
                    email,
                    phone,
                    password,
                    role: req.body.role || 'editor',
                    country: req.body.country || null,
                };
                const user_model = yield (0, user_repository_1.createUser)(Object.assign({}, user));
                const token = yield (0, jwt_1.generateToken)(user_model.id, user_model.role, user_model.country); // generacion de jwt   
                return res.status(200).json({
                    message: 'User created successfully',
                    user: (0, user_repository_1.toPublicUser)(user_model),
                    token
                });
            }
            catch (error) {
                console.error('error al crear el usuario', error);
                return res.status(400).json({ ok: false, error_message: 'error al crear el usuario' });
            }
        });
    }
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const find_user = yield (0, user_repository_1.findUserByEmail)(email);
                if (!find_user)
                    return res.status(400).json({ ok: false, error_message: 'email no encontrado' });
                const validPassword = bcryptjs_1.default.compareSync(password, find_user.password);
                if (!validPassword)
                    return res.status(400).json({ ok: false, error_message: 'la contraseña no es valida' });
                const token = yield (0, jwt_1.generateToken)(find_user.id, find_user.role, find_user.country);
                return res.status(200).json({ ok: true, message: 'usuario logeado', user: (0, user_repository_1.toPublicUser)(find_user), token });
            }
            catch (error) {
                console.error('error en el login', error);
                return res.status(400).json({ ok: false, error_message: `error al intentar logearse ${error}` });
            }
        });
    }
    logout(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const authHeader = req.headers['authorization'];
                if (!authHeader)
                    return res.status(401).json({ ok: false, error_message: 'No se proporcionó token' });
                const token = authHeader.split(' ')[1];
                // decodificar el token para obtener su expiración
                const decoded = yield Promise.resolve().then(() => __importStar(require('jsonwebtoken'))).then(m => m.decode(token));
                const exp = decoded && decoded.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 1000 * 60 * 60 * 48);
                // guardar en blacklist
                yield (0, token_blacklist_repository_1.addBlacklistedToken)(token, exp);
                return res.status(200).json({ ok: true, message: 'Sesión cerrada' });
            }
            catch (error) {
                console.error('error en logout', error);
                return res.status(500).json({ ok: false, error_message: 'Error cerrando sesión' });
            }
        });
    }
}
exports.UserController = UserController;
