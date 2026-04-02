import * as keywordEntityService from '../services/keywordEntityService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await keywordEntityService.listKeywords());
});

export const getById = asyncHandler(async (req, res) => {
  res.json(await keywordEntityService.getKeywordById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const item = await keywordEntityService.createKeyword(req.body);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  res.json(await keywordEntityService.updateKeyword(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await keywordEntityService.deleteKeyword(req.params.id);
  res.status(204).send();
});
