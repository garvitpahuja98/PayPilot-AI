/**
 * @file constants.js
 * @description Shared domain constants and enumeration definitions for PayPilot AI.
 * Both apps/frontend and apps/backend consume these values to maintain domain consistency.
 */

export const INVOICE_STATUS = Object.freeze({
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELLED: 'CANCELLED'
});

export const PAYMENT_STATUS = Object.freeze({
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED'
});

export const PAYMENT_PROVIDER = Object.freeze({
  PAYPAL: 'PAYPAL'
});

export const USER_ROLES = Object.freeze({
  FREELANCER: 'FREELANCER',
  BUSINESS: 'BUSINESS',
  ADMIN: 'ADMIN'
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
});

export const ERROR_CODES = Object.freeze({
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYPAL_VERIFICATION_FAILED: 'PAYPAL_VERIFICATION_FAILED',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR'
});

export const SUPPORTED_CURRENCIES = Object.freeze(['USD', 'EUR', 'GBP', 'CAD', 'AUD']);

export const DEFAULT_CURRENCY = 'USD';

/**
 * Validates whether a given status string is a recognized invoice status.
 * @param {string} status 
 * @returns {boolean}
 */
export function isValidInvoiceStatus(status) {
  return Object.values(INVOICE_STATUS).includes(status);
}

/**
 * Validates whether a given status string is a recognized payment status.
 * @param {string} status 
 * @returns {boolean}
 */
export function isValidPaymentStatus(status) {
  return Object.values(PAYMENT_STATUS).includes(status);
}
