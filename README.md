**Proyecto**

API backend base para el CMS Admin Móvil — integra autenticación JWT y dashboard por rol/país.

**Estado actual**
- RF-01 (Autenticación): implementado — endpoints de `create`, `login` y `logout` con JWT y blacklist.
- RF-02 (Dashboard por rol/país): implementado parcialmente — endpoint `/api/v1/dashboard/metrics` protegido por rol.

**Archivo de configuración**
Debe existir `src/config.ts`. Ejemplo mínimo (ya incluido en el repo):

```ts
export const CONFIG = {
    db: process.env.DB_CONNECTION || 'postgresql://postgres:postgres@127.0.0.1:5432/backend',
    db_test: process.env.DB_CONNECTION_TEST || 'postgresql://postgres:postgres@127.0.0.1:5432/backend_test',
    app: { port: process.env.APP_PORT || process.env.PORT || 3000 },
    jwt_key: process.env.JWT_SECRET || process.env.JWT_KEY || 'dev_jwt_secret',
};
```

**Instalación & ejecución**
1. Instala dependencias:

```bash
npm install
```

2. Ejecuta en desarrollo:

```bash
npm run dev
```

La API escucha en `http://localhost:3000` por defecto.

**Rutas principales**
- `POST /api/v1/user/create` — Crear usuario. Campos JSON: `name`, `email`, `phone`, `password`, `role` (opcional), `country` (opcional).
- `POST /api/v1/user/` — Login. JSON: `email`, `password`. Respuesta contiene `token` y `user`.
- `GET /api/v1/user/me` — Devuelve la sesión actual autenticada, incluyendo `user`, `modules` permitidos y país/rol.
- `POST /api/v1/user/logout` — Logout (requiere `Authorization: Bearer <token>`). Añade token a blacklist hasta su expiración.
- `GET /api/v1/dashboard/metrics` — Métricas según rol (requiere `Authorization` y autorización por rol).

**Front básico**
- El backend ahora sirve un front de prueba en la ruta raíz `/`.
- Incluye formularios para crear usuario, iniciar sesión, consultar métricas y cerrar sesión.
- Archivos: `src/public/index.html`, `src/public/styles.css`, `src/public/app.js`.

**pgAdmin / PostgreSQL**
- `pgAdmin` administra PostgreSQL; no puede conectarse directamente a MongoDB.
- El proyecto ya usa PostgreSQL para usuarios, autenticación y blacklist de tokens.
- Si quieres cambiar la base de conexión, usa el script `docs/pgadmin-setup.sql` como referencia de esquema.

**Ejemplos (curl)**
- Crear usuario:

```bash
curl -X POST http://localhost:3000/api/v1/user/create \
    -H 'Content-Type: application/json' \
    -d '{"name":"Admin","email":"admin@example.com","phone":"123456789","password":"secret","role":"admin_pais","country":"Colombia"}'
```

- Login:

```bash
curl -X POST http://localhost:3000/api/v1/user/ \
    -H 'Content-Type: application/json' \
    -d '{"email":"admin@example.com","password":"secret"}'
```

- Usar token en endpoints protegidos:

```bash
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/v1/dashboard/metrics
```

- Logout:

```bash
curl -X POST http://localhost:3000/api/v1/user/logout \
    -H "Authorization: Bearer <TOKEN>"
```

**Comportamiento de tokens**
- Los tokens JWT contienen `id`, `role` y `country` en su payload y expiran en 48h.
- Al `logout` el token se guarda en una colección `TokenBlacklist` hasta su fecha de expiración; el middleware deniega cualquier token en esa blacklist.
- Si el frontend recibe `401`, debe borrar el token local y redirigir al login.

**Roles reales**
- Los roles soportados por el backend son `superadmin`, `admin_pais` y `editor`.
- No existe un rol genérico `admin`; si el frontend usa esa etiqueta, debe mapearla a uno de los tres roles reales.
- `superadmin` ve todo, `admin_pais` queda limitado a su país y `editor` solo opera contenido permitido para su país.

**Recomendaciones para cliente móvil**
- Almacenar el token en almacenamiento seguro (`SecureStorage`, `EncryptedSharedPreferences`) según plataforma.
- En cada petición usar `Authorization: Bearer <token>`.
- Si el servidor responde 401 por expiración o token blacklist, borrar token local y redirigir a login.

**Pruebas y seguimiento**
- Para pruebas rápidas puedes usar `curl` o Postman con los ejemplos anteriores.
- Para integrar tests unitarios añadir frameworks (Jest, supertest) y crear suites para `user` y `dashboard`.

**Archivos relevantes**
- `src/app/helpers/jwt.ts` — generación y verificación de JWT.
- `src/app/middlewares/auth.middleware.ts` — autentica y autoriza rutas.
- `src/app/models/user.ts` — modelo de usuario.
- `src/app/models/tokenBlacklist.ts` — modelo para tokens invalidados.
- `src/app/services/controller/user.ts` — lógica de `create`, `login`, `logout`.
- `src/app/services/controller/dashboard.ts` — lógica del dashboard por rol.

Si quieres, puedo:
- Generar documentación OpenAPI (Swagger) automáticamente.
- Añadir tests de integración para los endpoints mencionados.
- Preparar un pequeño script Postman/Insomnia con la colección de ejemplo.
