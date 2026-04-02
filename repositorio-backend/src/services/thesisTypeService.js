import { ThesisType } from '../models/index.js';
import { buildClassificationService } from './classificationEntityService.js';

const inner = buildClassificationService(ThesisType, 'Tipo de trabajo de grado');

export async function listThesisTypes() {
  return inner.list();
}

export async function getThesisTypeById(id) {
  return inner.getById(id);
}

export async function createThesisType(data) {
  return inner.create(data);
}

export async function updateThesisType(id, data) {
  return inner.update(id, data);
}

export async function deleteThesisType(id) {
  return inner.remove(id);
}
