import * as researchLineService from '../services/researchLineService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  res.json(await researchLineService.listResearchLines());
});

export const getById = asyncHandler(async (req, res) => {
  res.json(await researchLineService.getResearchLineById(req.params.id));
});

export const create = asyncHandler(async (req, res) => {
  const item = await researchLineService.createResearchLine(req.body);
  res.status(201).json(item);
});

export const update = asyncHandler(async (req, res) => {
  res.json(await researchLineService.updateResearchLine(req.params.id, req.body));
});

export const remove = asyncHandler(async (req, res) => {
  await researchLineService.deleteResearchLine(req.params.id);
  res.status(204).send();
});
