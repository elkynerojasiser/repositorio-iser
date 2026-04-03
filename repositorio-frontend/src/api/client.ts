const base = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

type RequestInitWithJson = Omit<RequestInit, 'body'> & {
  body?: object;
  token?: string | null;
};

export async function apiFetch<T>(
  path: string,
  { body, token, headers, ...init }: RequestInitWithJson = {}
): Promise<T> {
  const h = new Headers(headers);
  h.set('Accept', 'application/json');
  if (body !== undefined) {
    h.set('Content-Type', 'application/json');
  }
  if (token) {
    h.set('Authorization', `Bearer ${token}`);
  }
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
    let msg = res.statusText;
    if (typeof data === 'object' && data !== null && 'message' in data) {
      msg = String((data as { message: string }).message);
      const errs = (data as { errors?: { msg?: string }[] }).errors;
      if (Array.isArray(errs) && errs[0]?.msg) {
        msg = `${msg}: ${errs[0].msg}`;
      }
    }
    throw new Error(msg || `Error ${res.status}`);
  }
  return data as T;
}
