/** Ruta interna segura tras login/registro (evita open redirect). */
export function safePathAfterAuth(state: unknown): string {
  const from =
    state && typeof state === 'object' && 'from' in state
      ? String((state as { from?: string }).from)
      : '';
  if (from && from.startsWith('/') && from !== '/login' && from !== '/registro') return from;
  return '/';
}
