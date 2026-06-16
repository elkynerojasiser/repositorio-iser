# Despliegue en Google Cloud (una sola VM con Docker Compose)

Guía para desplegar `repositorio-iser` (backend Express + MySQL + frontend React/Vite + asistente RAG) en una sola instancia de Google Compute Engine, detrás de un único edge con HTTPS automático.

## Arquitectura

Todo corre en una VM con tres contenedores orquestados por `docker-compose.prod.yml`:

```
Internet :80/:443
      │
   ┌──▼──── web (Caddy) ──────┐  sirve el build de Vite + HTTPS automático (Let's Encrypt)
   │  /api/*  ─► reverse_proxy │
   └──────────┬───────────────┘
              ▼
            api (Express :3000)   ── volumen uploads_data  (PDFs subidos)
              ▼
            mysql :3306           ── volumen mysql_data     (datos)
```

- **`web`** (`repositorio-frontend/Dockerfile` + `Caddyfile`): imagen multistage que compila el SPA con Vite y lo sirve con Caddy. Es el **único** servicio que publica puertos al host (80/443). Enruta `/api/*` al backend y todo lo demás al `index.html` (fallback SPA para react-router). Caddy emite y renueva el certificado TLS solo.
- **`api`** (`repositorio-backend/Dockerfile.prod`): API Express en producción (`npm start`). Solo accesible por la red interna de Compose.
- **`mysql`**: MySQL 8.4. Inicializa el esquema y el seed desde `repositorio-backend/database/` (montados en `/docker-entrypoint-initdb.d`). Solo accesible por la red interna.

Como el frontend está compilado sin `VITE_API_BASE_URL`, todas sus llamadas van a `/api` del **mismo origen** → cero CORS.

## Despliegue actual

| Recurso | Valor |
|---|---|
| Proyecto GCP | `project-5c6aee98-0b9f-466e-8c7` |
| VM | `repositorio-iser` · zona `us-east1-b` · e2-medium · Ubuntu 22.04 |
| IP externa | `34.74.53.32` |
| URL | https://tesis-iser.redsoftdevelopers.com |

## Requisitos previos

- `gcloud` autenticado (`gcloud auth login`) con un proyecto con **billing activo** y la **Compute Engine API** habilitada.
- Un **dominio** con un registro DNS **A** apuntando a la IP externa de la VM. Caddy necesita que el DNS ya resuelva para emitir el certificado.

## Despliegue paso a paso

### 1. Crear la VM

```bash
PROJECT=project-5c6aee98-0b9f-466e-8c7
gcloud compute instances create repositorio-iser \
  --project="$PROJECT" --zone=us-east1-b \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB --boot-disk-type=pd-balanced \
  --tags=http-server,https-server
```

> e2-medium (4 GB) recomendado: con 2 GB el `npm run build` del frontend puede morir por falta de RAM.

### 2. Firewall

Los tags `http-server` / `https-server` usan reglas que abren `tcp:80` y `tcp:443`. Verificar que existan:

```bash
gcloud compute firewall-rules list --project="$PROJECT"
```

Si faltan, crearlas:

```bash
gcloud compute firewall-rules create allow-http  --allow=tcp:80  --target-tags=http-server  --project="$PROJECT"
gcloud compute firewall-rules create allow-https --allow=tcp:443 --target-tags=https-server --project="$PROJECT"
```

### 3. DNS

Crear el registro A del dominio apuntando a la IP de la VM:

```
Tipo: A    Nombre: <subdominio>    Valor: <IP externa de la VM>
```

Confirmar que ya resuelve antes de levantar: `dig +short <dominio> A`.

### 4. Instalar Docker en la VM

```bash
gcloud compute ssh repositorio-iser --project="$PROJECT" --zone=us-east1-b
# dentro de la VM:
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # reconectar el SSH para que aplique
```

### 5. Clonar el repo

```bash
git clone -b feat/rag-hibrido-chat https://github.com/elkynerojasiser/repositorio-iser.git
cd repositorio-iser
```

### 6. Crear el `.env`

Copiar la plantilla y rellenar con valores reales (este archivo **no se commitea**, está en `.gitignore`):

```bash
cp .env.example .env
chmod 600 .env
```

Variables (ver `.env.example`):

| Variable | Descripción |
|---|---|
| `DOMAIN` | Dominio para el que Caddy emite el certificado |
| `DB_NAME` | Nombre de la base de datos |
| `DB_PASSWORD` | Password de root de MySQL — generar con `openssl rand -hex 24` |
| `JWT_SECRET` | Secreto de firma JWT — generar con `openssl rand -hex 48` |
| `JWT_EXPIRES_IN` | Vigencia del token (ej. `7d`) |
| `OPENAI_API_KEY` | Clave de OpenAI para el asistente RAG |
| `OPENAI_MODEL` | Modelo de chat (`gpt-4.1-mini`) |
| `OPENAI_EMBEDDING_MODEL` | Modelo de embeddings (`text-embedding-3-small`) |

### 7. Levantar

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

La primera vez tarda unos minutos (build de Vite + `npm ci`). MySQL inicializa el esquema con un `start_period` de 60s; el `api` espera a que esté `healthy`. Caddy emite el certificado en cuanto el dominio resuelva.

### 8. Embeddings del RAG

Tras cargar tesis en el repositorio, generar sus embeddings para que el chat busque bien:

```bash
docker compose -f docker-compose.prod.yml exec api npm run backfill:embeddings
```

## Verificación

```bash
docker compose -f docker-compose.prod.yml ps                          # los 3 Up, mysql healthy
curl -i https://<dominio>/api/auth/login -d '{}' -H 'Content-Type: application/json'  # 400 JSON de Express → proxy OK
curl -o /dev/null -w "%{http_code}\n" https://<dominio>/              # 200 (frontend)
```

En el navegador: abrir la URL, registrarse/iniciar sesión, subir y descargar una tesis con PDF, y probar el chat IA.

## Operación

Desde la VM (`gcloud compute ssh repositorio-iser --zone=us-east1-b`, luego `cd ~/repositorio-iser`):

```bash
# Redeploy tras cambios en el código
git pull && docker compose -f docker-compose.prod.yml up -d --build

# Logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Reiniciar un servicio (ej. tras editar el .env)
docker compose -f docker-compose.prod.yml up -d api

# Estado
docker compose -f docker-compose.prod.yml ps
```

Los datos persisten en los volúmenes `mysql_data`, `uploads_data` (PDFs) y `caddy_data` (certificados), así que sobreviven a `down`/`up` y reinicios de la VM.

## Notas

- **`/health` y `/prueba`** del backend no son accesibles por el dominio: caen en el catch-all del SPA. Solo `/api/*` se proxya al backend (por diseño del `Caddyfile`).
- **HTTP-only**: para arrancar sin dominio/HTTPS, cambiar `{$DOMAIN}` por `:80` en el `Caddyfile`.
- **bcrypt**: compila sobre `node:20-bookworm-slim` con prebuilds. Si fallara, usar la base `node:20-bookworm` (completa) o instalar `build-essential python3`.
- **Secretos**: el `.env` nunca se commitea. Para algo más robusto, migrar a Secret Manager.
