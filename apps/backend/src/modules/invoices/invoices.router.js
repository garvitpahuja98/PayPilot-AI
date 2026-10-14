/**
 * @file invoices.router.js
 * @description Invoices REST routes matching docs/API_CONTRACTS.md.
 */

import { Router } from 'express';
import * as invoicesController from './invoices.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/', authenticate, invoicesController.listInvoices);
router.post('/', authenticate, invoicesController.createInvoice);
router.get('/:id', authenticate, invoicesController.getInvoice);
router.put('/:id', authenticate, invoicesController.updateInvoice);
router.delete('/:id', authenticate, invoicesController.deleteInvoice);

export default router;
