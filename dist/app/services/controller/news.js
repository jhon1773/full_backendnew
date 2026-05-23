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
exports.NewsController = void 0;
const news_repository_1 = require("../../repositories/news.repository");
function canManageNews(user, country) {
    return (user === null || user === void 0 ? void 0 : user.role) === 'superadmin' || (user === null || user === void 0 ? void 0 : user.country) === country;
}
class NewsController {
    list(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const country = req.user.role === 'superadmin' ? (typeof req.query.country === 'string' ? req.query.country : undefined) : ((_a = req.user.country) !== null && _a !== void 0 ? _a : undefined);
            const status = typeof req.query.status === 'string' ? req.query.status : undefined;
            const news = yield (0, news_repository_1.listNews)({ country: country !== null && country !== void 0 ? country : undefined, status });
            return res.status(200).json({ ok: true, news });
        });
    }
    create(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const { title, summary, content, country, author, image_url, status } = (_a = req.body) !== null && _a !== void 0 ? _a : {};
            if (!title || !summary || !content || !country || !author) {
                return res.status(400).json({ ok: false, error_message: 'Faltan campos obligatorios' });
            }
            if (!canManageNews(req.user, country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar noticias de tu país' });
            }
            const created = yield (0, news_repository_1.createNews)({ title, summary, content, country, author, image_url, status });
            return res.status(201).json({ ok: true, news: created });
        });
    }
    update(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const newsId = req.params.id;
            const current = (yield (0, news_repository_1.listNews)()).find((item) => item.id === newsId);
            if (!current) {
                return res.status(404).json({ ok: false, error_message: 'Noticia no encontrada' });
            }
            if (!canManageNews(req.user, current.country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar noticias de tu país' });
            }
            const updated = yield (0, news_repository_1.updateNews)(newsId, (_a = req.body) !== null && _a !== void 0 ? _a : {});
            return res.status(200).json({ ok: true, news: updated });
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const newsId = req.params.id;
            const current = (yield (0, news_repository_1.listNews)()).find((item) => item.id === newsId);
            if (!current) {
                return res.status(404).json({ ok: false, error_message: 'Noticia no encontrada' });
            }
            if (!canManageNews(req.user, current.country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes eliminar noticias de tu país' });
            }
            yield (0, news_repository_1.deleteNews)(newsId);
            return res.status(200).json({ ok: true, message: 'Noticia eliminada' });
        });
    }
    toggleStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
                return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
            }
            const newsId = req.params.id;
            const current = (yield (0, news_repository_1.listNews)()).find((item) => item.id === newsId);
            if (!current) {
                return res.status(404).json({ ok: false, error_message: 'Noticia no encontrada' });
            }
            if (!canManageNews(req.user, current.country)) {
                return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar noticias de tu país' });
            }
            const updated = yield (0, news_repository_1.toggleNewsStatus)(newsId);
            return res.status(200).json({ ok: true, news: updated });
        });
    }
}
exports.NewsController = NewsController;
