/**
 * @file auth.router.js
 * @description Authentication endpoint routing.
 */

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.post('/login', authController.login);
router.get('/me', authenticate, authController.getProfile);

export default router;
