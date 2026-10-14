/**
 * @file paymentService.js
 * @description Frontend service for PayPal Checkout order creation and capture verification.
 */

import { request } from './apiClient.js';

export async function createPaymentOrder(invoiceId) {
  return request('/payments/create-order', {
    method: 'POST',
    body: JSON.stringify({ invoiceId })
  });
}

export async function capturePaymentOrder({ paypalOrderId, invoiceId }) {
  return request('/payments/capture-order', {
    method: 'POST',
    body: JSON.stringify({ paypalOrderId, invoiceId })
  });
}
