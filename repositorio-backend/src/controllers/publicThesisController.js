import * as publicThesisService from '../services/publicThesisService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const filters = {
    q: req.query.q,
    title: req.query.title,
    author: req.query.author,
    year: req.query.year,
    program: req.query.program,
    program_id: req.query.program_id,
    programId: req.query.programId,
    type: req.query.type,
    type_id: req.query.type_id,
    typeId: req.query.typeId,
    line: req.query.line,
    research_line_id: req.query.research_line_id,
    researchLineId: req.query.researchLineId,
    keyword: req.query.keyword,
    keyword_id: req.query.keyword_id,
    keywordId: req.query.keywordId,
    keyword_name: req.query.keyword_name,
    keywordName: req.query.keywordName,
    limit: req.query.limit,
    offset: req.query.offset,
    page: req.query.page,
  };
  const result = await publicThesisService.listPublicTheses(filters);
  res.json(result);
});

export const getById = asyncHandler(async (req, res) => {
  const thesis = await publicThesisService.getPublicThesisById(req.params.id);
  const { filePath, ...safe } = thesis;
  res.json(safe);
});

export const downloadPdf = asyncHandler(async (req, res, next) => {
  const thesis = await publicThesisService.getPublicThesisById(req.params.id);
  const abs = await publicThesisService.assertPdfExists(thesis.filePath);
  res.download(abs, `tesis-${thesis.id}.pdf`, (err) => {
    if (err) next(err);
  });
});
