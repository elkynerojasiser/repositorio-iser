import { Keyword } from '../models/index.js';
import { buildClassificationService } from './classificationEntityService.js';

const inner = buildClassificationService(Keyword, 'Palabra clave');

export async function listKeywords() {
  return inner.list();
}

export async function getKeywordById(id) {
  return inner.getById(id);
}

export async function createKeyword(data) {
  return inner.create(data);
}

export async function updateKeyword(id, data) {
  return inner.update(id, data);
}

export async function deleteKeyword(id) {
  return inner.remove(id);
}
