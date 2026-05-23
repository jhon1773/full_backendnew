import { Request, Response } from 'express';
import { createContactRequest, deleteContactRequest, findContactRequestById, listContactRequests, updateContactRequestStatus } from '../../repositories/contact-request.repository';

function getScopedCountry(user: any): string | null {
  if (!user) return null;
  if (user.role === 'superadmin') return null;
  return user.country ?? null;
}

function canAccessCountry(user: any, country: string): boolean {
  return user?.role === 'superadmin' || user?.country === country;
}

export class ContactRequestController {
  async createPublic(req: Request, res: Response): Promise<Response> {
    const { name, email, phone, purpose, country } = req.body ?? {};
    if (!name || !email || !phone || !purpose || !country) {
      return res.status(400).json({ ok: false, error_message: 'Faltan campos obligatorios' });
    }

    const created = await createContactRequest({ name, email, phone, purpose, country });
    return res.status(201).json({ ok: true, request: created });
  }

  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const status = typeof req.query.status === 'string' ? req.query.status as any : undefined;
    const countryQuery = typeof req.query.country === 'string' ? req.query.country : undefined;
    const country = req.user.role === 'superadmin' ? countryQuery : getScopedCountry(req.user);
    const requests = await listContactRequests({ status, country: country ?? undefined });
    return res.status(200).json({ ok: true, requests });
  }

  async detail(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const requestId = req.params.id;
    const requestRow = await findContactRequestById(requestId);
    if (!requestRow) {
      return res.status(404).json({ ok: false, error_message: 'Solicitud no encontrada' });
    }

    if (!canAccessCountry(req.user, requestRow.country)) {
      return res.status(403).json({ ok: false, error_message: 'No puedes ver solicitudes de este país' });
    }

    return res.status(200).json({ ok: true, request: requestRow });
  }

  async updateStatus(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const requestId = req.params.id;
    const { status } = req.body ?? {};
    if (!['pendiente', 'gestionada', 'respondida'].includes(status)) {
      return res.status(400).json({ ok: false, error_message: 'Estado inválido' });
    }

    const requestRow = await findContactRequestById(requestId);
    if (!requestRow) {
      return res.status(404).json({ ok: false, error_message: 'Solicitud no encontrada' });
    }

    if (!canAccessCountry(req.user, requestRow.country)) {
      return res.status(403).json({ ok: false, error_message: 'No puedes modificar solicitudes de este país' });
    }

    const updated = await updateContactRequestStatus(requestId, status);
    return res.status(200).json({ ok: true, request: updated });
  }

  async delete(req: Request, res: Response): Promise<Response> {
    if (!req.user || !['superadmin', 'admin_pais'].includes(req.user.role)) {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const requestId = req.params.id;
    const requestRow = await findContactRequestById(requestId);
    if (!requestRow) {
      return res.status(404).json({ ok: false, error_message: 'Solicitud no encontrada' });
    }

    if (!canAccessCountry(req.user, requestRow.country)) {
      return res.status(403).json({ ok: false, error_message: 'No puedes eliminar solicitudes de este país' });
    }

    await deleteContactRequest(requestId);
    return res.status(200).json({ ok: true, message: 'Solicitud eliminada' });
  }
}