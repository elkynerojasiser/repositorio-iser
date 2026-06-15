import { apiFetch } from './client';
import type { AcademicProgramRef } from './types';

export async function fetchAcademicPrograms(token: string): Promise<AcademicProgramRef[]> {
  return apiFetch<AcademicProgramRef[]>('/api/academic-programs', { token, method: 'GET' });
}

export async function createAcademicProgram(
  token: string,
  name: string
): Promise<AcademicProgramRef> {
  return apiFetch<AcademicProgramRef>('/api/academic-programs', {
    method: 'POST',
    token,
    body: { name: name.trim() },
  });
}

export async function updateAcademicProgram(
  token: string,
  id: number,
  name: string
): Promise<AcademicProgramRef> {
  return apiFetch<AcademicProgramRef>(`/api/academic-programs/${id}`, {
    method: 'PUT',
    token,
    body: { name: name.trim() },
  });
}

export async function deleteAcademicProgram(token: string, id: number): Promise<void> {
  await apiFetch<unknown>(`/api/academic-programs/${id}`, {
    method: 'DELETE',
    token,
  });
}
