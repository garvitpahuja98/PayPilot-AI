/**
 * @file ai.controller.js
 * @description Controllers for AI assistant endpoints.
 */

import * as aiService from './ai.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function generateInvoiceDraft(req, res, next) {
  try {
    const { projectSummary, targetHourlyRate, currency } = req.body;
    const result = await aiService.createInvoiceDraft({
      projectSummary,
      targetHourlyRate,
      currency
    });
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function generatePaymentReminder(req, res, next) {
  try {
    const { invoiceId, tone, daysPastDue } = req.body;
    const result = await aiService.createPaymentReminder(
      { invoiceId, tone, daysPastDue },
      req.user?.id
    );
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}
