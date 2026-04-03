import path from 'path';
import fs from 'fs';
import { Op } from 'sequelize';
import {
  Thesis,
  AcademicProgram,
  ThesisType,
  ResearchLine,
  Keyword,
  ThesisKeyword,
} from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const baseKeywordInclude = {
  model: Keyword,
  as: 'keywords',
  attributes: ['id', 'name'],
  through: { attributes: [] },
};

function buildIncludes(filters) {
  const {
    keyword,
    keyword_id: keywordIdSnake,
    keywordId,
    keyword_name: keywordNameSnake,
    keywordName,
  } = filters;

  const kwF = keyword ?? keywordIdSnake ?? keywordId;
  const nameSearch = (keywordNameSnake ?? keywordName)?.trim();

  const includes = [
    { model: AcademicProgram, as: 'program', attributes: ['id', 'name'] },
    { model: ThesisType, as: 'type', attributes: ['id', 'name'] },
    { model: ResearchLine, as: 'research_line', attributes: ['id', 'name'] },
    { ...baseKeywordInclude },
  ];

  const kwIdx = 3;
  if (kwF != null && kwF !== '') {
    const kid = Number(kwF);
    if (!Number.isNaN(kid)) {
      includes[kwIdx] = {
        ...baseKeywordInclude,
        where: { id: kid },
        required: true,
      };
    }
  } else if (nameSearch) {
    includes[kwIdx] = {
      ...baseKeywordInclude,
      where: { name: { [Op.like]: `%${nameSearch}%` } },
      required: true,
    };
  }

  return includes;
}

export async function listPublicTheses(filters = {}) {
  const {
    q,
    title,
    author,
    year,
    program,
    program_id: programIdSnake,
    programId,
    type,
    type_id: typeIdSnake,
    typeId,
    line,
    research_line_id: lineSnake,
    researchLineId,
    limit,
    offset,
    page,
  } = filters;

  const where = {};

  const programF = program ?? programIdSnake ?? programId;
  const typeF = type ?? typeIdSnake ?? typeId;
  const lineF = line ?? lineSnake ?? researchLineId;

  if (programF != null && programF !== '') {
    const n = Number(programF);
    if (!Number.isNaN(n)) where.programId = n;
  }
  if (typeF != null && typeF !== '') {
    const n = Number(typeF);
    if (!Number.isNaN(n)) where.typeId = n;
  }
  if (lineF != null && lineF !== '') {
    const n = Number(lineF);
    if (!Number.isNaN(n)) where.researchLineId = n;
  }
  if (year != null && year !== '') {
    const y = Number(year);
    if (!Number.isNaN(y)) where.year = y;
  }

  if (q?.trim()) {
    const term = `%${q.trim()}%`;
    const matchingKeywords = await Keyword.findAll({
      attributes: ['id'],
      where: { name: { [Op.like]: term } },
    });
    const kwIds = matchingKeywords.map((k) => k.id);
    let thesisIdsFromKw = [];
    if (kwIds.length) {
      const links = await ThesisKeyword.findAll({
        attributes: ['thesis_id'],
        where: { keyword_id: { [Op.in]: kwIds } },
        raw: true,
      });
      thesisIdsFromKw = [...new Set(links.map((r) => r.thesis_id))];
    }
    where[Op.or] = [
      { title: { [Op.like]: term } },
      { author: { [Op.like]: term } },
      ...(thesisIdsFromKw.length ? [{ id: { [Op.in]: thesisIdsFromKw } }] : []),
    ];
  } else {
    if (title?.trim()) where.title = { [Op.like]: `%${title.trim()}%` };
    if (author?.trim()) where.author = { [Op.like]: `%${author.trim()}%` };
  }

  const lim = Math.min(Math.max(Number(limit) || 50, 1), 100);
  let off = Math.max(Number(offset) || 0, 0);
  if (page != null && page !== '') {
    const p = Math.max(Number(page) || 1, 1);
    off = (p - 1) * lim;
  }

  const include = buildIncludes(filters);
  const order = [
    ['year', 'DESC'],
    ['title', 'ASC'],
  ];
  const listAttrs = { exclude: ['filePath'] };

  // findAndCountAll(distinct) + col mal puesto → `Thesis->Thesis.id` en MySQL.
  // Un findAll con COUNT(DISTINCT…) e includes mete columnas de JOIN en el SELECT
  // y rompe sql_mode=ONLY_FULL_GROUP_BY. count() solo emite el agregado.
  const [rows, count] = await Promise.all([
    Thesis.findAll({
      where,
      attributes: listAttrs,
      include,
      order,
      limit: lim,
      offset: off,
    }),
    Thesis.count({
      where,
      include,
      distinct: true,
      col: 'id',
    }),
  ]);

  return {
    data: rows,
    meta: { total: count, limit: lim, offset: off },
  };
}

export async function getPublicThesisById(id) {
  const thesis = await Thesis.findByPk(id, {
    include: buildIncludes({}),
  });
  if (!thesis) throw new AppError('Trabajo de grado no encontrado.', 404);
  return thesis.get({ plain: true });
}

export function resolvePdfAbsolutePath(filePath) {
  return path.join(process.cwd(), filePath);
}

export async function assertPdfExists(filePath) {
  const abs = resolvePdfAbsolutePath(filePath);
  if (!fs.existsSync(abs)) {
    throw new AppError('Archivo PDF no disponible.', 404);
  }
  return abs;
}
