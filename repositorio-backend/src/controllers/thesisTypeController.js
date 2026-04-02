import * as thesisTypeService from '../services/thesisTypeService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await thesisTypeService.listThesisTypes());
});

export const getById = asyncHandler(async (req, res) => {
  res.json(await thesisTypeService.getThesisTypeById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const item = await thesisTypeService.createThesisType(req.body);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  res.json(await thesisTypeService.updateThesisType(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await thesisTypeService.deleteThesisType(req.params.id);
  res.status(204).send();
});
