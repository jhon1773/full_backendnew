import crypto from 'crypto';
import { getPool } from '../database/postgres/connection';
import { IPortal } from '../services/interfaces/portal';

export async function listPortals(): Promise<IPortal[]> {
  const result = await getPool().query<IPortal>('SELECT * FROM portals ORDER BY country ASC');
  return result.rows;
}

export async function updatePortalStatus(id: string, status: 'activo' | 'inactivo'): Promise<IPortal | null> {
  const result = await getPool().query<IPortal>(
    `UPDATE portals SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] ?? null;
}

export async function createPortalSeed(name: string, country: string, status: 'activo' | 'inactivo'): Promise<IPortal> {
  const id = crypto.randomUUID();
  const result = await getPool().query<IPortal>(
    `INSERT INTO portals (id, name, country, status) VALUES ($1, $2, $3, $4) RETURNING *`,
    [id, name, country, status]
  );
  return result.rows[0];
}