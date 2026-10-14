/**
 * @file server.js
 * @description Application entrypoint: initializes DB pool and binds HTTP listener.
 */

import app from './app.js';
import { config } from './config/environment.js';
import { initDatabase } from './config/db.js';

async function startServer() {
  try {
    // Attempt connecting to database (falls back cleanly if unavailable)
    await initDatabase();

    const server = app.listen(config.port, () => {
      console.log('====================================================');
      console.log(`🚀 PayPilot AI Backend running on http://localhost:${config.port}`);
      console.log(`📡 Health Check: http://localhost:${config.port}/api/health`);
      console.log(`⚙️  Environment: ${config.env}`);
      console.log(`💳 PayPal Mode: ${config.paypal.mode} (Configured: ${config.paypal.isConfigured})`);
      console.log(`🤖 AI Provider: ${config.ai.provider} (Configured: ${config.ai.isConfigured})`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = () => {
      console.log('\n[Server] Gracefully shutting down...');
      server.close(() => {
        console.log('[Server] Closed remaining connections.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('[Server] Critical startup failure:', error);
    process.exit(1);
  }
}

startServer();
