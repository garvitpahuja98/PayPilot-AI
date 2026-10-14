/**
 * @file invoices.service.js
 * @description Invoices domain business logic and database interactions.
 */

import { inMemoryStore, isDatabaseConnected, query } from '../../config/db.js';
import { BadRequestError, NotFoundError, ConflictError } from '../../utils/errors.js';
import { INVOICE_STATUS } from '@paypilot/shared';

export async function listInvoices({ userId, status, search, limit = 20, page = 1 }) {
  if (isDatabaseConnected()) {
    let sql = `
      SELECT i.*, json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'company', c.company) AS client
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE i.user_id = $1
    `;
    const params = [userId];

    if (status) {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (i.invoice_number ILIKE $${params.length} OR c.name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, (page - 1) * limit);

    const res = await query(sql, params);
    return {
      invoices: res.rows,
      pagination: {
        total: res.rows.length,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: 1
      }
    };
  }

  // Offline mock fallback
  let list = inMemoryStore.invoices;
  if (status) {
    list = list.filter((inv) => inv.status === status);
  }
  if (search) {
    const s = search.toLowerCase();
    list = list.filter((inv) => inv.invoiceNumber.toLowerCase().includes(s));
  }

  return {
    invoices: list.map((inv) => {
      const client = inMemoryStore.clients.find((c) => c.id === inv.clientId) || {
        id: inv.clientId,
        name: 'Client',
        email: 'client@example.com'
      };
      return {
        ...inv,
        client
      };
    }),
    pagination: {
      total: list.length,
      page: 1,
      limit,
      totalPages: 1
    }
  };
}

export async function getInvoiceById(id, userId) {
  if (isDatabaseConnected()) {
    const invRes = await query(
      `SELECT i.*, 
              json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'company', c.company) as client
       FROM invoices i
       JOIN clients c ON c.id = i.client_id
       WHERE i.id = $1`,
      [id]
    );

    if (invRes.rows.length === 0) {
      throw new NotFoundError(`Invoice with ID ${id} was not found`);
    }

    const itemsRes = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id]);
    const paymentsRes = await query('SELECT * FROM payments WHERE invoice_id = $1', [id]);

    return {
      ...invRes.rows[0],
      items: itemsRes.rows,
      payments: paymentsRes.rows
    };
  }

  const invoice = inMemoryStore.invoices.find((i) => i.id === id);
  if (!invoice) {
    throw new NotFoundError(`Invoice with ID ${id} was not found`);
  }

  const client = inMemoryStore.clients.find((c) => c.id === invoice.clientId) || {
    id: invoice.clientId,
    name: 'Sample Client',
    email: 'client@example.com'
  };
  const payments = inMemoryStore.payments.filter((p) => p.invoiceId === id);

  return {
    ...invoice,
    client,
    payments
  };
}

export async function createInvoice(userId, payload) {
  const { clientId, invoiceNumber, dueDate, currency = 'USD', taxRate = 0.0, notes = '', items = [] } = payload;

  if (!dueDate) throw new BadRequestError('Due date is required');
  if (!items || items.length === 0) throw new BadRequestError('At least one line item is required');

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = parseFloat(((subtotal * taxRate) / 100).toFixed(2));
  const totalAmount = parseFloat((subtotal + taxAmount).toFixed(2));

  const resolvedInvoiceNumber = invoiceNumber || `INV-2026-${String(inMemoryStore.invoices.length + 1).padStart(3, '0')}`;

  const newInvoice = {
    id: `i-dev-${Date.now()}`,
    userId,
    clientId: clientId || inMemoryStore.clients[0].id,
    invoiceNumber: resolvedInvoiceNumber,
    status: INVOICE_STATUS.DRAFT,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate,
    currency,
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxRate: parseFloat(taxRate),
    taxAmount,
    totalAmount,
    notes,
    items: items.map((it, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      description: it.description,
      quantity: parseFloat(it.quantity) || 1,
      unitPrice: parseFloat(it.unitPrice) || 0,
      amount: parseFloat(((parseFloat(it.quantity) || 1) * (parseFloat(it.unitPrice) || 0)).toFixed(2))
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  inMemoryStore.invoices.unshift(newInvoice);
  return newInvoice;
}

export async function updateInvoice(id, userId, updates) {
  const invoice = inMemoryStore.invoices.find((i) => i.id === id);
  if (!invoice) {
    throw new NotFoundError(`Invoice with ID ${id} was not found`);
  }

  if (invoice.status === INVOICE_STATUS.PAID || invoice.status === INVOICE_STATUS.CANCELLED) {
    throw new ConflictError(`Invoices in ${invoice.status} status cannot be edited`);
  }

  Object.assign(invoice, {
    ...updates,
    updatedAt: new Date().toISOString()
  });

  return invoice;
}

export async function cancelInvoice(id, userId) {
  const invoice = inMemoryStore.invoices.find((i) => i.id === id);
  if (!invoice) {
    throw new NotFoundError(`Invoice with ID ${id} was not found`);
  }

  if (invoice.status === INVOICE_STATUS.PAID) {
    throw new ConflictError('Paid invoices cannot be cancelled');
  }

  invoice.status = INVOICE_STATUS.CANCELLED;
  invoice.updatedAt = new Date().toISOString();
  return { id, status: INVOICE_STATUS.CANCELLED };
}
