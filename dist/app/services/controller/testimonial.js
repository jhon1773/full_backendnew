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
exports.TestimonialController = void 0;
const testimonial_repository_1 = require("../../repositories/testimonial.repository");
function canManageTestimonial(user, country) {
    return (user === null || user === void 0 ? void 0 : user.role) === 'superadmin' || (user === null || user === void 0 ? void 0 : user.country) === country;
}
class TestimonialController {
    list(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const country = req.user.role === 'superadmin' ? (typeof req.query.country === 'string' ? req.query.country : undefined) : ((_a = req.user.country) !== null && _a !== void 0 ? _a : undefined);
            const publication_status = typeof req.query.publication_status === 'string' ? req.query.publication_status : undefined;
            const testimonials = yield (0, testimonial_repository_1.listTestimonials)({ country: country !== null && country !== void 0 ? country : undefined, publication_status });
            return res.status(200).json({ ok: true, testimonials });
        });
    }
    create(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const { name, photo_url, text, country, instagram_url, facebook_url, publication_status } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
            if (!name || !photo_url || !text || !country) {
                return res.status(400).json({ ok: false, error_message: 'Faltan campos obligatorios' });
            }
            if (!canManageTestimonial(req.user, country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar testimonios de tu país' });
            }
            const created = yield (0, testimonial_repository_1.createTestimonial)({ name, photo_url, text, country, instagram_url, facebook_url, publication_status });
            return res.status(201).json({ ok: true, testimonial: created });
        });
    }
    update(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const testimonialId = req.params.id;
            const current = (yield (0, testimonial_repository_1.listTestimonials)()).find((item) => item.id === testimonialId);
            if (!current) {
                return res.status(404).json({ ok: false, error_message: 'Testimonio no encontrado' });
            }
            if (!canManageTestimonial(req.user, current.country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar testimonios de tu país' });
            }
            const updated = yield (0, testimonial_repository_1.updateTestimonial)(testimonialId, (_a = req.body) !== null && _a !== void 0 ? _a : {});
            return res.status(200).json({ ok: true, testimonial: updated });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const testimonialId = req.params.id;
            const current = (yield (0, testimonial_repository_1.listTestimonials)()).find((item) => item.id === testimonialId);
            if (!current) {
                return res.status(404).json({ ok: false, error_message: 'Testimonio no encontrado' });
            }
            if (!canManageTestimonial(req.user, current.country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes eliminar testimonios de tu país' });
            }
            yield (0, testimonial_repository_1.deleteTestimonial)(testimonialId);
            return res.status(200).json({ ok: true, message: 'Testimonio eliminado' });
        });
    }
    togglePublication(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const testimonialId = req.params.id;
            const current = (yield (0, testimonial_repository_1.listTestimonials)()).find((item) => item.id === testimonialId);
            if (!current) {
                return res.status(404).json({ ok: false, error_message: 'Testimonio no encontrado' });
            }
            if (!canManageTestimonial(req.user, current.country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar testimonios de tu país' });
            }
            const updated = yield (0, testimonial_repository_1.toggleTestimonialPublication)(testimonialId);
            return res.status(200).json({ ok: true, testimonial: updated });
        });
    }
}
exports.TestimonialController = TestimonialController;
