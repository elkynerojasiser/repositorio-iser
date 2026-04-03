import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ThesisChunk } from '../models/index.js';
import { logger } from '../utils/logger.js';

const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

/** Objetivo ~400 palabras por fragmento (rango indicado 300–500). */
const TARGET_WORDS_PER_CHUNK = 400;

/**
 * Extrae texto de un PDF en disco.
 * @param {string} absoluteFilePath ruta absoluta al archivo
 */
export async function extractTextFromPDF(absoluteFilePath) {
  const buf = await fs.promises.readFile(absoluteFilePath);
  const data = await pdfParse(buf);
  return typeof data.text === 'string' ? data.text : '';
}

/**
 * Divide texto en trozos de aprox. TARGET_WORDS_PER_CHUNK palabras.
 * @param {string} text
 * @returns {string[]}
 */
export function splitTextIntoChunks(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const words = normalized.split(' ');
  const chunks = [];
  for (let i = 0; i < words.length; i += TARGET_WORDS_PER_CHUNK) {
    const slice = words.slice(i, i + TARGET_WORDS_PER_CHUNK);
    if (slice.length) chunks.push(slice.join(' ').trim());
  }
  if (chunks.length > 1) {
    const last = chunks[chunks.length - 1];
    if (last.split(/\s+/).length < 80) {
      chunks[chunks.length - 2] = `${chunks[chunks.length - 2]} ${last}`;
      chunks.pop();
    }
  }
  return chunks.filter(Boolean);
}

/**
 * Reemplaza chunks existentes de una tesis por los nuevos.
 * @param {number} thesisId
 * @param {string[]} chunks
 */
export async function saveChunks(thesisId, chunks) {
  await ThesisChunk.destroy({ where: { thesisId } });
  if (!chunks.length) return;
  await ThesisChunk.bulkCreate(
    chunks.map((content) => ({
      thesisId,
      content,
    }))
  );
}

/**
 * Indexa el PDF de una tesis (ruta relativa a cwd, p. ej. uploads/theses/…).
 * Errores se registran pero no se propagan por defecto.
 * @param {number} thesisId
 * @param {string} relativeFilePath
 * @param {{ throwOnError?: boolean }} [opts]
 */
export async function indexThesisPdf(thesisId, relativeFilePath, opts = {}) {
  const abs = path.join(process.cwd(), relativeFilePath);
  if (!fs.existsSync(abs)) {
    const err = new Error(`PDF no encontrado: ${relativeFilePath}`);
    logger.warn(err.message);
    if (opts.throwOnError) throw err;
    return;
  }

  try {
    const text = await extractTextFromPDF(abs);
    const chunks = splitTextIntoChunks(text);
    await saveChunks(thesisId, chunks);
    logger.info(`Indexados ${chunks.length} fragmentos para tesis ${thesisId}`);
  } catch (e) {
    logger.warn(`No se pudo indexar PDF de tesis ${thesisId}: ${e.message}`);
    if (opts.throwOnError) throw e;
  }
}
