import { apiFetch } from './client';
import type { ClassificationRef } from './types';

export async function fetchThesisTypes(token: string): Promise<ClassificationRef[]> {
  return apiFetch<ClassificationRef[]>('/api/thesis-types', { token, method: 'GET' });
}

export async function fetchResearchLines(token: string): Promise<ClassificationRef[]> {
  return apiFetch<ClassificationRef[]>('/api/research-lines', { token, method: 'GET' });
}

export async function fetchKeywordCatalog(token: string): Promise<ClassificationRef[]> {
  return apiFetch<ClassificationRef[]>('/api/keywords', { token, method: 'GET' });
}

export async function createThesisType(token: string, name: string): Promise<ClassificationRef> {
  return apiFetch<ClassificationRef>('/api/thesis-types', {
    method: 'POST',
    token,
    body: { name: name.trim() },
  });
}

export async function updateThesisType(
  token: string,
  id: number,
  name: string
): Promise<ClassificationRef> {
  return apiFetch<ClassificationRef>(`/api/thesis-types/${id}`, {
    method: 'PUT',
    token,
    body: { name: name.trim() },
  });
}

export async function deleteThesisType(token: string, id: number): Promise<void> {
  await apiFetch<unknown>(`/api/thesis-types/${id}`, { method: 'DELETE', token });
}

export async function createResearchLine(token: string, name: string): Promise<ClassificationRef> {
  return apiFetch<ClassificationRef>('/api/research-lines', {
    method: 'POST',
    token,
    body: { name: name.trim() },
  });
}

export async function updateResearchLine(
  token: string,
  id: number,
  name: string
): Promise<ClassificationRef> {
  return apiFetch<ClassificationRef>(`/api/research-lines/${id}`, {
    method: 'PUT',
    token,
    body: { name: name.trim() },
  });
}

export async function deleteResearchLine(token: string, id: number): Promise<void> {
  await apiFetch<unknown>(`/api/research-lines/${id}`, { method: 'DELETE', token });
}

export async function createKeywordEntity(token: string, name: string): Promise<ClassificationRef> {
  return apiFetch<ClassificationRef>('/api/keywords', {
    method: 'POST',
    token,
    body: { name: name.trim() },
  });
}

export async function updateKeywordEntity(
  token: string,
  id: number,
  name: string
): Promise<ClassificationRef> {
  return apiFetch<ClassificationRef>(`/api/keywords/${id}`, {
    method: 'PUT',
    token,
    body: { name: name.trim() },
  });
}

export async function deleteKeywordEntity(token: string, id: number): Promise<void> {
  await apiFetch<unknown>(`/api/keywords/${id}`, { method: 'DELETE', token });
}
