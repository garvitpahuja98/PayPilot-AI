'use client';

/**
 * @file page.jsx
 * @description Landing & architectural status overview for PayPilot AI.
 */

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';

export default function HomePage() {
  const [backendHealth, setBackendHealth] = useState(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendHealth(data))
      .catch(() => setBackendHealth({ success: false }));
  }, []);

  const modules = [
    {
      title: '📊 Financial Dashboard',
      description: 'Real-time revenue summaries, outstanding client balances, and invoice count statistics.',
      href: '/dashboard',
      status: 'Ready for Review'
    },
    {
      title: '📄 Invoice Management',
      description: 'Draft, issue, and manage client invoices with automated subtotal and tax calculation.',
      href: '/invoices',
      status: 'Ready for Review'
    },
    {
      title: '💳 PayPal Checkout Sandbox',
      description: 'Client payment order creation with strict server-side capture verification.',
      href: '/payments',
      status: 'Ready for Review'
    },
    {
      title: '🤖 AI Assistant',
      description: 'Convert natural language deliverables into itemized line items and generate polite reminder emails.',
      href: '/ai-assistant',
      status: 'Ready for Review'
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '2.5rem 0', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2.75rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          Smart Invoicing & Payments for Independent Creators
        </h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--color-neutral-600)', marginBottom: '1.5rem' }}>
          PayPilot AI streamlines billing, captures verified payments with PayPal Sandbox, and leverages AI to draft professional invoices in seconds.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/dashboard" className="btn btn-primary">
            Explore Dashboard
          </Link>
          <Link href="/invoices/new" className="btn btn-secondary">
            + Create New Invoice
          </Link>
        </div>
      </div>

      {/* Backend & Environment Telemetry Banner */}
      <div className="card" style={{ marginBottom: '2rem', background: '#f8fafc' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>Architecture Status: </strong>
            <span style={{ color: backendHealth?.success ? 'var(--color-accent)' : 'var(--color-warning)', fontWeight: 600 }}>
              {backendHealth?.success ? '● Backend API Connected (:5000)' : '○ Standalone Mock Mode'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <span className="badge badge-paid">Next.js 14 Frontend</span>
            <span className="badge badge-sent">Express REST Backend</span>
            <span className="badge badge-draft">PostgreSQL 14+ DDL</span>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <h2 style={{ marginBottom: '1rem' }}>Core Modules</h2>
      <div className="grid grid-cols-2" style={{ marginBottom: '2.5rem' }}>
        {modules.map((m) => (
          <Card key={m.href} title={m.title}>
            <p>{m.description}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <Badge status={m.status === 'Ready for Review' ? 'PAID' : 'DRAFT'} label={m.status} />
              <Link href={m.href} className="btn btn-primary btn-sm">
                Open Module →
              </Link>
            </div>
          </Card>
        ))}
      </div>

      {/* Fork & Development Architecture Guide */}
      <Card title="🚀 Team Onboarding & Fork Workflow">
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <p>
            This monorepo is engineered for <strong>independent, parallel team development</strong>. Teammates can fork the repository, pick a feature module, and develop without blocking one another:
          </p>
          <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
            <li><strong>Frontend Contributors:</strong> Modify <code>apps/frontend/src/features/&lt;module&gt;</code>. Work against live backend or mock data.</li>
            <li><strong>Backend Contributors:</strong> Implement controllers and services in <code>apps/backend/src/modules/&lt;module&gt;</code>.</li>
            <li><strong>Database Contributors:</strong> Add incremental SQL migration scripts in <code>database/migrations/</code>.</li>
            <li><strong>Contracts:</strong> All endpoints honor <code>docs/API_CONTRACTS.md</code> and shared enums in <code>packages/shared</code>.</li>
          </ul>
          <Link href="/ai-assistant" style={{ fontWeight: 600 }}>
            Read the Module Guide & Contributing Documentation →
          </Link>
        </div>
      </Card>
    </div>
  );
}
