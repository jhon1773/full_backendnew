import { Request, Response } from 'express';
import { getPool } from '../../database/postgres/connection';

export class DashboardController {
  async getMetrics(req: Request, res: Response): Promise<Response> {
    const user = req.user;

    try {
      if (!user) {
        return res.status(401).json({ ok: false, error_message: 'No autenticado' });
      }

      const countryFilter = user.role === 'superadmin' ? null : user.country;

      const requestParams: Array<string> = [];
      const testimonialParams: Array<string> = [];
      const newsParams: Array<string> = [];

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

      const [requests, testimonials, news] = await Promise.all([
        getPool().query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM contact_requests WHERE ${requestWhere}`,
          requestParams
        ),
        getPool().query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM testimonials WHERE ${testimonialWhere}`,
          testimonialParams
        ),
        getPool().query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM news WHERE ${newsWhere}`,
          newsParams
        ),
      ]);

      const metrics = {
        role: user.role,
        country: user.country ?? null,
        pendingRequests: Number(requests.rows[0]?.count ?? '0'),
        publishedTestimonials: Number(testimonials.rows[0]?.count ?? '0'),
        activeNews: Number(news.rows[0]?.count ?? '0'),
      };

      return res.status(200).json({ ok: true, metrics });
    } catch (_error) {
      return res.status(500).json({ ok: false, error_message: 'Error obteniendo métricas' });
    }
  }
}