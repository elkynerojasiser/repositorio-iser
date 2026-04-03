export type AcademicProgramRef = {
  id: number;
  name: string;
};

export type ClassificationRef = {
  id: number;
  name: string;
};

export type ThesisListItem = {
  id: number;
  title: string;
  author: string;
  abstract: string;
  year: number;
  programId?: number;
  typeId?: number;
  researchLineId?: number;
  program?: ClassificationRef;
  type?: ClassificationRef;
  research_line?: ClassificationRef;
  keywords?: ClassificationRef[];
  created_at?: string;
};

export type ThesisListMeta = {
  total: number;
  limit: number;
  offset: number;
};

export type ThesisListResponse = {
  data: ThesisListItem[];
  meta: ThesisListMeta;
};

export type ThesisDetail = ThesisListItem;

/** Respuesta del API autenticado (incluye metadatos de gestión). */
export type ThesisStaffDetail = ThesisDetail & {
  filePath?: string;
  creator?: { id: number; name: string; email: string };
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  roleId?: number;
  status?: string;
  role?: { id: number; name: string };
};

export type LoginResponse = {
  user: AuthUser;
  token: string;
};
