/**
 * @file index.js
 * @description Master API router consolidating domain modules and health checks.
 */

import { Router } from 'express';
import authRouter from '../modules/auth/auth.router.js';
import dashboardRouter from '../modules/dashboard/dashboard.router.js';
import invoicesRouter from '../modules/invoices/invoices.router.js';
import paymentsRouter from '../modules/payments/payments.router.js';
import aiRouter from '../modules/ai-assistant/ai.router.js';
import { isDatabaseConnected } from '../config/db.js';
import { config } from '../config/environment.js';
import { sendSuccess } from '../utils/apiResponse.js';

const apiRouter = Router();

// Health & System Status Check
apiRouter.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'ONLINE',
    service: 'paypilot-backend',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    database: {
      connected: isDatabaseConnected(),
      mode: isDatabaseConnected() ? 'postgresql' : 'in-memory-dev-mock'
    },
    integrations: {
      paypalConfigured: config.paypal.isConfigured,
      paypalMode: config.paypal.mode,
      aiProvider: config.ai.provider,
      aiConfigured: config.ai.isConfigured
    }
  }, 'PayPilot API is healthy');
});

// Domain Module Mounting
apiRouter.use('/auth', authRouter);
apiRouter.use('/dashboard', dashboardRouter);
apiRouter.use('/invoices', invoicesRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/ai', aiRouter);

export default apiRouter;
