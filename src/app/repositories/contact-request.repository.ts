import crypto from 'crypto';
import { getPool } from '../database/postgres/connection';
import { IContactRequest } from '../services/interfaces/contact-request';

export interface ContactRequestFilter {
  status?: 'pendiente' | 'gestionada' | 'respondida';
  country?: string;
}

export interface CreateContactRequestInput {
  name: string;
  email: string;
  phone: string;
  purpose: string;
  country: string;
}

export async function createContactRequest(input: CreateContactRequestInput): Promise<IContactRequest> {
  const id = crypto.randomUUID();
  const result = await getPool().query<IContactRequest>(
    `INSERT INTO contact_requests (id, name, email, phone, purpose, country, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pendiente')
     RETURNING *`,
    [id, input.name, input.email, input.phone, input.purpose, input.country]
  );
  return result.rows[0];
}

export async function listContactRequests(filter: ContactRequestFilter = {}): Promise<IContactRequest[]> {
  const clauses: string[] = [];
  const values: Array<string> = [];

  if (filter.status) {
    values.push(filter.status);
    clauses.push(`status = $${values.length}`);
  }

  if (filter.country) {
    values.push(filter.country);
    clauses.push(`country = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await getPool().query<IContactRequest>(
    `SELECT * FROM contact_requests ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

export async function findContactRequestById(id: string): Promise<IContactRequest | null> {
  const result = await getPool().query<IContactRequest>('SELECT * FROM contact_requests WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ?? null;
}

export async function updateContactRequestStatus(id: string, status: 'pendiente' | 'gestionada' | 'respondida'): Promise<IContactRequest | null> {
  const result = await getPool().query<IContactRequest>(
    `UPDATE contact_requests SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] ?? null;
}

export async function deleteContactRequest(id: string): Promise<boolean> {
  const result = await getPool().query('DELETE FROM contact_requests WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}