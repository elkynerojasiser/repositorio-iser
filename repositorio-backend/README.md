# Repositorio de trabajos de grado — API

Backend Node.js (Express), MySQL y Sequelize para gestionar y consultar trabajos de grado.

## Requisitos

- Node.js 18+
- MySQL 8+ (o Docker; ver más abajo)

## Docker (desarrollo local)

1. Copia `.env.example` a `.env` y define al menos `JWT_SECRET` y `DB_PASSWORD` (o usa el valor por defecto de Compose: `repositorio_dev`).

2. **MySQL + Express (recomendado en WSL / Docker Desktop)** — la API corre en un contenedor y se conecta al host **`mysql`** (nombre del servicio en Compose):

```bash
docker compose up -d --build
```

La API queda en `http://localhost:3000` (o el `PORT` de tu `.env`). Compose **sobrescribe** `DB_HOST` a `mysql` dentro del contenedor `api`; el valor de `DB_HOST` en `.env` solo aplica si ejecutas `npm run dev` en tu máquina.

Logs: `docker compose logs -f api`

3. **Solo MySQL** (si prefieres `npm run dev` en el host):

```bash
docker compose up -d mysql
```

En `.env` usa `DB_HOST=127.0.0.1` y la misma `DB_PASSWORD` / `DB_NAME` que en Compose.

En el primer arranque con volumen vacío se aplican `database/schema.sql`, `database/seed.sql` y `database/docker/03-remote-access.sh`.

**Si ves `Access denied` conectando desde el host:** prueba el stack del punto 2, o `docker compose down -v` y vuelve a subir MySQL; si sigue fallando con `root` desde el host, `DB_USER=repositorio_app` en `.env`.

4. Variables útiles en `.env`: `DB_NAME`, `DB_PASSWORD`, `MYSQL_PUBLISH_PORT`, `PORT`.

5. Parar y borrar datos de MySQL: `docker compose down -v`.

## Configuración

1. Clonar o copiar el proyecto e instalar dependencias:

```bash
npm install
```

2. Crear la base de datos en MySQL:

```sql
CREATE DATABASE repositorio_tesis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Aplicar esquema y datos iniciales (roles):

```bash
mysql -u USER -p repositorio_tesis < database/schema.sql
mysql -u USER -p repositorio_tesis < database/seed.sql
```

4. Variables de entorno:

```bash
cp .env.example .env
```

Editar `.env` con credenciales de MySQL y un `JWT_SECRET` seguro.

## Ejecución

```bash
npm run dev
```

O en producción:

```bash
npm start
```

Por defecto la API escucha en `http://localhost:3000`. Comprueba el estado con `GET /health`.

## Usuarios de prueba (desarrollo)

Tras aplicar `database/seed.sql` (por ejemplo en el primer arranque de MySQL con Docker), existen dos cuentas **solo para pruebas**:

| Rol en la API | Nombre mostrado | Correo | Contraseña |
|---------------|-----------------|--------|------------|
| **admin** | Administrador (prueba) | `admin@repositorio.local` | `Admin123!` |
| **public** (visitante) | Visitante (prueba) | `visitante@repositorio.local` | `Visitante123!` |

El seed sigue creando también el rol **editor** (sin usuario por defecto). **No uses estas credenciales en producción.**

Si la base ya existía sin estos usuarios, vuelve a ejecutar solo el seed (con cuidado con duplicados por email) o recrea el volumen: `docker compose down -v` y `docker compose up -d`.

## Endpoints principales

| Área | Método | Ruta | Acceso |
|------|--------|------|--------|
| Auth | POST | `/api/auth/register` | Público |
| Auth | POST | `/api/auth/login` | Público |
| Usuarios | CRUD | `/api/users` | `admin` |
| Programas | CRUD | `/api/academic-programs` | `admin` |
| Tesis | CRUD | `/api/thesis` | `admin`, `editor` |
| Público | GET | `/api/public/thesis` | Público (búsqueda: `q`, `title`, `author`, `keywords`, `year`, `program_id`) |
| Público | GET | `/api/public/thesis/:id` | Público |
| Público | GET | `/api/public/thesis/:id/pdf` | Público (descarga PDF) |

Registro asigna automáticamente el rol `public`. Para pruebas locales, use las cuentas del seed (tabla anterior).

## Subida de PDF

`POST /api/thesis` y `PUT /api/thesis/:id` usan `multipart/form-data` con campo de archivo `pdf` (máx. 25 MB) y metadatos en campos de texto (`title`, `author`, `abstract`, `keywords`, `year`, `programId`).

## Desarrollo

- `SYNC_DB=true` en `.env` ejecuta `sequelize.sync()` al arrancar (útil solo en entornos de prueba; en producción use migraciones o el SQL proporcionado).

## Estructura

- `app.js` / `server.js` — aplicación y arranque
- `src/config` — entorno y Sequelize
- `src/models` — modelos y asociaciones
- `src/services` — lógica de negocio
- `src/controllers` — capa HTTP
- `src/routes` — rutas y validación (express-validator)
- `src/middlewares` — JWT, roles, errores, Multer
- `uploads/theses/` — PDF almacenados
- `database/` — `schema.sql` y `seed.sql`
