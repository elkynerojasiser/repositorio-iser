import { Router } from 'express';
import { body } from 'express-validator';
import * as chatController from '../controllers/chatController.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

router.post(
  '/',
  [
    body('question')
      .exists({ checkFalsy: true })
      .isString()
      .withMessage('La pregunta debe ser texto.')
      .trim()
      .notEmpty()
      .withMessage('La pregunta es obligatoria.')
      .isLength({ max: 500 })
      .withMessage('La pregunta no puede superar 500 caracteres.'),
  ],
  validateRequest,
  chatController.postChat
);

export default router;
