import { Op } from 'sequelize';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ThesisChunk } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';

const MAX_QUESTION_LENGTH = 500;
const MAX_CONTEXT_CHARS = 12000;
const CHUNK_SEARCH_LIMIT = 5;
const EXCERPT_LEN = 280;

/**
 * Interface/Adaptador base para homogeneizar los proveedores de LLM.
 * Sigue los principios SOLID (Abierto/Cerrado).
 */
class LLMAdapter {
  constructor(model) {
    this.model = model;
  }
  async generateResponse(systemPrompt, userQuestion, contextText) {
    throw new Error('Método abstracto generateResponse() no implementado.');
  }
}

// 1. ADAPTADOR PARA OPENAI
class OpenAIAdapter extends LLMAdapter {
  constructor(apiKey, model) {
    super(model || 'gpt-4o-mini');
    this.client = new OpenAI({ apiKey });
  }

  async generateResponse(systemPrompt, userQuestion, contextText) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Contexto disponible:\n${contextText}\n\nPregunta: ${userQuestion}` }
      ],
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content?.trim() || '';
  }
}

// 2. ADAPTADOR PARA GOOGLE GEMINI
class GeminiAdapter extends LLMAdapter {
  constructor(apiKey, model) {
    super(model || 'gemini-1.5-flash');
    const ai = new GoogleGenerativeAI(apiKey);
    this.client = ai.getGenerativeModel({ model: this.model });
  }

  async generateResponse(systemPrompt, userQuestion, contextText) {
    const result = await this.client.generateContent({
      systemInstruction: systemPrompt,
      contents: [
        {
          role: 'user',
          parts: [{ text: `Contexto disponible:\n${contextText}\n\nPregunta: ${userQuestion}` }]
        }
      ],
      generationConfig: { temperature: 0.3 }
    });
    return result.response.text().trim();
  }
}

// 3. ADAPTADOR PARA GROQ
class GroqAdapter extends LLMAdapter {
  constructor(apiKey, model) {
    super(model || 'llama3-8b-8192');
    this.client = new OpenAI({
      apiKey,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async generateResponse(systemPrompt, userQuestion, contextText) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Contexto disponible:\n${contextText}\n\nPregunta: ${userQuestion}` }
      ],
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content?.trim() || '';
  }
}

// 4. ADAPTADOR PARA OLLAMA (Contenedores o Servidores Locales)
class OllamaAdapter extends LLMAdapter {
  constructor(model) {
    super(model || 'llama3');
    const baseURL = process.env.OLLAMA_BASE_URL || 'http://host.docker.internal:11434/v1';
    this.client = new OpenAI({ apiKey: 'ollama', baseURL });
  }

  async generateResponse(systemPrompt, userQuestion, contextText) {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Contexto disponible:\n${contextText}\n\nPregunta: ${userQuestion}` }
      ],
      temperature: 0.3,
    });
    return completion.choices[0]?.message?.content?.trim() || '';
  }
}

/**
 * Fábrica (Factory Pattern) encargada de instanciar el cliente correcto.
 */
function createLLMClient(userConfig) {
  const provider = userConfig?.provider?.toLowerCase()?.trim();
  const apiKey = userConfig?.apiKey?.trim();
  const model = userConfig?.model?.trim();

  if (provider === 'ollama') {
    return new OllamaAdapter(model);
  }

  if (!apiKey) {
    throw new AppError(`Se requiere una credencial válida (API Key) para usar el proveedor remoto: ${provider}`, 401);
  }

  switch (provider) {
    case 'openai':
      return new OpenAIAdapter(apiKey, model);
    case 'gemini':
      return new GeminiAdapter(apiKey, model);
    case 'groq':
      return new GroqAdapter(apiKey, model);
    default:
      throw new AppError(`El proveedor de Inteligencia Artificial '${provider}' no se encuentra implementado.`, 400);
  }
}

function escapeLike(str) {
  return str.replace(/[%_\\\\]/g, '\\\\$&');
}

/**
 * Extrae palabras clave simples a partir de la pregunta del usuario.
 * @param {string} question
 * @returns {string[]}
 */
export function extractKeywordsFromQuestion(question) {
  const stop = new Set([
    'the', 'and', 'que', 'qué', 'cual', 'cuál', 'como', 'cómo', 'para',
    'con', 'una', 'uno', 'los', 'las', 'del', 'por', 'sobre', 'este',
    'esta', 'thesis', 'trabajo', 'grado', 'proyecto', 'sistema', 'de', 'en'
  ]);
  
  const clean = question
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');

  const tokens = clean.split(/\s+/).map(t => t.trim()).filter(Boolean);
  const words = [];
  
  for (const t of tokens) {
    if (t.length > 2 && !stop.has(t) && !words.includes(t)) {
      words.push(t);
    }
  }
  return words.slice(0, 10);
}

/**
 * Ejecuta la búsqueda exacta en la base de datos relacional PostgreSQL/MySQL.
 */
async function searchChunksByKeywords(keywords) {
  if (!keywords.length) return [];
  const clauses = keywords.map(kw => ({
    content: { [Op.like]: `%${escapeLike(kw)}%` }
  }));

  return await ThesisChunk.findAll({
    where: { [Op.or]: clauses },
    limit: CHUNK_SEARCH_LIMIT,
    attributes: ['id', 'thesisId', 'content'],
    raw: true
  });
}

/**
 * Manejador unificado de las excepciones arrojadas por las SDKs externas.
 */
function handleAIError(err, provider) {
  logger.error(`Error detectado en el proveedor [${provider}]: ${err.message}`);
  const status = err.status || err.statusCode || 500;

  if (provider === 'openai' || provider === 'groq' || provider === 'ollama') {
    if (status === 401) throw new AppError(`Clave de API de ${provider.toUpperCase()} inválida.`, 502);
    if (status === 429) throw new AppError(`Límite de peticiones de ${provider.toUpperCase()} alcanzado.`, 429);
  } else if (provider === 'gemini') {
    if (status === 401 || err.message?.includes('UNAUTHENTICATED')) {
      throw new AppError('Clave de API de Gemini inválida o sin autenticación.', 502);
    }
    if (status === 429 || err.message?.includes('RESOURCE_EXHAUSTED')) {
      throw new AppError('Límite de uso de la cuota de Gemini alcanzado.', 429);
    }
  }
  throw new AppError(`Error al procesar la respuesta con el nodo de IA (${provider}).`, 502);
}

/**
 * Punto de entrada principal para responder preguntas con un enfoque RAG Multiproveedor.
 * @param {string} question - Pregunta formulada por el alumno/docente.
 * @param {Object} userConfig - Parámetros de infraestructura del usuario ({ provider, apiKey, model }).
 */
export async function answerQuestion(question, userConfig) {
  const q = question?.trim();
  if (!q) {
    throw new AppError('La pregunta no puede estar vacía.', 400);
  }
  if (q.length > MAX_QUESTION_LENGTH) {
    throw new AppError(`La pregunta no puede superar los ${MAX_QUESTION_LENGTH} caracteres.`, 400);
  }

  // Creación dinâmica del cliente polimórfico a partir de la inyección del contexto
  const llmClient = createLLMClient(userConfig);

  let keywords = extractKeywordsFromQuestion(q);
  if (!keywords.length) {
    keywords = [q.slice(0, 80).trim()].filter(Boolean);
  }

  const chunks = await searchChunksByKeywords(keywords);

  if (!chunks.length) {
    return {
      answer: 'No encontré información suficiente en los trabajos de grado.',
      sources: [],
      providerUsed: userConfig.provider,
      modelUsed: llmClient.model
    };
  }

  let contextText = '';
  const sources = [];

  for (const c of chunks) {
    if ((contextText + c.content).length > MAX_CONTEXT_CHARS) break;
    contextText += `[TRABAJO ID: ${c.thesisId}]: ${c.content}\n\n`;
    
    sources.push({
      thesisId: c.thesisId,
      excerpt: c.content.slice(0, EXCERPT_LEN).trim() + '...'
    });
  }

  const systemPrompt = `Eres un chatbot académico experto. Tu único objetivo es responder la pregunta del usuario utilizando exclusivamente los fragmentos de texto provistos en el contexto. 
Reglas estrictas:
1. Responde de forma clara y directa utilizando únicamente la información dada en el contexto.
2. Si la respuesta no se encuentra explícitamente en el contexto, di textualmente: "No encontré información suficiente en los trabajos de grado."
3. No inventes datos, no asumas conclusiones ni uses conocimientos externos al contexto proveído.`;

  try {
    const aiResponse = await llmClient.generateResponse(systemPrompt, q, contextText);

    // Si el modelo burla el prompt y responde con sus propios pesos lógicos ante la falta de datos
    if (!aiResponse || aiResponse.includes('No encontré información suficiente')) {
      return {
        answer: 'No encontré información suficiente en los trabajos de grado.',
        sources: [],
        providerUsed: userConfig.provider,
        modelUsed: llmClient.model
      };
    }

    return {
      answer: aiResponse,
      sources,
      providerUsed: userConfig.provider,
      modelUsed: llmClient.model
    };
  } catch (err) {
    handleAIError(err, userConfig.provider?.toLowerCase()?.trim());
  }
}