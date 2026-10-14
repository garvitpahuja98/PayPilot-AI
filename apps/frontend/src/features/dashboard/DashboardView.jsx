'use client';

/**
 * @file DashboardView.jsx
 * @description Renders financial summary cards, invoice distribution, and recent activity.
 */

import React, { useEffect, useState } from 'react';
import Card from '../../components/Card.jsx';
import Alert from '../../components/Alert.jsx';
import { fetchDashboardSummary } from '../../services/dashboardService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function DashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardSummary()
      .then((res) => setData(res))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center' }}>Loading dashboard metrics...</div>;
  }

  const metrics = data?.metrics || {
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    draftAmount: 0
  };

  const counts = data?.counts || {
    totalInvoices: 0,
    paidCount: 0,
    sentCount: 0,
    overdueCount: 0,
    draftCount: 0
  };

  return (
    <div>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Financial Dashboard</h1>
          <p>Real-time analytics and settlement totals for your freelance business.</p>
        </div>
      </div>

      {data?.isFrontendMock && (
        <Alert type="warning" title="Mock Simulation Mode">
          Displaying local development data because the backend or database is offline.
        </Alert>
      )}

      {error && (
        <Alert type="warning" title="Offline Dev Mode">
          Unable to fetch live backend metrics: {error}. Using default view state.
        </Alert>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-4" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-label">Total Revenue (Paid)</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)' }}>
            {formatCurrency(metrics.totalRevenue)}
          </div>
          <div className="stat-subtext">{counts.paidCount} settled invoices</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Collection</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {formatCurrency(metrics.pendingAmount)}
          </div>
          <div className="stat-subtext">{counts.sentCount} invoices awaiting client</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Overdue Balance</div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {formatCurrency(metrics.overdueAmount)}
          </div>
          <div className="stat-subtext">{counts.overdueCount} past due deadline</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Draft Pipeline</div>
          <div className="stat-value">
            {formatCurrency(metrics.draftAmount)}
          </div>
          <div className="stat-subtext">{counts.draftCount} unissued drafts</div>
        </div>
      </div>

      {/* Activity & Invoicing Breakdown */}
      <div className="grid grid-cols-2">
        <Card title="Recent Transactions">
          {(!data?.recentActivity || data.recentActivity.length === 0) ? (
            <p>No recent payment activity.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentActivity.map((act) => (
                    <tr key={act.id}>
                      <td><strong>{act.invoiceNumber}</strong></td>
                      <td>{formatDate(act.date)}</td>
                      <td style={{ color: 'var(--color-accent)', fontWeight: 600 }}>
                        +{formatCurrency(act.amount, act.currency)}
                      </td>
                      <td>
                        <span className="badge badge-paid">PAYPAL CAPTURE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="Module Status & Integration Health">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <span>Express Backend API</span>
              <span className="badge badge-paid">ONLINE (:5000)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <span>Database State</span>
              <span className="badge badge-sent">PostgreSQL / In-Memory Mock</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--color-neutral-200)' }}>
              <span>PayPal Checkout Engine</span>
              <span className="badge badge-sent">Sandbox v2 Mode</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>AI Assistant Engine</span>
              <span className="badge badge-paid">Gemini / Deterministic Mock</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
