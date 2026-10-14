/**
 * @file ai.service.js
 * @description Business logic for AI-assisted invoice drafting and payment reminders.
 */

import * as aiClient from '../../services/ai/aiClient.js';
import * as invoicesService from '../invoices/invoices.service.js';
import { BadRequestError } from '../../utils/errors.js';

export async function createInvoiceDraft({ projectSummary, targetHourlyRate, currency }) {
  if (!projectSummary || projectSummary.trim().length === 0) {
    throw new BadRequestError('projectSummary is required');
  }

  return aiClient.generateInvoiceDraft({
    projectSummary,
    targetHourlyRate: parseFloat(targetHourlyRate) || 85.0,
    currency: currency || 'USD'
  });
}

export async function createPaymentReminder({ invoiceId, tone = 'polite', daysPastDue = 0 }, userId) {
  if (!invoiceId) {
    throw new BadRequestError('invoiceId is required');
  }

  const invoice = await invoicesService.getInvoiceById(invoiceId, userId);

  return aiClient.generatePaymentReminder({
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client?.name || 'Valued Client',
    amount: invoice.totalAmount,
    dueDate: invoice.dueDate,
    daysPastDue: parseInt(daysPastDue, 10) || 0,
    tone
  });
}
