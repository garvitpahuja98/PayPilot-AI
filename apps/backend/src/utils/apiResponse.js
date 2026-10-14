/**
 * @file apiResponse.js
 * @description Standardized API response helpers matching docs/API_CONTRACTS.md.
 */

import { HTTP_STATUS } from '@paypilot/shared';

/**
 * Sends a standardized 2xx success response.
 */
export function sendSuccess(res, data = {}, message = undefined, statusCode = HTTP_STATUS.OK) {
  const payload = {
    success: true,
    data
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
}

/**
 * Sends a standardized 4xx/5xx error response.
 */
export function sendError(
  res,
  code = 'INTERNAL_SERVER_ERROR',
  message = 'An unexpected error occurred',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details = undefined
) {
  const payload = {
    success: false,
    error: {
      code,
      message
    }
  };
  if (details && Array.isArray(details) && details.length > 0) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}
