import { getPool } from '../database/postgres/connection';

export interface TokenBlacklistRow {
  id: number;
  token: string;
  expires_at: Date;
}

export async function findBlacklistedToken(token: string): Promise<TokenBlacklistRow | null> {
  const result = await getPool().query<TokenBlacklistRow>('SELECT * FROM token_blacklist WHERE token = $1 LIMIT 1', [token]);
  return result.rows[0] ?? null;
}

export async function addBlacklistedToken(token: string, expiresAt: Date): Promise<TokenBlacklistRow> {
  const result = await getPool().query<TokenBlacklistRow>(
    `INSERT INTO token_blacklist (token, expires_at)
     VALUES ($1, $2)
     RETURNING *`,
    [token, expiresAt]
  );

  return result.rows[0];
}
