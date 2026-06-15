/** Solo el administrador accede al panel y al CRUD de tesis en la UI. */
export const ADMIN_ROLE = 'admin' as const;

/** @deprecated usar ADMIN_ROLE */
export const THESIS_UPLOAD_ROLE = ADMIN_ROLE;

export function isAdmin(roleName: string | undefined): boolean {
  return roleName === ADMIN_ROLE;
}

export function canAccessAdminPanel(roleName: string | undefined): boolean {
  return isAdmin(roleName);
}
