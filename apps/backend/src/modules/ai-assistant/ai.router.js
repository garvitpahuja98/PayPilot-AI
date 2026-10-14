/**
 * @file ai.router.js
 * @description AI assistant endpoints matching docs/API_CONTRACTS.md.
 */

import { Router } from 'express';
import * as aiController from './ai.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/invoice-draft', authenticate, aiController.generateInvoiceDraft);
router.post('/payment-reminder', authenticate, aiController.generatePaymentReminder);

export default router;
