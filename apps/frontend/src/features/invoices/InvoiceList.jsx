'use client';

/**
 * @file InvoiceList.jsx
 * @description Invoices data table with filtering and quick actions.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Badge from '../../components/Badge.jsx';
import Alert from '../../components/Alert.jsx';
import { fetchInvoices } from '../../services/invoiceService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchInvoices({ status: filter || undefined })
      .then((res) => {
        setInvoices(res.invoices || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1>Invoices</h1>
          <p>Create, manage, and track payment status for all client billings.</p>
        </div>
        <Link href="/invoices/new" className="btn btn-primary">
          + Create New Invoice
        </Link>
      </div>

      {error && <Alert type="warning">{error}</Alert>}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['', 'DRAFT', 'SENT', 'PAID', 'OVERDUE'].map((status) => (
          <button
            key={status}
            type="button"
            className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(status)}
          >
            {status || 'All Invoices'}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading invoices...</p>
      ) : invoices.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>No invoices found matching your filter.</p>
          <Link href="/invoices/new" className="btn btn-primary btn-sm">
            Draft an Invoice
          </Link>
        </div>
      ) : (
        <div className="table-container card" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td><strong>{inv.invoiceNumber}</strong></td>
                  <td>
                    <div>{inv.client?.name || 'Client'}</div>
                    <small style={{ color: 'var(--color-neutral-500)' }}>
                      {inv.client?.email || ''}
                    </small>
                  </td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td>{formatDate(inv.dueDate)}</td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount, inv.currency)}</td>
                  <td>
                    <Badge status={inv.status} />
                  </td>
                  <td>
                    {inv.status !== 'PAID' && (
                      <Link href={`/payments?invoiceId=${inv.id}`} className="btn btn-sm btn-accent">
                        Checkout
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
