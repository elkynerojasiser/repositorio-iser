/**
 * Backfill de embeddings para chunks ya existentes (subidos antes del RAG híbrido).
 *
 * Uso:
 *   node src/scripts/backfillEmbeddings.js            # genera embeddings de los chunks con embedding NULL
 *   node src/scripts/backfillEmbeddings.js --reindex  # además re-extrae y re-chunkea cada PDF (aplica solapamiento)
 *
 * Requiere OPENAI_API_KEY configurada.
 */
import { Op } from 'sequelize';
import { sequelize, ThesisChunk, Thesis } from '../models/index.js';
import { generateEmbeddings, embeddingsEnabled } from '../services/embeddingService.js';
import { indexThesisPdf } from '../services/pdfChunkService.js';
import { logger } from '../utils/logger.js';

const BATCH = 96;

async function reindexAllThesis() {
  const theses = await Thesis.findAll({ attributes: ['id', 'filePath'] });
  logger.info(`Re-indexando ${theses.length} tesis (re-chunk + embeddings)…`);
  for (const t of theses) {
    await indexThesisPdf(t.id, t.filePath);
  }
}

async function backfillMissing() {
  const rows = await ThesisChunk.findAll({
    where: { embedding: { [Op.is]: null } },
    attributes: ['id', 'content'],
    order: [['id', 'ASC']],
  });
  if (!rows.length) {
    logger.info('No hay chunks pendientes de embedding.');
    return;
  }
  logger.info(`Generando embeddings para ${rows.length} chunks…`);

  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const vectors = await generateEmbeddings(batch.map((r) => r.content));
    await sequelize.transaction(async (transaction) => {
      for (let j = 0; j < batch.length; j++) {
        if (!vectors[j]) continue;
        await ThesisChunk.update(
          { embedding: JSON.stringify(vectors[j]) },
          { where: { id: batch[j].id }, transaction }
        );
      }
    });
    done += batch.length;
    logger.info(`Progreso: ${done}/${rows.length}`);
  }
}

async function main() {
  if (!embeddingsEnabled()) {
    throw new Error('OPENAI_API_KEY no configurada: no se pueden generar embeddings.');
  }
  await sequelize.authenticate();
  logger.info('Conexión a la base de datos verificada.');

  if (process.argv.includes('--reindex')) {
    await reindexAllThesis();
  } else {
    await backfillMissing();
  }
  logger.info('Backfill de embeddings completado.');
  await sequelize.close();
}

main().catch(async (err) => {
  logger.error('Backfill falló:', err.message);
  await sequelize.close().catch(() => {});
  process.exit(1);
});
