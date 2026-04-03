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
  token: string,
  params: ThesisSearchParams = {}
): Promise<ThesisListResponse> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '') sp.set(k, v);
  });
  const q = sp.toString();
  const path = q ? `/api/public/thesis?${q}` : '/api/public/thesis';
  return apiFetch<ThesisListResponse>(path, { token });
}

export async function fetchThesisById(token: string, id: number): Promise<ThesisDetail> {
  return apiFetch<ThesisDetail>(`/api/public/thesis/${id}`, { token });
}

/** PDF protegido: no usar enlace directo (el navegador no envía Bearer). */
export async function fetchThesisPdfBlob(token: string, id: number): Promise<Blob> {
  const res = await fetch(apiUrl(`/api/public/thesis/${id}/pdf`), {
    headers: {
      Accept: 'application/pdf',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    let msg = res.statusText;
    try {
      const data = JSON.parse(text) as { message?: string };
      if (data?.message) msg = data.message;
    } catch {
      if (text) msg = text;
    }
    throw new Error(msg || `Error ${res.status}`);
  }
  return res.blob();
}
