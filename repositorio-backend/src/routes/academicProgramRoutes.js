import { Router } from 'express';
import { body, param } from 'express-validator';
import * as programController from '../controllers/academicProgramController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { verifyRole } from '../middlewares/verifyRole.js';

const router = Router();

const staffRead = [authenticate, verifyRole(['admin', 'editor'])];
const adminOnly = [authenticate, verifyRole(['admin'])];

router.get('/', ...staffRead, programController.list);

router.get('/:id', [...staffRead, param('id').isInt()], validateRequest, programController.getById);

router.post('/', ...adminOnly, [body('name').trim().notEmpty()], validateRequest, programController.create);

router.put(
  '/:id',
  [...adminOnly, param('id').isInt(), body('name').optional().trim().notEmpty()],
  validateRequest,
  programController.update
);

router.delete('/:id', [...adminOnly, param('id').isInt()], validateRequest, programController.remove);

export default router;
