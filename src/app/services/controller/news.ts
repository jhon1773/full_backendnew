import { Request, Response } from 'express';
import { createNews, deleteNews, listNews, toggleNewsStatus, updateNews } from '../../repositories/news.repository';

function canManageNews(user: any, country: string): boolean {
  return user?.role === 'superadmin' || user?.country === country;
}

export class NewsController {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const country = req.user.role === 'superadmin' ? (typeof req.query.country === 'string' ? req.query.country : undefined) : (req.user.country ?? undefined);
    const status = typeof req.query.status === 'string' ? req.query.status as any : undefined;
    const news = await listNews({ country: country ?? undefined, status });
    return res.status(200).json({ ok: true, news });
  }

  async create(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const { title, summary, content, country, author, image_url, status } = req.body ?? {};
    if (!title || !summary || !content || !country || !author) {
      return res.status(400).json({ ok: false, error_message: 'Faltan campos obligatorios' });
    }

    if (!canManageNews(req.user, country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar noticias de tu país' });
    }

    const created = await createNews({ title, summary, content, country, author, image_url, status });
    return res.status(201).json({ ok: true, news: created });
  }

  async update(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const newsId = req.params.id;
    const current = (await listNews()).find((item) => item.id === newsId);
    if (!current) {
      return res.status(404).json({ ok: false, error_message: 'Noticia no encontrada' });
    }

    if (!canManageNews(req.user, current.country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar noticias de tu país' });
    }

    const updated = await updateNews(newsId, req.body ?? {});
    return res.status(200).json({ ok: true, news: updated });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const newsId = req.params.id;
    const current = (await listNews()).find((item) => item.id === newsId);
    if (!current) {
      return res.status(404).json({ ok: false, error_message: 'Noticia no encontrada' });
    }

    if (!canManageNews(req.user, current.country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes eliminar noticias de tu país' });
    }

    await deleteNews(newsId);
    return res.status(200).json({ ok: true, message: 'Noticia eliminada' });
  }

  async toggleStatus(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const newsId = req.params.id;
    const current = (await listNews()).find((item) => item.id === newsId);
    if (!current) {
      return res.status(404).json({ ok: false, error_message: 'Noticia no encontrada' });
    }

    if (!canManageNews(req.user, current.country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar noticias de tu país' });
    }

    const updated = await toggleNewsStatus(newsId);
    return res.status(200).json({ ok: true, news: updated });
  }
}