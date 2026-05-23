import crypto from 'crypto';
import { getPool } from '../database/postgres/connection';
import { ITestimonial } from '../services/interfaces/testimonial';

export interface TestimonialFilter {
  country?: string;
  publication_status?: 'borrador' | 'publicado' | 'despublicado';
}

export interface CreateTestimonialInput {
  name: string;
  photo_url: string;
  text: string;
  country: string;
  instagram_url?: string | null;
  facebook_url?: string | null;
  publication_status?: 'borrador' | 'publicado' | 'despublicado';
}

export async function listTestimonials(filter: TestimonialFilter = {}): Promise<ITestimonial[]> {
  const clauses: string[] = [];
  const values: Array<string> = [];

  if (filter.country) {
    values.push(filter.country);
    clauses.push(`country = $${values.length}`);
  }

  if (filter.publication_status) {
    values.push(filter.publication_status);
    clauses.push(`publication_status = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await getPool().query<ITestimonial>(
    `SELECT * FROM testimonials ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

export async function createTestimonial(input: CreateTestimonialInput): Promise<ITestimonial> {
  const id = crypto.randomUUID();
  const result = await getPool().query<ITestimonial>(
    `INSERT INTO testimonials (id, name, photo_url, text, country, instagram_url, facebook_url, publication_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      input.name,
      input.photo_url,
      input.text,
      input.country,
      input.instagram_url ?? null,
      input.facebook_url ?? null,
      input.publication_status ?? 'borrador',
    ]
  );
  return result.rows[0];
}

export async function updateTestimonial(id: string, input: Partial<CreateTestimonialInput>): Promise<ITestimonial | null> {
  const result = await getPool().query<ITestimonial>(
    `UPDATE testimonials
     SET name = COALESCE($2, name),
         photo_url = COALESCE($3, photo_url),
         text = COALESCE($4, text),
         country = COALESCE($5, country),
         instagram_url = COALESCE($6, instagram_url),
         facebook_url = COALESCE($7, facebook_url),
         publication_status = COALESCE($8, publication_status),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.name ?? null,
      input.photo_url ?? null,
      input.text ?? null,
      input.country ?? null,
      input.instagram_url ?? null,
      input.facebook_url ?? null,
      input.publication_status ?? null,
    ]
  );
  return result.rows[0] ?? null;
}

export async function deleteTestimonial(id: string): Promise<boolean> {
  const result = await getPool().query('DELETE FROM testimonials WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function toggleTestimonialPublication(id: string): Promise<ITestimonial | null> {
  const current = await getPool().query<ITestimonial>('SELECT * FROM testimonials WHERE id = $1 LIMIT 1', [id]);
  const testimonial = current.rows[0];
  if (!testimonial) return null;

  const nextStatus = testimonial.publication_status === 'publicado' ? 'despublicado' : 'publicado';
  const result = await getPool().query<ITestimonial>(
    `UPDATE testimonials SET publication_status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, nextStatus]
  );
  return result.rows[0] ?? null;
}