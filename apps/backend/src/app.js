/**
 * @file app.js
 * @description Express application setup, security middleware, and routing.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { NotFoundError } from './utils/errors.js';
import { config } from './config/environment.js';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  })
);

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome message
app.get('/', (req, res) => {
  res.json({
    name: 'PayPilot AI Backend REST Service',
    version: '0.1.0',
    documentation: '/api/health',
    status: 'READY'
  });
});

// Mount master API router
app.use('/api', apiRouter);

// 404 handler for unrecognized routes
app.use((req, res, next) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
});

// Centralized error handling middleware
app.use(errorHandler);

export default app;
