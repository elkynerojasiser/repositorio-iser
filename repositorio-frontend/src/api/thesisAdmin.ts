import { apiFetch, apiUrl } from './client';
import type { ThesisStaffDetail } from './types';

function parseError(res: Response, data: unknown): Error {
  let msg = res.statusText;
  if (typeof data === 'object' && data !== null && 'message' in data) {
    msg = String((data as { message: string }).message);
    const errs = (data as { errors?: { msg?: string }[] }).errors;
    if (Array.isArray(errs) && errs[0]?.msg) {
      msg = `${msg}: ${errs[0].msg}`;
    }
  }
  return new Error(msg || `Error ${res.status}`);
}

export type ThesisCreatePayload = {
  title: string;
  author: string;
  abstract: string;
  year: number;
  programId: number;
  typeId: number;
  researchLineId: number;
  keywordIds: number[];
  pdf: File;
};

export async function createThesisWithPdf(
  token: string,
  payload: ThesisCreatePayload
): Promise<ThesisStaffDetail> {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('author', payload.author);
  form.append('abstract', payload.abstract);
  form.append('year', String(payload.year));
  form.append('programId', String(payload.programId));
  form.append('typeId', String(payload.typeId));
  form.append('researchLineId', String(payload.researchLineId));
  form.append('keywordIds', JSON.stringify(payload.keywordIds));
  form.append('pdf', payload.pdf);

  const res = await fetch(apiUrl('/api/thesis'), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw parseError(res, data);
  }
  return data as ThesisStaffDetail;
}

export async function listThesesStaff(token: string): Promise<ThesisStaffDetail[]> {
  return apiFetch<ThesisStaffDetail[]>('/api/thesis', { token, method: 'GET' });
}

export async function getThesisStaff(token: string, id: number): Promise<ThesisStaffDetail> {
  return apiFetch<ThesisStaffDetail>(`/api/thesis/${id}`, { token, method: 'GET' });
}

export type ThesisUpdateFields = {
  title: string;
  author: string;
  abstract: string;
  year: number;
  programId: number;
  typeId: number;
  researchLineId: number;
  keywordIds: number[];
};

export async function updateThesisWithPdf(
  token: string,
  id: number,
  fields: ThesisUpdateFields,
  pdf: File | null
): Promise<ThesisStaffDetail> {
  const form = new FormData();
  form.append('title', fields.title);
  form.append('author', fields.author);
  form.append('abstract', fields.abstract);
  form.append('year', String(fields.year));
  form.append('programId', String(fields.programId));
  form.append('typeId', String(fields.typeId));
  form.append('researchLineId', String(fields.researchLineId));
  form.append('keywordIds', JSON.stringify(fields.keywordIds));
  if (pdf) {
    form.append('pdf', pdf);
  }

  const res = await fetch(apiUrl(`/api/thesis/${id}`), {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    throw parseError(res, data);
  }
  return data as ThesisStaffDetail;
}

export async function deleteThesisStaff(token: string, id: number): Promise<void> {
  const res = await fetch(apiUrl(`/api/thesis/${id}`), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 204) return;

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { message: text };
    }
  }
  throw parseError(res, data);
}
