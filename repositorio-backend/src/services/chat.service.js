import { Op } from 'sequelize';
import OpenAI from 'openai';
import { ThesisChunk, Thesis } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { generateEmbedding, cosineSimilarity, embeddingsEnabled } from './embeddingService.js';

const MAX_QUESTION_LENGTH = 500;
const MAX_CONTEXT_CHARS = 12_000;
const CHUNK_SEARCH_LIMIT = 5;
const EXCERPT_LEN = 280;
/**
 * Tope de chunks con embedding que cargamos en memoria para rankear por coseno.
 * Suficiente para un repositorio académico; punto de escalado si la BD crece mucho
 * (ahí convendría una BD vectorial o MySQL 9 con tipo VECTOR).
 */
const SEMANTIC_CANDIDATE_LIMIT = 5_000;

const THESIS_INCLUDE = {
  model: Thesis,
  as: 'thesis',
  attributes: ['id', 'title', 'author', 'year'],
};

/** Normaliza una fila de ThesisChunk (con su tesis incluida) al shape interno. */
function toChunk(row, score = null) {
  return {
    id: row.id,
    thesis_id: row.thesisId,
    title: row.thesis?.title || null,
    author: row.thesis?.author || null,
    year: row.thesis?.year || null,
    content: row.content,
    score,
  };
}

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
 * Búsqueda léxica: fragmentos que coincidan por LIKE con alguna keyword.
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
    include: [THESIS_INCLUDE],
    limit: CHUNK_SEARCH_LIMIT,
    order: [['id', 'ASC']],
  });
  return rows.map((r) => toChunk(r));
}

/**
 * Búsqueda semántica: rankea por similitud coseno contra el embedding de la pregunta.
 * Carga en memoria los chunks que ya tienen vector (ver SEMANTIC_CANDIDATE_LIMIT).
 * @param {string} question
 * @returns {Promise<Array>} chunks ordenados por score desc (hasta CHUNK_SEARCH_LIMIT)
 */
export async function searchChunksBySemantic(question) {
  if (!embeddingsEnabled()) return [];

  let queryVec;
  try {
    queryVec = await generateEmbedding(question);
  } catch (e) {
    logger.warn(`No se pudo generar embedding de la pregunta: ${e.message}`);
    return [];
  }
  if (!queryVec?.length) return [];

  const rows = await ThesisChunk.findAll({
    where: { embedding: { [Op.ne]: null } },
    attributes: ['id', 'thesisId', 'content', 'embedding'],
    include: [THESIS_INCLUDE],
    limit: SEMANTIC_CANDIDATE_LIMIT,
  });

  const scored = [];
  for (const r of rows) {
    let vec;
    try {
      vec = JSON.parse(r.embedding);
    } catch {
      continue;
    }
    const score = cosineSimilarity(queryVec, vec);
    scored.push(toChunk(r, score));
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, CHUNK_SEARCH_LIMIT);
}

/**
 * Retrieval híbrido: fusiona resultados semánticos y léxicos, deduplica por id de
 * chunk y devuelve hasta CHUNK_SEARCH_LIMIT priorizando los de mayor score semántico.
 * Si no hay embeddings disponibles, degrada a solo-keyword (comportamiento previo).
 * @param {string} question
 * @param {string[]} keywords
 */
export async function retrieveChunks(question, keywords) {
  const [semantic, lexical] = await Promise.all([
    searchChunksBySemantic(question),
    searchChunksByKeywords(keywords),
  ]);

  const byId = new Map();
  for (const c of semantic) byId.set(c.id, c);
  for (const c of lexical) {
    if (!byId.has(c.id)) byId.set(c.id, c);
  }

  const merged = [...byId.values()];
  // Score semántico primero; los solo-léxicos (score null) van al final.
  merged.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
  return merged.slice(0, CHUNK_SEARCH_LIMIT);
}

/** Encabezado legible de la fuente para que el modelo pueda citarla. */
function sourceLabel(c) {
  const meta = [c.title, c.author, c.year].filter(Boolean).join(' — ');
  return meta ? `${meta} (tesis_id=${c.thesis_id})` : `tesis_id=${c.thesis_id}`;
}

function buildContextFromChunks(chunks) {
  const parts = chunks.map(
    (c, idx) => `[Fragmento ${idx + 1} | ${sourceLabel(c)}]\n${c.content}`
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
    title: c.title,
    author: c.author,
    year: c.year,
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

  const chunks = await retrieveChunks(q, keywords);

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
