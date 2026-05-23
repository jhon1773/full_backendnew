import crypto from 'crypto';
import { getPool } from '../database/postgres/connection';
import { INewsItem } from '../services/interfaces/news';

export interface NewsFilter {
  country?: string;
  status?: 'borrador' | 'publicado';
}

export interface CreateNewsInput {
  title: string;
  summary: string;
  content: string;
  country: string;
  author: string;
  image_url?: string | null;
  status?: 'borrador' | 'publicado';
}

export async function listNews(filter: NewsFilter = {}): Promise<INewsItem[]> {
  const clauses: string[] = [];
  const values: Array<string> = [];

  if (filter.country) {
    values.push(filter.country);
    clauses.push(`country = $${values.length}`);
  }

  if (filter.status) {
    values.push(filter.status);
    clauses.push(`status = $${values.length}`);
  }

  const whereClause = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const result = await getPool().query<INewsItem>(
    `SELECT * FROM news ${whereClause} ORDER BY created_at DESC`,
    values
  );
  return result.rows;
}

export async function createNews(input: CreateNewsInput): Promise<INewsItem> {
  const id = crypto.randomUUID();
  const result = await getPool().query<INewsItem>(
    `INSERT INTO news (id, title, summary, content, country, author, image_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      id,
      input.title,
      input.summary,
      input.content,
      input.country,
      input.author,
      input.image_url ?? null,
      input.status ?? 'borrador',
    ]
  );
  return result.rows[0];
}

export async function updateNews(id: string, input: Partial<CreateNewsInput>): Promise<INewsItem | null> {
  const result = await getPool().query<INewsItem>(
    `UPDATE news
     SET title = COALESCE($2, title),
         summary = COALESCE($3, summary),
         content = COALESCE($4, content),
         country = COALESCE($5, country),
         author = COALESCE($6, author),
         image_url = COALESCE($7, image_url),
         status = COALESCE($8, status),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      input.title ?? null,
      input.summary ?? null,
      input.content ?? null,
      input.country ?? null,
      input.author ?? null,
      input.image_url ?? null,
      input.status ?? null,
    ]
  );
  return result.rows[0] ?? null;
}

export async function deleteNews(id: string): Promise<boolean> {
  const result = await getPool().query('DELETE FROM news WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

export async function toggleNewsStatus(id: string): Promise<INewsItem | null> {
  const current = await getPool().query<INewsItem>('SELECT * FROM news WHERE id = $1 LIMIT 1', [id]);
  const news = current.rows[0];
  if (!news) return null;

  const nextStatus = news.status === 'publicado' ? 'borrador' : 'publicado';
  const result = await getPool().query<INewsItem>(
    `UPDATE news SET status = $2, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, nextStatus]
  );
  return result.rows[0] ?? null;
}