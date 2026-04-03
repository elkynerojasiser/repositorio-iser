import * as programService from '../services/academicProgramService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const list = asyncHandler(async (req, res) => {
  const programs = await programService.listPrograms();
  res.json(programs);
});

export const getById = asyncHandler(async (req, res) => {
  const program = await programService.getProgramById(req.params.id);
  res.json(program);
});

export const create = asyncHandler(async (req, res) => {
  const program = await programService.createProgram(req.body);
  res.status(201).json(program);
});

export const update = asyncHandler(async (req, res) => {
  const program = await programService.updateProgram(req.params.id, req.body);
  res.json(program);
});

export const remove = asyncHandler(async (req, res) => {
  await programService.deleteProgram(req.params.id);
  res.status(204).send();
});
