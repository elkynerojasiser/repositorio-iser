import { Router } from 'express';
import { body, param } from 'express-validator';
import * as keywordEntityController from '../controllers/keywordEntityController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { verifyRole } from '../middlewares/verifyRole.js';

const router = Router();

const staffRead = [authenticate, verifyRole(['admin', 'editor'])];
const adminOnly = [authenticate, verifyRole(['admin'])];

router.get('/', ...staffRead, keywordEntityController.list);

router.get('/:id', [...staffRead, param('id').isInt()], validateRequest, keywordEntityController.getById);

router.post('/', ...adminOnly, [body('name').trim().notEmpty()], validateRequest, keywordEntityController.create);

router.put(
  '/:id',
  [...adminOnly, param('id').isInt(), body('name').optional().trim().notEmpty()],
  validateRequest,
  keywordEntityController.update
);

router.delete('/:id', [...adminOnly, param('id').isInt()], validateRequest, keywordEntityController.remove);

export default router;
