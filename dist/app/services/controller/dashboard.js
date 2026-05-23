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
exports.DashboardController = void 0;
const connection_1 = require("../../database/postgres/connection");
class DashboardController {
    getMetrics(req, res) {
        var _a, _b, _c, _d, _e, _f, _g;
        return __awaiter(this, void 0, void 0, function* () {
            const user = req.user;
            try {
                if (!user) {
                    return res.status(401).json({ ok: false, error_message: 'No autenticado' });
                }
                const countryFilter = user.role === 'superadmin' ? null : user.country;
                const requestParams = [];
                const testimonialParams = [];
                const newsParams = [];
                const requestWhere = countryFilter ? 'country = $1 AND status = $2' : "status = 'pendiente'";
                if (countryFilter) {
                    requestParams.push(countryFilter, 'pendiente');
                }
                const testimonialWhere = countryFilter ? 'country = $1 AND publication_status = $2' : "publication_status = 'publicado'";
                if (countryFilter) {
                    testimonialParams.push(countryFilter, 'publicado');
                }
                const newsWhere = countryFilter ? 'country = $1 AND status = $2' : "status = 'publicado'";
                if (countryFilter) {
                    newsParams.push(countryFilter, 'publicado');
                }
                const [requests, testimonials, news] = yield Promise.all([
                    (0, connection_1.getPool)().query(`SELECT COUNT(*)::text AS count FROM contact_requests WHERE ${requestWhere}`, requestParams),
                    (0, connection_1.getPool)().query(`SELECT COUNT(*)::text AS count FROM testimonials WHERE ${testimonialWhere}`, testimonialParams),
                    (0, connection_1.getPool)().query(`SELECT COUNT(*)::text AS count FROM news WHERE ${newsWhere}`, newsParams),
                ]);
                const metrics = {
                    role: user.role,
                    country: (_a = user.country) !== null && _a !== void 0 ? _a : null,
                    pendingRequests: Number((_c = (_b = requests.rows[0]) === null || _b === void 0 ? void 0 : _b.count) !== null && _c !== void 0 ? _c : '0'),
                    publishedTestimonials: Number((_e = (_d = testimonials.rows[0]) === null || _d === void 0 ? void 0 : _d.count) !== null && _e !== void 0 ? _e : '0'),
                    activeNews: Number((_g = (_f = news.rows[0]) === null || _f === void 0 ? void 0 : _f.count) !== null && _g !== void 0 ? _g : '0'),
                };
                return res.status(200).json({ ok: true, metrics });
            }
            catch (_error) {
                return res.status(500).json({ ok: false, error_message: 'Error obteniendo métricas' });
            }
        });
    }
}
exports.DashboardController = DashboardController;
