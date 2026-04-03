import { ResearchLine } from '../models/index.js';
import { buildClassificationService } from './classificationEntityService.js';

const inner = buildClassificationService(ResearchLine, 'Línea de investigación');

export async function listResearchLines() {
  return inner.list();
}

export async function getResearchLineById(id) {
  return inner.getById(id);
}

export async function createResearchLine(data) {
  return inner.create(data);
}

export async function updateResearchLine(id, data) {
  return inner.update(id, data);
}

export async function deleteResearchLine(id) {
  return inner.remove(id);
}
