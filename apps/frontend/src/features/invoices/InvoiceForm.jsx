'use client';

/**
 * @file InvoiceForm.jsx
 * @description Invoice creation form with live calculations and AI draft assistant integration.
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Alert from '../../components/Alert.jsx';
import { createInvoice } from '../../services/invoiceService.js';
import { requestInvoiceDraft } from '../../services/aiService.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function InvoiceForm() {
  const router = useRouter();

  const [dueDate, setDueDate] = useState('2026-11-15');
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('Payment due within 14 days.');
  const [items, setItems] = useState([
    { description: 'Design & Software Architecture Consulting', quantity: 1, unitPrice: 1200 }
  ]);

  // AI draft assistant modal state
  const [aiPrompt, setAiPrompt] = useState('');
  const [hourlyRate, setHourlyRate] = useState(85);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculations
  const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0), 0);
  const taxAmount = (subtotal * (parseFloat(taxRate) || 0)) / 100;
  const totalAmount = subtotal + taxAmount;

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleAiDraft = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiSuccessMsg('');
    setError(null);
    try {
      const draft = await requestInvoiceDraft({
        projectSummary: aiPrompt,
        targetHourlyRate: hourlyRate,
        currency
      });

      if (draft.items && draft.items.length > 0) {
        setItems(draft.items);
      }
      if (draft.suggestedNotes) {
        setNotes(draft.suggestedNotes);
      }
      setAiSuccessMsg('AI draft generated and populated into line items!');
    } catch (err) {
      setError(`AI Assistant draft failed: ${err.message}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createInvoice({
        dueDate,
        currency,
        taxRate: parseFloat(taxRate) || 0,
        notes,
        items: items.map((it) => ({
          description: it.description,
          quantity: parseFloat(it.quantity) || 1,
          unitPrice: parseFloat(it.unitPrice) || 0
        }))
      });
      router.push('/invoices');
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Create New Invoice</h1>

      {/* AI Assistant Quick Generator Banner */}
      <Card
        title="✨ AI Invoice Assistant"
        className="form-group"
        style={{ borderColor: 'var(--color-primary)', background: '#f0f7ff' }}
      >
        <p style={{ fontSize: '0.875rem' }}>
          Describe the work completed in natural language. PayPilot AI will estimate hours, set rates, and draft itemized billable line items.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Built responsive Next.js frontend with dark mode and Stripe checkout integration..."
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
          />
          <input
            type="number"
            className="form-input"
            style={{ width: '130px' }}
            placeholder="Rate ($/hr)"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
          />
          <Button
            variant="primary"
            onClick={handleAiDraft}
            isLoading={isAiLoading}
          >
            Draft with AI
          </Button>
        </div>
        {aiSuccessMsg && <div style={{ color: 'var(--color-accent)', fontSize: '0.8rem', marginTop: '0.5rem' }}>✓ {aiSuccessMsg}</div>}
      </Card>

      {error && <Alert type="warning">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Card title="Invoice Metadata" style={{ marginBottom: '1.5rem' }}>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label">Payment Due Date</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Billing Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Line Items Card */}
        <Card title="Line Items" style={{ marginBottom: '1.5rem' }}>
          {items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem', alignItems: 'center' }}>
              <input
                type="text"
                className="form-input"
                style={{ flex: 3 }}
                placeholder="Description of service..."
                value={item.description}
                onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                required
              />
              <input
                type="number"
                className="form-input"
                style={{ width: '80px' }}
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                min="0.25"
                step="0.25"
                required
              />
              <input
                type="number"
                className="form-input"
                style={{ width: '120px' }}
                placeholder="Rate"
                value={item.unitPrice}
                onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                min="0"
                step="0.01"
                required
              />
              <div style={{ width: '100px', fontWeight: 600, textAlign: 'right' }}>
                {formatCurrency((parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), currency)}
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleRemoveItem(idx)}
                disabled={items.length === 1}
              >
                ✕
              </button>
            </div>
          ))}

          <Button variant="secondary" size="sm" onClick={handleAddItem}>
            + Add Another Line Item
          </Button>

          {/* Subtotal & Tax Calculation Panel */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-neutral-200)', textAlign: 'right' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              Subtotal: <strong>{formatCurrency(subtotal, currency)}</strong>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span>Tax Rate (%):</span>
              <input
                type="number"
                className="form-input"
                style={{ width: '80px', display: 'inline-block' }}
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                min="0"
                max="100"
                step="0.25"
              />
              <span>Amount: {formatCurrency(taxAmount, currency)}</span>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              Total: {formatCurrency(totalAmount, currency)}
            </div>
          </div>
        </Card>

        {/* Notes */}
        <Card title="Notes & Terms" style={{ marginBottom: '1.5rem' }}>
          <textarea
            className="form-textarea"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Card>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => router.push('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save & Issue Invoice
          </Button>
        </div>
      </form>
    </div>
  );
}
