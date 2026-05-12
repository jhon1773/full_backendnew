import crypto from 'crypto';
import { getPool } from '../database/postgres/connection';

export interface UserRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'superadmin' | 'admin_pais' | 'editor';
  country: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'superadmin' | 'admin_pais' | 'editor';
  country?: string | null;
}

export function toPublicUser(user: UserRow) {
  const { password, ...publicUser } = user;
  return publicUser;
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const result = await getPool().query<UserRow>('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]);
  return result.rows[0] ?? null;
}

export async function findUserByPhone(phone: string): Promise<UserRow | null> {
  const result = await getPool().query<UserRow>('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
  return result.rows[0] ?? null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const result = await getPool().query<UserRow>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0] ?? null;
}

export async function createUser(input: CreateUserInput): Promise<UserRow> {
  const userId = crypto.randomUUID();
  const result = await getPool().query<UserRow>(
    `INSERT INTO users (id, name, email, phone, password, role, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [userId, input.name, input.email, input.phone, input.password, input.role, input.country ?? null]
  );

  return result.rows[0];
}
