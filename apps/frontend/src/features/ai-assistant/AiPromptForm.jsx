'use client';

/**
 * @file AiPromptForm.jsx
 * @description Interactive testing and playground for the AI Assistant module.
 */

import React, { useState } from 'react';
import Card from '../../components/Card.jsx';
import Button from '../../components/Button.jsx';
import Alert from '../../components/Alert.jsx';
import { requestInvoiceDraft, requestPaymentReminder } from '../../services/aiService.js';
import { formatCurrency } from '../../utils/formatters.js';

export default function AiPromptForm() {
  const [activeTab, setActiveTab] = useState('draft'); // 'draft' or 'reminder'

  // Draft state
  const [projectSummary, setProjectSummary] = useState(
    'Redesigned user onboarding flow and implemented automated weekly digest emails in React/Node'
  );
  const [hourlyRate, setHourlyRate] = useState(95);
  const [draftResult, setDraftResult] = useState(null);
  const [isDraftLoading, setIsDraftLoading] = useState(false);

  // Reminder state
  const [invoiceId, setInvoiceId] = useState('i0000000-0000-0000-0000-000000000002');
  const [tone, setTone] = useState('polite');
  const [daysPastDue, setDaysPastDue] = useState(4);
  const [reminderResult, setReminderResult] = useState(null);
  const [isReminderLoading, setIsReminderLoading] = useState(false);

  const [error, setError] = useState(null);

  const handleGenerateDraft = async (e) => {
    e.preventDefault();
    setIsDraftLoading(true);
    setError(null);
    try {
      const res = await requestInvoiceDraft({
        projectSummary,
        targetHourlyRate: hourlyRate,
        currency: 'USD'
      });
      setDraftResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDraftLoading(false);
    }
  };

  const handleGenerateReminder = async (e) => {
    e.preventDefault();
    setIsReminderLoading(true);
    setError(null);
    try {
      const res = await requestPaymentReminder({
        invoiceId,
        tone,
        daysPastDue
      });
      setReminderResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsReminderLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>AI Assistant Playground</h1>
        <p>
          Generate intelligent invoice line item estimates and polite, contextual payment reminders.
        </p>
      </div>

      {error && <Alert type="warning">{error}</Alert>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={`btn ${activeTab === 'draft' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('draft')}
        >
          ✨ Invoice Line Item Drafter
        </button>
        <button
          type="button"
          className={`btn ${activeTab === 'reminder' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reminder')}
        >
          ✉️ Payment Reminder Generator
        </button>
      </div>

      {activeTab === 'draft' ? (
        <div className="grid grid-cols-2">
          <Card title="Input Project Summary">
            <form onSubmit={handleGenerateDraft}>
              <div className="form-group">
                <label className="form-label">Project Deliverables & Summary</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={projectSummary}
                  onChange={(e) => setProjectSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Hourly Rate ($ USD)</label>
                <input
                  type="number"
                  className="form-input"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  min="10"
                  step="5"
                />
              </div>

              <Button type="submit" variant="primary" isLoading={isDraftLoading}>
                Generate Invoice Line Items
              </Button>
            </form>
          </Card>

          <Card title="AI Generated Suggestions">
            {!draftResult ? (
              <p style={{ color: 'var(--color-neutral-500)' }}>
                Enter project details on the left and click generate to inspect AI recommendations.
              </p>
            ) : (
              <div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                  {draftResult.suggestedTitle}
                </h4>

                <div className="table-container" style={{ marginBottom: '1rem' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Rate</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {draftResult.items?.map((it, idx) => (
                        <tr key={idx}>
                          <td>{it.description}</td>
                          <td>{it.quantity}</td>
                          <td>${it.unitPrice}</td>
                          <td><strong>${it.amount}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div style={{ background: 'var(--color-neutral-100)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  <strong>Suggested Terms:</strong> {draftResult.suggestedNotes}
                </div>

                {draftResult.isMock && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span className="badge badge-draft">GENERATED BY LOCAL MOCK ENGINE</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-2">
          <Card title="Reminder Parameters">
            <form onSubmit={handleGenerateReminder}>
              <div className="form-group">
                <label className="form-label">Invoice ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={invoiceId}
                  onChange={(e) => setInvoiceId(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Tone</label>
                  <select
                    className="form-select"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                  >
                    <option value="polite">Polite & Friendly</option>
                    <option value="firm">Firm & Professional</option>
                    <option value="urgent">Urgent & Direct</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Days Past Due</label>
                  <input
                    type="number"
                    className="form-input"
                    value={daysPastDue}
                    onChange={(e) => setDaysPastDue(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" isLoading={isReminderLoading}>
                Generate Reminder Message
              </Button>
            </form>
          </Card>

          <Card title="Generated Reminder Draft">
            {!reminderResult ? (
              <p style={{ color: 'var(--color-neutral-500)' }}>
                Select an invoice and tone to draft a professional reminder email.
              </p>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem', borderBottom: '1px solid var(--color-neutral-200)', paddingBottom: '0.5rem' }}>
                  <strong>Subject:</strong> {reminderResult.subject}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', background: 'var(--color-neutral-50)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  {reminderResult.message}
                </div>
                {reminderResult.isMock && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <span className="badge badge-draft">GENERATED BY LOCAL MOCK ENGINE</span>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
