'use client';

/**
 * @file payments/page.jsx
 * @description Payments overview & PayPal Checkout test interface.
 */

import React, { useEffect, useState } from 'react';
import Card from '../../components/Card.jsx';
import Alert from '../../components/Alert.jsx';
import PayPalCheckoutButton from '../../features/payments/PayPalCheckoutButton.jsx';
import { fetchInvoices } from '../../services/invoiceService.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function PaymentsPage() {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices()
      .then((res) => {
        const list = res.invoices || [];
        setInvoices(list);
        const pending = list.find((i) => i.status !== 'PAID') || list[0];
        setSelectedInvoice(pending);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Payments & Checkout Verification</h1>
        <p>PayPal Checkout Sandbox order initiation and server-side capture verification.</p>
      </div>

      <Alert type="info" title="Payment Integrity Invariant">
        Invoice status can only be marked as PAID after the backend service verifies authentic capture from PayPal API. Client code and AI services cannot alter payment states.
      </Alert>

      <div className="grid grid-cols-2">
        <Card title="Select Invoice for Checkout">
          {loading ? (
            <p>Loading invoices...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvoice(inv)}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${selectedInvoice?.id === inv.id ? 'var(--color-primary)' : 'var(--color-neutral-200)'}`,
                    cursor: 'pointer',
                    background: selectedInvoice?.id === inv.id ? 'var(--color-primary-light)' : '#fff',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <strong>{inv.invoiceNumber}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-neutral-600)' }}>
                      {inv.client?.name || 'Client'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>{formatCurrency(inv.totalAmount, inv.currency)}</div>
                    <span className={`badge ${inv.status === 'PAID' ? 'badge-paid' : 'badge-sent'}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="PayPal Checkout Sandbox">
          {selectedInvoice ? (
            <PayPalCheckoutButton
              invoice={selectedInvoice}
              onPaymentSuccess={(capture) => {
                setSelectedInvoice((prev) => ({ ...prev, status: 'PAID' }));
              }}
            />
          ) : (
            <p>Select an invoice on the left to initialize PayPal checkout.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
