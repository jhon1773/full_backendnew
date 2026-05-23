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
exports.ContactRequestController = void 0;
const contact_request_repository_1 = require("../../repositories/contact-request.repository");
function getScopedCountry(user) {
    var _a;
    if (!user)
        return null;
    if (user.role === 'superadmin')
        return null;
    return (_a = user.country) !== null && _a !== void 0 ? _a : null;
}
function canAccessCountry(user, country) {
    return (user === null || user === void 0 ? void 0 : user.role) === 'superadmin' || (user === null || user === void 0 ? void 0 : user.country) === country;
}
class ContactRequestController {
    createPublic(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const { name, email, phone, purpose, country } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
            if (!name || !email || !phone || !purpose || !country) {
                return res.status(400).json({ ok: false, error_message: 'Faltan campos obligatorios' });
            }
            const created = yield (0, contact_request_repository_1.createContactRequest)({ name, email, phone, purpose, country });
            return res.status(201).json({ ok: true, request: created });
        });
    }
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            const countryQuery = typeof req.query.country === 'string' ? req.query.country : undefined;
            const country = req.user.role === 'superadmin' ? countryQuery : getScopedCountry(req.user);
            const requests = yield (0, contact_request_repository_1.listContactRequests)({ status, country: country !== null && country !== void 0 ? country : undefined });
            return res.status(200).json({ ok: true, requests });
        });
    }
    detail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const requestId = req.params.id;
            const requestRow = yield (0, contact_request_repository_1.findContactRequestById)(requestId);
            if (!requestRow) {
                return res.status(404).json({ ok: false, error_message: 'Solicitud no encontrada' });
            }
            if (!canAccessCountry(req.user, requestRow.country)) {
                return res.status(403).json({ ok: false, error_message: 'No puedes ver solicitudes de este país' });
            }
            return res.status(200).json({ ok: true, request: requestRow });
        });
    }
    updateStatus(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const requestId = req.params.id;
            const { status } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
            if (!['pendiente', 'gestionada', 'respondida'].includes(status)) {
                return res.status(400).json({ ok: false, error_message: 'Estado inválido' });
            }
            const requestRow = yield (0, contact_request_repository_1.findContactRequestById)(requestId);
            if (!requestRow) {
                return res.status(404).json({ ok: false, error_message: 'Solicitud no encontrada' });
            }
            if (!canAccessCountry(req.user, requestRow.country)) {
                return res.status(403).json({ ok: false, error_message: 'No puedes modificar solicitudes de este país' });
            }
            const updated = yield (0, contact_request_repository_1.updateContactRequestStatus)(requestId, status);
            return res.status(200).json({ ok: true, request: updated });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const requestId = req.params.id;
            const requestRow = yield (0, contact_request_repository_1.findContactRequestById)(requestId);
            if (!requestRow) {
                return res.status(404).json({ ok: false, error_message: 'Solicitud no encontrada' });
            }
            if (!canAccessCountry(req.user, requestRow.country)) {
                return res.status(403).json({ ok: false, error_message: 'No puedes eliminar solicitudes de este país' });
            }
            yield (0, contact_request_repository_1.deleteContactRequest)(requestId);
            return res.status(200).json({ ok: true, message: 'Solicitud eliminada' });
        });
    }
}
exports.ContactRequestController = ContactRequestController;
