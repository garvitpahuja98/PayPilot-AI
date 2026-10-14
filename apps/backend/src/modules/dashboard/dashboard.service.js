/**
 * @file dashboard.service.js
 * @description Aggregates financial analytics and invoice statistics for user dashboard.
 */

import { inMemoryStore, isDatabaseConnected, query } from '../../config/db.js';

export async function getDashboardSummary(userId) {
  if (isDatabaseConnected()) {
    // Production Postgres query
    const statsResult = await query(
      `SELECT 
         COUNT(*) AS total_invoices,
         COALESCE(SUM(CASE WHEN status = 'PAID' THEN total_amount ELSE 0 END), 0) AS total_revenue,
         COALESCE(SUM(CASE WHEN status = 'SENT' THEN total_amount ELSE 0 END), 0) AS pending_amount,
         COALESCE(SUM(CASE WHEN status = 'OVERDUE' THEN total_amount ELSE 0 END), 0) AS overdue_amount,
         COALESCE(SUM(CASE WHEN status = 'DRAFT' THEN total_amount ELSE 0 END), 0) AS draft_amount,
         COUNT(CASE WHEN status = 'PAID' THEN 1 END) AS paid_count,
         COUNT(CASE WHEN status = 'SENT' THEN 1 END) AS sent_count,
         COUNT(CASE WHEN status = 'OVERDUE' THEN 1 END) AS overdue_count,
         COUNT(CASE WHEN status = 'DRAFT' THEN 1 END) AS draft_count
       FROM invoices
       WHERE user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];

    const recentPayments = await query(
      `SELECT p.id, 'PAYMENT_RECEIVED' as type, i.invoice_number as "invoiceNumber",
              p.amount, p.currency, p.created_at as "date"
       FROM payments p
       JOIN invoices i ON i.id = p.invoice_id
       WHERE i.user_id = $1
       ORDER BY p.created_at DESC LIMIT 5`,
      [userId]
    );

    return {
      currency: 'USD',
      metrics: {
        totalRevenue: parseFloat(stats.total_revenue),
        pendingAmount: parseFloat(stats.pending_amount),
        overdueAmount: parseFloat(stats.overdue_amount),
        draftAmount: parseFloat(stats.draft_amount)
      },
      counts: {
        totalInvoices: parseInt(stats.total_invoices, 10),
        paidCount: parseInt(stats.paid_count, 10),
        sentCount: parseInt(stats.sent_count, 10),
        overdueCount: parseInt(stats.overdue_count, 10),
        draftCount: parseInt(stats.draft_count, 10)
      },
      recentActivity: recentPayments.rows
    };
  }

  // Offline development fallback
  const userInvoices = inMemoryStore.invoices.filter((inv) => inv.userId === userId || true);

  const metrics = userInvoices.reduce(
    (acc, inv) => {
      if (inv.status === 'PAID') acc.totalRevenue += inv.totalAmount;
      else if (inv.status === 'SENT') acc.pendingAmount += inv.totalAmount;
      else if (inv.status === 'OVERDUE') acc.overdueAmount += inv.totalAmount;
      else if (inv.status === 'DRAFT') acc.draftAmount += inv.totalAmount;
      return acc;
    },
    { totalRevenue: 0, pendingAmount: 0, overdueAmount: 0, draftAmount: 0 }
  );

  const counts = userInvoices.reduce(
    (acc, inv) => {
      acc.totalInvoices += 1;
      if (inv.status === 'PAID') acc.paidCount += 1;
      else if (inv.status === 'SENT') acc.sentCount += 1;
      else if (inv.status === 'OVERDUE') acc.overdueCount += 1;
      else if (inv.status === 'DRAFT') acc.draftCount += 1;
      return acc;
    },
    { totalInvoices: 0, paidCount: 0, sentCount: 0, overdueCount: 0, draftCount: 0 }
  );

  return {
    currency: 'USD',
    metrics: {
      totalRevenue: parseFloat(metrics.totalRevenue.toFixed(2)),
      pendingAmount: parseFloat(metrics.pendingAmount.toFixed(2)),
      overdueAmount: parseFloat(metrics.overdueAmount.toFixed(2)),
      draftAmount: parseFloat(metrics.draftAmount.toFixed(2))
    },
    counts,
    recentActivity: inMemoryStore.payments.map((p) => ({
      id: p.id,
      type: 'PAYMENT_RECEIVED',
      invoiceNumber: 'INV-2026-001',
      amount: p.amount,
      currency: p.currency,
      date: p.createdAt
    }))
  };
}
