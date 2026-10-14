/**
 * @file dashboard.router.js
 * @description Dashboard routes.
 */

import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/summary', authenticate, dashboardController.getSummary);

export default router;
