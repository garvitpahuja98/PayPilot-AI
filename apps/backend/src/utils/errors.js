/**
 * @file errors.js
 * @description Standardized application error hierarchy.
 */

import { HTTP_STATUS, ERROR_CODES } from '@paypilot/shared';

export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, code = ERROR_CODES.INTERNAL_SERVER_ERROR, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request payload', details = undefined) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict detected') {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.VALIDATION_ERROR);
  }
}
