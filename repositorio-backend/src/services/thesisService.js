import fs from 'fs';
import path from 'path';
import {
  sequelize,
  Thesis,
  AcademicProgram,
  ThesisType,
  ResearchLine,
  Keyword,
  User,
} from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { indexThesisPdf } from './pdfChunkService.js';

const includeRelations = [
  { model: AcademicProgram, as: 'program', attributes: ['id', 'name'] },
  { model: ThesisType, as: 'type', attributes: ['id', 'name'] },
  { model: ResearchLine, as: 'research_line', attributes: ['id', 'name'] },
  { model: Keyword, as: 'keywords', attributes: ['id', 'name'], through: { attributes: [] } },
  { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
];

async function assertKeywordIdsValid(ids) {
  const unique = [...new Set(ids)].filter((n) => Number.isInteger(n) && n > 0);
  if (!unique.length) return;
  const n = await Keyword.count({ where: { id: unique } });
  if (n !== unique.length) {
    throw new AppError('Una o más palabras clave no existen.', 400);
  }
}

export async function listTheses() {
  return Thesis.findAll({
    include: includeRelations,
    order: [['created_at', 'DESC']],
  });
}

export async function getThesisById(id) {
  const thesis = await Thesis.findByPk(id, { include: includeRelations });
  if (!thesis) throw new AppError('Trabajo de grado no encontrado.', 404);
  return thesis;
}

export async function createThesis(payload, file, userId) {
  if (!file) throw new AppError('Debe adjuntar un archivo PDF.', 400);
  const program = await AcademicProgram.findByPk(payload.programId);
  if (!program) throw new AppError('Programa académico no encontrado.', 400);
  const ttype = await ThesisType.findByPk(payload.typeId);
  if (!ttype) throw new AppError('Tipo de trabajo no encontrado.', 400);
  const line = await ResearchLine.findByPk(payload.researchLineId);
  if (!line) throw new AppError('Línea de investigación no encontrada.', 400);
  await assertKeywordIdsValid(payload.keywordIds || []);

  const filePath = path.join('uploads', 'theses', file.filename).replace(/\\/g, '/');
  const keywordIds = [...new Set(payload.keywordIds || [])];

  try {
    const result = await sequelize.transaction(async (transaction) => {
      const thesis = await Thesis.create(
        {
          title: payload.title,
          author: payload.author,
          abstract: payload.abstract,
          year: payload.year,
          programId: payload.programId,
          typeId: payload.typeId,
          researchLineId: payload.researchLineId,
          filePath,
          userId,
        },
        { transaction }
      );
      if (keywordIds.length) {
        await thesis.setKeywords(keywordIds, { transaction });
      }
      return { id: thesis.id, filePath };
    });
    try {
      await indexThesisPdf(result.id, result.filePath);
    } catch (e) {
      logger.warn(`Indexación PDF poscreate tesis ${result.id}: ${e.message}`);
    }
    return getThesisById(result.id);
  } catch (e) {
    const abs = path.join(process.cwd(), filePath);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
    throw e;
  }
}

export async function updateThesis(id, payload, file) {
  const thesis = await Thesis.findByPk(id);
  if (!thesis) throw new AppError('Trabajo de grado no encontrado.', 404);

  if (payload.programId != null) {
    const program = await AcademicProgram.findByPk(payload.programId);
    if (!program) throw new AppError('Programa académico no encontrado.', 400);
    thesis.programId = payload.programId;
  }
  if (payload.typeId != null) {
    const t = await ThesisType.findByPk(payload.typeId);
    if (!t) throw new AppError('Tipo de trabajo no encontrado.', 400);
    thesis.typeId = payload.typeId;
  }
  if (payload.researchLineId != null) {
    const rl = await ResearchLine.findByPk(payload.researchLineId);
    if (!rl) throw new AppError('Línea de investigación no encontrada.', 400);
    thesis.researchLineId = payload.researchLineId;
  }
  if (payload.title !== undefined) thesis.title = payload.title;
  if (payload.author !== undefined) thesis.author = payload.author;
  if (payload.abstract !== undefined) thesis.abstract = payload.abstract;
  if (payload.year !== undefined) thesis.year = payload.year;

  if (payload.keywordIds !== undefined) {
    await assertKeywordIdsValid(payload.keywordIds);
  }

  let oldAbs = null;
  if (file) {
    oldAbs = path.join(process.cwd(), thesis.filePath);
    thesis.filePath = path.join('uploads', 'theses', file.filename).replace(/\\/g, '/');
  }

  const keywordIds = payload.keywordIds !== undefined ? [...new Set(payload.keywordIds)] : null;

  await sequelize.transaction(async (transaction) => {
    await thesis.save({ transaction });
    if (keywordIds !== null) {
      await thesis.setKeywords(keywordIds, { transaction });
    }
  });

  if (oldAbs && fs.existsSync(oldAbs)) {
    fs.unlinkSync(oldAbs);
  }

  if (file) {
    try {
      const fresh = await Thesis.findByPk(id);
      if (fresh) await indexThesisPdf(id, fresh.filePath);
    } catch (e) {
      logger.warn(`Indexación PDF post-actualización tesis ${id}: ${e.message}`);
    }
  }

  return getThesisById(id);
}

export async function deleteThesis(id) {
  const thesis = await Thesis.findByPk(id);
  if (!thesis) throw new AppError('Trabajo de grado no encontrado.', 404);
  const abs = path.join(process.cwd(), thesis.filePath);
  await thesis.destroy();
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
}
