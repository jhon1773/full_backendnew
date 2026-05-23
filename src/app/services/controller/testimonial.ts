import { Request, Response } from 'express';
import { createTestimonial, deleteTestimonial, listTestimonials, toggleTestimonialPublication, updateTestimonial } from '../../repositories/testimonial.repository';

function canManageTestimonial(user: any, country: string): boolean {
  return user?.role === 'superadmin' || user?.country === country;
}

export class TestimonialController {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const country = req.user.role === 'superadmin' ? (typeof req.query.country === 'string' ? req.query.country : undefined) : (req.user.country ?? undefined);
    const publication_status = typeof req.query.publication_status === 'string' ? req.query.publication_status as any : undefined;
    const testimonials = await listTestimonials({ country: country ?? undefined, publication_status });
    return res.status(200).json({ ok: true, testimonials });
  }

  async create(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const { name, photo_url, text, country, instagram_url, facebook_url, publication_status } = req.body ?? {};
    if (!name || !photo_url || !text || !country) {
      return res.status(400).json({ ok: false, error_message: 'Faltan campos obligatorios' });
    }

    if (!canManageTestimonial(req.user, country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar testimonios de tu país' });
    }

    const created = await createTestimonial({ name, photo_url, text, country, instagram_url, facebook_url, publication_status });
    return res.status(201).json({ ok: true, testimonial: created });
  }

  async update(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const testimonialId = req.params.id;
    const current = (await listTestimonials()).find((item) => item.id === testimonialId);
    if (!current) {
      return res.status(404).json({ ok: false, error_message: 'Testimonio no encontrado' });
    }

    if (!canManageTestimonial(req.user, current.country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar testimonios de tu país' });
    }

    const updated = await updateTestimonial(testimonialId, req.body ?? {});
    return res.status(200).json({ ok: true, testimonial: updated });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const testimonialId = req.params.id;
    const current = (await listTestimonials()).find((item) => item.id === testimonialId);
    if (!current) {
      return res.status(404).json({ ok: false, error_message: 'Testimonio no encontrado' });
    }

    if (!canManageTestimonial(req.user, current.country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes eliminar testimonios de tu país' });
    }

    await deleteTestimonial(testimonialId);
    return res.status(200).json({ ok: true, message: 'Testimonio eliminado' });
  }

  async togglePublication(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais', 'editor'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const testimonialId = req.params.id;
    const current = (await listTestimonials()).find((item) => item.id === testimonialId);
    if (!current) {
      return res.status(404).json({ ok: false, error_message: 'Testimonio no encontrado' });
    }

    if (!canManageTestimonial(req.user, current.country)) {
      return res.status(403).json({ ok: false, error_message: 'Solo puedes gestionar testimonios de tu país' });
    }

    const updated = await toggleTestimonialPublication(testimonialId);
    return res.status(200).json({ ok: true, testimonial: updated });
  }
}