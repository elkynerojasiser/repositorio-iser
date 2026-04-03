import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('El nombre es obligatorio.'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido.'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
  ],
  validateRequest,
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  authController.login
);

export default router;
