/**
 * @file environment.js
 * @description Loads and validates environment variables with safe defaults for local development.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt loading from root .env first, then local apps/backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://paypilot_user:password@localhost:5432/paypilot_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'paypilot_db',
    user: process.env.DB_USER || 'paypilot_user',
    password: process.env.DB_PASSWORD || '',
    allowOffline: process.env.ALLOW_OFFLINE_DB !== 'false'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_key_change_in_production_min_32_chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },

  paypal: {
    mode: process.env.PAYPAL_MODE || 'sandbox',
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    isConfigured: Boolean(
      process.env.PAYPAL_CLIENT_ID && 
      !process.env.PAYPAL_CLIENT_ID.includes('your_paypal')
    )
  },

  ai: {
    provider: process.env.AI_PROVIDER || 'mock',
    apiKey: process.env.AI_API_KEY || '',
    modelName: process.env.AI_MODEL_NAME || 'gemini-1.5-flash',
    isConfigured: Boolean(
      process.env.AI_API_KEY && 
      !process.env.AI_API_KEY.includes('your_ai_api_key')
    )
  }
};
