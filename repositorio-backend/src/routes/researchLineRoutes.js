import { Router } from 'express';
import { body, param } from 'express-validator';
import * as researchLineController from '../controllers/researchLineController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { verifyRole } from '../middlewares/verifyRole.js';

const router = Router();

const staffRead = [authenticate, verifyRole(['admin', 'editor'])];
const adminOnly = [authenticate, verifyRole(['admin'])];

router.get('/', ...staffRead, researchLineController.list);

router.get('/:id', [...staffRead, param('id').isInt()], validateRequest, researchLineController.getById);

router.post('/', ...adminOnly, [body('name').trim().notEmpty()], validateRequest, researchLineController.create);

router.put(
  '/:id',
  [...adminOnly, param('id').isInt(), body('name').optional().trim().notEmpty()],
  validateRequest,
  researchLineController.update
);

router.delete('/:id', [...adminOnly, param('id').isInt()], validateRequest, researchLineController.remove);

export default router;
