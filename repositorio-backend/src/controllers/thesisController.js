import * as thesisService from '../services/thesisService.js';
import { parseKeywordIds } from '../utils/parseKeywordIds.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const items = await thesisService.listTheses();
  res.json(items);
});

export const getById = asyncHandler(async (req, res) => {
  const item = await thesisService.getThesisById(req.params.id);
  res.json(item);
});

export const create = asyncHandler(async (req, res) => {
  const keywordIds = parseKeywordIds(req.body.keywordIds ?? req.body.keyword_ids);
  const body = {
    title: req.body.title,
    author: req.body.author,
    abstract: req.body.abstract,
    year: Number(req.body.year),
    programId: Number(req.body.programId),
    typeId: Number(req.body.typeId),
    researchLineId: Number(req.body.researchLineId),
    keywordIds,
  };
  const item = await thesisService.createThesis(body, req.file, req.user.id);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  const body = {};
  if (req.body.title !== undefined) body.title = req.body.title;
  if (req.body.author !== undefined) body.author = req.body.author;
  if (req.body.abstract !== undefined) body.abstract = req.body.abstract;
  if (req.body.year !== undefined) body.year = Number(req.body.year);
  if (req.body.programId !== undefined) body.programId = Number(req.body.programId);
  if (req.body.typeId !== undefined) body.typeId = Number(req.body.typeId);
  if (req.body.researchLineId !== undefined) {
    body.researchLineId = Number(req.body.researchLineId);
  }
  if (req.body.keywordIds !== undefined || req.body.keyword_ids !== undefined) {
    body.keywordIds = parseKeywordIds(req.body.keywordIds ?? req.body.keyword_ids);
  }
  const item = await thesisService.updateThesis(req.params.id, body, req.file);
  res.json(item);
});

export const remove = asyncHandler(async (req, res) => {
  await thesisService.deleteThesis(req.params.id);
  res.status(204).send();
});
