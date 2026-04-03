import { Router } from 'express';
import { param, query } from 'express-validator';
import * as publicThesisController from '../controllers/publicThesisController.js';
import { validateRequest } from '../middlewares/validateRequest.js';

const router = Router();

const intQuery = (field) =>
  query(field).optional({ checkFalsy: true }).isInt();

router.get(
  '/thesis',
  [
    query('q').optional().trim(),
    query('title').optional().trim(),
    query('author').optional().trim(),
    intQuery('year'),
    intQuery('program'),
    intQuery('program_id'),
    intQuery('programId'),
    intQuery('type'),
    intQuery('type_id'),
    intQuery('typeId'),
    intQuery('line'),
    intQuery('research_line_id'),
    intQuery('researchLineId'),
    intQuery('keyword'),
    intQuery('keyword_id'),
    intQuery('keywordId'),
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
