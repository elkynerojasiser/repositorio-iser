# Build del SPA (Vite) y servido con Caddy (HTTPS automático)
FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Sin VITE_API_BASE_URL → el bundle llama a /api del mismo origen (Caddy proxya al backend)
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
