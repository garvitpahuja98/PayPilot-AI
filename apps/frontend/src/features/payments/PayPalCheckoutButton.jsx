'use client';

/**
 * @file PayPalCheckoutButton.jsx
 * @description PayPal Sandbox Checkout integration UI.
 * 
 * ARCHITECTURAL RULE:
 * Payment status is updated to PAID ONLY AFTER the backend successfully verifies
 * the capture with the PayPal API. Client code never determines payment truth.
 */

import React, { useState } from 'react';
import Button from '../../components/Button.jsx';
import Alert from '../../components/Alert.jsx';
import { createPaymentOrder, capturePaymentOrder } from '../../services/paymentService.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function PayPalCheckoutButton({ invoice, onPaymentSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleCheckout = async () => {
    if (!invoice?.id) return;
    setLoading(true);
    setError(null);

    try {
      // Step 1: Request backend to initialize PayPal v2 order
      const order = await createPaymentOrder(invoice.id);

      // Step 2: In real production, the PayPal JS SDK modal opens.
      // Here we simulate the onApprove event invoking backend capture verification:
      const captureResult = await capturePaymentOrder({
        paypalOrderId: order.paypalOrderId,
        invoiceId: invoice.id
      });

      setSuccessData(captureResult);
      if (onPaymentSuccess) {
        onPaymentSuccess(captureResult);
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed');
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="card" style={{ background: 'var(--color-accent-light)', borderColor: '#a7f3d0' }}>
        <h3 style={{ color: '#065f46', marginBottom: '0.5rem' }}>✓ Payment Verified & Settled</h3>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          PayPal Order ID: <code>{successData.paypalOrderId}</code>
        </p>
        <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
          Capture ID: <code>{successData.paypalCaptureId}</code>
        </p>
        <span className="badge badge-paid">STATUS: COMPLETED</span>
      </div>
    );
  }

  return (
    <div>
      {error && <Alert type="warning">{error}</Alert>}

      <div style={{ padding: '1rem', border: '1px solid var(--color-neutral-200)', borderRadius: 'var(--radius-md)', background: '#fff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontWeight: 600 }}>Amount Due</div>
            <div style={{ fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: 700 }}>
              {formatCurrency(invoice.totalAmount, invoice.currency)}
            </div>
          </div>
          <span className="badge badge-sent">PayPal Sandbox</span>
        </div>

        <Button
          variant="primary"
          style={{ width: '100%', backgroundColor: '#0070ba', borderColor: '#0070ba' }}
          onClick={handleCheckout}
          isLoading={loading}
        >
          💳 Pay with PayPal Sandbox
        </Button>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', marginTop: '0.75rem', textAlign: 'center' }}>
          Protected by server-side PayPal Capture Verification. AI outputs cannot alter payment state.
        </p>
      </div>
    </div>
  );
}
