/**
 * @file formatters.js
 * @description Formatting utilities for currencies, dates, and domain status badges.
 */

/**
 * Formats a numeric monetary value to standard currency string (e.g. $1,250.00).
 */
export function formatCurrency(amount, currency = 'USD') {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numeric);
}

/**
 * Formats an ISO date string to a human-readable format.
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Returns CSS badge class for a given invoice status.
 */
export function getInvoiceStatusClass(status) {
  switch (status) {
    case 'PAID':
      return 'badge-paid';
    case 'SENT':
      return 'badge-sent';
    case 'OVERDUE':
      return 'badge-overdue';
    case 'CANCELLED':
      return 'badge-cancelled';
    case 'DRAFT':
    default:
      return 'badge-draft';
  }
}
