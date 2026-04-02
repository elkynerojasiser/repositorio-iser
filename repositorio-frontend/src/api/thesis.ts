import { apiFetch, apiUrl } from './client';
import type { ThesisDetail, ThesisListResponse } from './types';

export type ThesisSearchParams = {
  q?: string;
  title?: string;
  author?: string;
  keyword_name?: string;
  year?: string;
  program_id?: string;
  type?: string;
  type_id?: string;
  line?: string;
  research_line_id?: string;
  keyword?: string;
  keyword_id?: string;
  limit?: string;
  offset?: string;
  page?: string;
};

export async function fetchThesisList(
  params: ThesisSearchParams = {}
): Promise<ThesisListResponse> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, v);
  });
  const q = sp.toString();
  const path = q ? `/api/public/thesis?${q}` : '/api/public/thesis';
  return apiFetch<ThesisListResponse>(path);
}

export async function fetchThesisById(id: number): Promise<ThesisDetail> {
  return apiFetch<ThesisDetail>(`/api/public/thesis/${id}`);
}

export function thesisPdfUrl(id: number): string {
  return apiUrl(`/api/public/thesis/${id}/pdf`);
}
