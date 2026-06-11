import OpenAI from 'openai';
import { logger } from '../utils/logger.js';

/** Lote máximo de textos por llamada a la API de embeddings. */
const EMBEDDING_BATCH_SIZE = 96;

/**
 * Cliente de OpenAI en tiempo de petición (mismo patrón que chat.service.js):
 * Docker/Compose inyecta la clave en `process.env`, evitando valores vacíos por cwd.
 * @returns {OpenAI|null} cliente o null si no hay clave configurada
 */
function getClient() {
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) return null;
  return new OpenAI({ apiKey: key });
}

function getModel() {
  return (process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small').trim();
}

/** @returns {boolean} true si hay clave de OpenAI para generar embeddings */
export function embeddingsEnabled() {
  return Boolean((process.env.OPENAI_API_KEY || '').trim());
}

/**
 * Genera el embedding de un solo texto.
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export async function generateEmbedding(text) {
  const [vector] = await generateEmbeddings([text]);
  return vector;
}

/**
 * Genera embeddings para varios textos en lotes, respetando el orden de entrada.
 * @param {string[]} texts
 * @returns {Promise<number[][]>}
 */
export async function generateEmbeddings(texts) {
  if (!texts.length) return [];
  const client = getClient();
  if (!client) {
    throw new Error('OPENAI_API_KEY no configurada para embeddings');
  }
  const model = getModel();

  const out = [];
  for (let i = 0; i < texts.length; i += EMBEDDING_BATCH_SIZE) {
    const batch = texts.slice(i, i + EMBEDDING_BATCH_SIZE);
    const res = await client.embeddings.create({ model, input: batch });
    for (const item of res.data) {
      out.push(item.embedding);
    }
  }
  if (out.length !== texts.length) {
    logger.warn(`Embeddings devueltos (${out.length}) no coinciden con textos (${texts.length})`);
  }
  return out;
}

/**
 * Similitud coseno entre dos vectores de igual dimensión.
 * @param {number[]} a
 * @param {number[]} b
 * @returns {number} valor en [-1, 1]; 0 si algún vector es nulo
 */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}
