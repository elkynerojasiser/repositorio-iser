import { AppError } from '../utils/AppError.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticación requerida.', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('No tiene permisos para esta acción.', 403));
    }
    next();
  };
}
