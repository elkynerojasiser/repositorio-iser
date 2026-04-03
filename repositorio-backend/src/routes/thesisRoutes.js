import { Router } from 'express';
import { body, param } from 'express-validator';
import * as thesisController from '../controllers/thesisController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roleCheck.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { uploadPdf } from '../middlewares/uploadPdf.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

const editorOrAdmin = [authenticate, requireRole(ROLES.ADMIN, ROLES.EDITOR)];

router.get('/', ...editorOrAdmin, thesisController.list);
router.get('/:id', [...editorOrAdmin, param('id').isInt()], validateRequest, thesisController.getById);

router.post(
  '/',
  ...editorOrAdmin,
  uploadPdf.single('pdf'),
  [
    body('title').trim().notEmpty(),
    body('author').trim().notEmpty(),
    body('abstract').trim().notEmpty(),
    body('year').isInt({ min: 1900, max: 2100 }),
    body('programId').isInt(),
    body('typeId').isInt(),
    body('researchLineId').isInt(),
  ],
  validateRequest,
  thesisController.create
);

router.put(
  '/:id',
  ...editorOrAdmin,
  uploadPdf.single('pdf'),
  [
    param('id').isInt(),
    body('title').optional().trim().notEmpty(),
    body('author').optional().trim().notEmpty(),
    body('abstract').optional().trim().notEmpty(),
    body('year').optional().isInt({ min: 1900, max: 2100 }),
    body('programId').optional().isInt(),
    body('typeId').optional().isInt(),
    body('researchLineId').optional().isInt(),
  ],
  validateRequest,
  thesisController.update
);

router.delete('/:id', [...editorOrAdmin, param('id').isInt()], validateRequest, thesisController.remove);

export default router;
