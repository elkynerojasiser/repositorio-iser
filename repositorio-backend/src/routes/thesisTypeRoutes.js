import { Router } from 'express';
import { body, param } from 'express-validator';
import * as thesisTypeController from '../controllers/thesisTypeController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { verifyRole } from '../middlewares/verifyRole.js';

const router = Router();

const staffRead = [authenticate, verifyRole(['admin', 'editor'])];
const adminOnly = [authenticate, verifyRole(['admin'])];

router.get('/', ...staffRead, thesisTypeController.list);

router.get('/:id', [...staffRead, param('id').isInt()], validateRequest, thesisTypeController.getById);

router.post('/', ...adminOnly, [body('name').trim().notEmpty()], validateRequest, thesisTypeController.create);

router.put(
  '/:id',
  [...adminOnly, param('id').isInt(), body('name').optional().trim().notEmpty()],
  validateRequest,
  thesisTypeController.update
);

router.delete('/:id', [...adminOnly, param('id').isInt()], validateRequest, thesisTypeController.remove);

export default router;
