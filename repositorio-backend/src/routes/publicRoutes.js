import { Router } from 'express';
import { param, query } from 'express-validator';
import * as publicThesisController from '../controllers/publicThesisController.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const intQuery = (field) =>
  query(field).optional({ checkFalsy: true }).isInt();

// Acepta un entero o una lista CSV de enteros (filtros multiselect).
const intListQuery = (field) =>
  query(field).optional({ checkFalsy: true }).matches(/^\d+(,\d+)*$/);

router.get(
  '/thesis',
  [
    query('q').optional().trim(),
    query('title').optional().trim(),
    query('author').optional().trim(),
    intQuery('year'),
    intListQuery('program'),
    intListQuery('program_id'),
    intListQuery('programId'),
    intListQuery('type'),
    intListQuery('type_id'),
    intListQuery('typeId'),
    intListQuery('line'),
    intListQuery('research_line_id'),
    intListQuery('researchLineId'),
    intListQuery('keyword'),
    intListQuery('keyword_id'),
    intListQuery('keywordId'),
    query('keyword_name').optional().trim(),
    query('keywordName').optional().trim(),
    intQuery('limit'),
    intQuery('offset'),
    intQuery('page'),
  ],
  validateRequest,
  publicThesisController.list
);

router.get('/thesis/:id', [param('id').isInt()], validateRequest, publicThesisController.getById);

router.get('/thesis/:id/pdf', [param('id').isInt()], validateRequest, publicThesisController.downloadPdf);

export default router;
