import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, _next) {
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      message: 'Error de validación',
      errors: err.errors?.map((e) => ({ field: e.path, message: e.message })) || [],
    });
  }
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'El recurso ya existe (dato duplicado).' });
  }
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ message: 'Referencia inválida (clave foránea).' });
  }
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message || 'Error al subir el archivo.' });
  }
  if (err.message === 'Solo se permiten archivos PDF.') {
    return res.status(400).json({ message: err.message });
  }
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ message: 'Token inválido.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ message: 'Token expirado.' });
  }

  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const message = err instanceof AppError ? err.message : 'Error interno del servidor.';

  if (statusCode >= 500) {
    logger.error(err.message, err.stack);
  }

  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && !(err instanceof AppError) && { detail: err.message }),
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}
