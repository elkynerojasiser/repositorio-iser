# Repositorio de trabajos de grado — Frontend

Cliente web en **React** (Vite + TypeScript) alineado con el API descrito en `repositorio/setup.md`.

## Requisitos

- **Node.js 18+**
- API backend en ejecución (por defecto `http://localhost:3000`)

## Desarrollo

```bash
cd repositorio-frontend
npm install
npm run dev
```

Abre `http://localhost:5173`. Las peticiones a `/api` se reenvían al backend (ver `vite.config.ts`, variable opcional `VITE_PROXY_API`).

Cuentas de prueba del seed del backend (ver `repositorio/README.md`): **admin@repositorio.local** / `Admin123!` y **visitante@repositorio.local** / `Visitante123!`.

## Variables de entorno

Copia `.env.example` a `.env` si necesitas:

- **`VITE_API_BASE_URL`**: URL absoluta del API (p. ej. producción). Si está vacío, se usan rutas relativas `/api` (ideal con el proxy de Vite en desarrollo).

## Funcionalidad inicial

- **Catálogo público** (`/`) — listado y búsqueda (`q`, título, autor, palabras clave, año, ID de programa).
- **Detalle de tesis** (`/tesis/:id`) — resumen, palabras clave y enlace al PDF.
- **Registro e inicio de sesión** — JWT en `localStorage` (rol público por defecto en el backend).
- **Panel administrativo** (`/admin`, solo rol **admin**) — los visitantes (`public`) no pueden entrar; si lo intentan, se redirige al inicio.
  - **Trabajos de grado** (`/admin/tesis`): listado con enlaces al catálogo público, edición y eliminación (con confirmación).
  - **Nuevo trabajo** (`/admin/tesis/nueva`): alta con PDF y creación de programa si no existe ninguno.
  - **Editar** (`/admin/tesis/:id/editar`): actualización de metadatos y sustitución opcional del PDF.

Pendiente: gestión de **usuarios** y CRUD completo de **programas** en UI. El rol **editor** sigue pudiendo usar el API directamente.

## Build

```bash
npm run build
```

Sirve la carpeta `dist` detrás de un servidor estático; configura `VITE_API_BASE_URL` al construir si el API está en otro origen.
