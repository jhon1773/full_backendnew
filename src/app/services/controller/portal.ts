import { Request, Response } from 'express';
import { listPortals } from '../../repositories/portal.repository';

export class PortalController {
  async list(req: Request, res: Response): Promise<Response> {
    if (!req.user || req.user.role !== 'superadmin') {
      return res.status(403).json({ ok: false, error_message: 'Acceso denegado' });
    }

    const portals = await listPortals();
    return res.status(200).json({ ok: true, portals });
  }
}