-- pgAdmin/PostgreSQL base setup for the migrated version of the project.
-- Note: pgAdmin manages PostgreSQL, not MongoDB. The current backend now uses PostgreSQL.

CREATE DATABASE cms_admin_movil;

-- Connect to the database before running the rest.
-- In pgAdmin, select cms_admin_movil and run the following schema.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(180) UNIQUE NOT NULL,
  phone VARCHAR(40) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('superadmin', 'admin_pais', 'editor')),
  country VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS token_blacklist (
  id BIGSERIAL PRIMARY KEY,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at
  ON token_blacklist (expires_at);

-- Example seed user (password hash is placeholder; use a real bcrypt hash in a migration)
-- INSERT INTO users (id, name, email, phone, password, role, country)
-- VALUES (
--   gen_random_uuid(),
--   'Admin Demo',
--   'admin@example.com',
--   '3001234567',
--   '$2a$10$examplehashexamplehashexamplehashexamplehashexamplehash',
--   'admin_pais',
--   'Colombia'
-- );
