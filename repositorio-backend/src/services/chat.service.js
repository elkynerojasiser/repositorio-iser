import { Op } from 'sequelize';
import OpenAI from 'openai';
import { ThesisChunk } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const MAX_QUESTION_LENGTH = 500;
const MAX_CONTEXT_CHARS = 12_000;
const CHUNK_SEARCH_LIMIT = 5;
const EXCERPT_LEN = 280;

function escapeLike(str) {
  return str.replace(/[%_\\]/g, '\\$&');
}

/**
 * Palabras clave simples a partir de la pregunta (español genérico).
 * @param {string} question
 * @returns {string[]}
 */
export function extractKeywordsFromQuestion(question) {
  const stop = new Set([
    'the',
    'and',
    'que',
    'qué',
    'cual',
    'cuál',
    'como',
    'cómo',
    'para',
    'por',
    'una',
    'uno',
    'los',
    'las',
    'del',
    'con',
    'sin',
    'sobre',
    'hay',
    'thesis',
    'trabajo',
    'trabajos',
    'grado',
  ]);
  const tokens = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !stop.has(t));

  const unique = [...new Set(tokens)];
  return unique.slice(0, 10);
}

/**
 * Busca hasta CHUNK_SEARCH_LIMIT fragmentos que coincidan por LIKE con alguna keyword.
 * @param {string[]} keywords
 */
export async function searchChunksByKeywords(keywords) {
  if (!keywords.length) return [];

  const conditions = keywords.map((kw) => ({
    content: { [Op.like]: `%${escapeLike(kw)}%` },
  }));

  const rows = await ThesisChunk.findAll({
    where: { [Op.or]: conditions },
    attributes: ['id', 'thesisId', 'content'],
    limit: CHUNK_SEARCH_LIMIT,
    order: [['id', 'ASC']],
  });
  return rows.map((r) => ({
    thesis_id: r.thesisId,
    content: r.content,
  }));
}

function buildContextFromChunks(chunks) {
  const parts = chunks.map(
    (c, idx) => `[Fragmento ${idx + 1} | tesis_id=${c.thesis_id}]\n${c.content}`
  );
  let ctx = parts.join('\n\n---\n\n');
  if (ctx.length > MAX_CONTEXT_CHARS) {
    ctx = ctx.slice(0, MAX_CONTEXT_CHARS) + '\n…';
  }
  return ctx;
}

function buildSources(chunks) {
  return chunks.map((c) => ({
    thesis_id: c.thesis_id,
    excerpt: c.content.length > EXCERPT_LEN ? `${c.content.slice(0, EXCERPT_LEN)}…` : c.content,
  }));
}

/**
 * @param {string} question
 * @param {string} context
 * @returns {Promise<string>}
 */
export async function askAI(question, context) {
  // Leer en tiempo de petición: Docker/Compose inyecta en `process.env` y evita valores vacíos por cwd al cargar dotenv.
  const key = (process.env.OPENAI_API_KEY || '').trim();
  if (!key) {
    throw new AppError('El asistente no está configurado (falta OPENAI_API_KEY).', 503);
  }

  const client = new OpenAI({ apiKey: key });
  const model = (process.env.OPENAI_MODEL || 'gpt-4.1-mini').trim();

  try {
    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content:
            'Eres un asistente académico. Responde ÚNICAMENTE usando el contexto proporcionado. ' +
            'Si la respuesta no está en el contexto, di exactamente: "No encontré información suficiente en los trabajos de grado". ' +
            'No inventes datos ni cites fuentes que no aparezcan en el contexto.',
        },
        {
          role: 'user',
          content: `Contexto:\n${context}\n\nPregunta:\n${question}\n\nResponde en español, con redacción clara y estructurada.`,
        },
      ],
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('Respuesta vacía del modelo');
    }
    return text;
  } catch (e) {
    logger.error(`OpenAI error: ${e.message}`, e.stack);
    const status = e.status || e.code;
    if (status === 401 || status === 'invalid_api_key') {
      throw new AppError('Clave de API de OpenAI inválida.', 502);
    }
    if (status === 429) {
      throw new AppError('Límite de uso de OpenAI alcanzado. Intente más tarde.', 429);
    }
    throw new AppError('Error al consultar el servicio de IA.', 502);
  }
}

/**
 * @param {string} question
 */
export async function answerQuestion(question) {
  const q = question?.trim();
  if (!q) {
    throw new AppError('La pregunta no puede estar vacía.', 400);
  }
  if (q.length > MAX_QUESTION_LENGTH) {
    throw new AppError(`La pregunta no puede superar ${MAX_QUESTION_LENGTH} caracteres.`, 400);
  }

  let keywords = extractKeywordsFromQuestion(q);
  if (!keywords.length) {
    keywords = [q.slice(0, 80).trim()].filter(Boolean);
  }

  const chunks = await searchChunksByKeywords(keywords);

  if (!chunks.length) {
    return {
      answer: 'No encontré información suficiente en los trabajos de grado.',
      sources: [],
    };
  }

  const context = buildContextFromChunks(chunks);
  const answer = await askAI(q, context);
  return {
    answer,
    sources: buildSources(chunks),
  };
}
