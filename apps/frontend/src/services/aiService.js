/**
 * @file aiService.js
 * @description Frontend service for AI assistant prompts.
 */

import { request } from './apiClient.js';

export async function requestInvoiceDraft({ projectSummary, targetHourlyRate, currency }) {
  return request('/ai/invoice-draft', {
    method: 'POST',
    body: JSON.stringify({ projectSummary, targetHourlyRate, currency })
  });
}

export async function requestPaymentReminder({ invoiceId, tone, daysPastDue }) {
  return request('/ai/payment-reminder', {
    method: 'POST',
    body: JSON.stringify({ invoiceId, tone, daysPastDue })
  });
}
