import { requireRole } from './roleCheck.js';

/**
 * Alias declarativo: verifyRole(['admin']) — misma lógica que requireRole.
 * @param {string[]} roles
 */
export function verifyRole(roles) {
  return requireRole(...roles);
}
