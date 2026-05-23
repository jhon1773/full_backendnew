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
exports.PortalController = void 0;
const portal_repository_1 = require("../../repositories/portal.repository");
class PortalController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || req.user.role !== 'superadmin') {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const portals = yield (0, portal_repository_1.listPortals)();
            return res.status(200).json({ ok: true, portals });
        });
    }
}
exports.PortalController = PortalController;
