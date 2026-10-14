/**
 * @file errorHandler.js
 * @description Centralized Express error handler returning unified JSON error envelope.
 */

import { sendError } from '../utils/apiResponse.js';
import { AppError } from '../utils/errors.js';
import { config } from '../config/environment.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof AppError) {
    return sendError(
      res,
      err.code,
      err.message,
      err.statusCode,
      err.details
    );
  }

  // Handle syntax/JSON parsing errors from express.json()
  if (err.type === 'entity.parse.failed') {
    return sendError(
      res,
      'VALIDATION_ERROR',
      'Malformed JSON request body',
      400
    );
  }

  // Unhandled internal server error
  console.error('[Unhandled Error]', err);
  const message = config.isProduction
    ? 'Internal server error occurred'
    : err.message || 'Internal server error occurred';

  return sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    message,
    500
  );
}
