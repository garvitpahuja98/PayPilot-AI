/**
 * @file payments.router.js
 * @description Payments routes for PayPal checkout sandbox.
 */

import { Router } from 'express';
import * as paymentsController from './payments.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/create-order', authenticate, paymentsController.createOrder);
router.post('/capture-order', authenticate, paymentsController.captureOrder);

export default router;
