import { AcademicProgram } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

export async function listPrograms() {
  return AcademicProgram.findAll({ order: [['name', 'ASC']] });
}

export async function getProgramById(id) {
  const program = await AcademicProgram.findByPk(id);
  if (!program) throw new AppError('Programa académico no encontrado.', 404);
  return program;
}

export async function createProgram({ name }) {
  return AcademicProgram.create({ name });
}

export async function updateProgram(id, { name }) {
  const program = await AcademicProgram.findByPk(id);
  if (!program) throw new AppError('Programa académico no encontrado.', 404);
  if (name !== undefined) program.name = name;
  await program.save();
  return program;
}

export async function deleteProgram(id) {
  const program = await AcademicProgram.findByPk(id);
  if (!program) throw new AppError('Programa académico no encontrado.', 404);
  await program.destroy();
}
