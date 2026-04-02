import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Siempre intentar el `.env` junto al backend (no depender de `process.cwd()`). */
const backendRootEnv = path.resolve(__dirname, '..', '..', '.env');
dotenv.config({ path: backendRootEnv });
/** Rellena claves que falten si hay otro `.env` en el cwd (p. ej. monorepo). */
dotenv.config();

const required = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];

export function loadEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  },
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  syncDb: process.env.SYNC_DB === 'true',
};
