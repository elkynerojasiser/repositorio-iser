import { Router } from 'express';
import { body, param } from 'express-validator';
import * as userController from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/roleCheck.js';
import { validateRequest } from '../middlewares/validateRequest.js';
import { ROLES } from '../utils/constants.js';

const router = Router();

router.use(authenticate, requireRole(ROLES.ADMIN));

router.get('/', userController.list);

router.get('/:id', [param('id').isInt()], validateRequest, userController.getById);

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('roleId').isInt(),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  validateRequest,
  userController.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional({ checkFalsy: true }).isLength({ min: 8 }),
    body('roleId').optional().isInt(),
    body('status').optional().isIn(['active', 'inactive']),
  ],
  validateRequest,
  userController.update
);

router.delete('/:id', [param('id').isInt()], validateRequest, userController.remove);

export default router;
