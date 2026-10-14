/**
 * @file invoiceService.js
 * @description Frontend service for invoice operations (CRUD).
 */

import { request } from './apiClient.js';

export async function fetchInvoices(params = {}) {
  const query = new URLSearchParams();
  if (params.status) query.append('status', params.status);
  if (params.search) query.append('search', params.search);
  const qStr = query.toString();
  return request(`/invoices${qStr ? `?${qStr}` : ''}`);
}

export async function fetchInvoiceById(id) {
  return request(`/invoices/${id}`);
}

export async function createInvoice(payload) {
  return request('/invoices', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export async function updateInvoice(id, payload) {
  return request(`/invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

export async function cancelInvoice(id) {
  return request(`/invoices/${id}`, {
    method: 'DELETE'
  });
}
