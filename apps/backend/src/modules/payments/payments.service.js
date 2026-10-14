/**
 * @file payments.service.js
 * @description Payments domain service coordinating PayPal Sandbox checkout, order capture, and status updates.
 * 
 * CRITICAL ARCHITECTURAL INVARIANT:
 * Invoice status is updated to PAID and payment record is stored as COMPLETED
 * ONLY IF the backend verifies successful capture from PayPal.
 */

import * as paypalClient from '../../services/paypal/paypalClient.js';
import * as invoicesService from '../invoices/invoices.service.js';
import { inMemoryStore } from '../../config/db.js';
import { BadRequestError, AppError } from '../../utils/errors.js';
import { INVOICE_STATUS, PAYMENT_STATUS, HTTP_STATUS, ERROR_CODES } from '@paypilot/shared';

export async function createOrder(invoiceId, userId) {
  if (!invoiceId) {
    throw new BadRequestError('invoiceId is required to create a payment order');
  }

  const invoice = await invoicesService.getInvoiceById(invoiceId, userId);

  if (invoice.status === INVOICE_STATUS.PAID) {
    throw new BadRequestError(`Invoice ${invoice.invoiceNumber} is already paid`);
  }

  const orderResult = await paypalClient.createPayPalOrder({
    amount: invoice.totalAmount,
    currency: invoice.currency,
    invoiceNumber: invoice.invoiceNumber,
    invoiceId: invoice.id
  });

  return orderResult;
}

export async function captureOrder({ paypalOrderId, invoiceId }, userId) {
  if (!paypalOrderId || !invoiceId) {
    throw new BadRequestError('paypalOrderId and invoiceId are required');
  }

  const invoice = await invoicesService.getInvoiceById(invoiceId, userId);

  // Invoke PayPal server-to-server capture verification
  const captureResult = await paypalClient.capturePayPalOrder({
    paypalOrderId,
    invoiceId
  });

  if (!captureResult.success || captureResult.status !== 'COMPLETED') {
    throw new AppError(
      'PayPal capture verification failed or payment declined',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_CODES.PAYPAL_VERIFICATION_FAILED
    );
  }

  // Record verified payment
  const paymentRecord = {
    id: `p-${Date.now()}`,
    invoiceId,
    paypalOrderId,
    paypalCaptureId: captureResult.paypalCaptureId,
    amount: captureResult.amount || invoice.totalAmount,
    currency: captureResult.currency || invoice.currency,
    status: PAYMENT_STATUS.COMPLETED,
    paymentMethod: 'PAYPAL',
    payerEmail: captureResult.payerEmail || 'sandbox-payer@paypilot.dev',
    verifiedAt: captureResult.verifiedAt || new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  inMemoryStore.payments.push(paymentRecord);

  // Transition invoice to PAID
  await invoicesService.updateInvoice(invoiceId, userId, {
    status: INVOICE_STATUS.PAID
  });

  return {
    paymentId: paymentRecord.id,
    invoiceId,
    paypalOrderId: paymentRecord.paypalOrderId,
    paypalCaptureId: paymentRecord.paypalCaptureId,
    amount: paymentRecord.amount,
    currency: paymentRecord.currency,
    status: paymentRecord.status,
    invoiceStatus: INVOICE_STATUS.PAID,
    payerEmail: paymentRecord.payerEmail,
    verifiedAt: paymentRecord.verifiedAt
  };
}
