/**
 * @file db.js
 * @description Database pool setup with graceful offline/mock fallback for initial local development.
 */

import pg from 'pg';
import { config } from './environment.js';

const { Pool } = pg;

let pool = null;
let isConnected = false;

// In-memory volatile store for offline development when Postgres is not running
export const inMemoryStore = {
  users: [
    {
      id: 'a0000000-0000-0000-0000-000000000001',
      email: 'alex@paypilot.dev',
      fullName: 'Alex Morgan',
      businessName: 'Apex Design Studio',
      role: 'FREELANCER',
      defaultCurrency: 'USD'
    }
  ],
  clients: [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      userId: 'a0000000-0000-0000-0000-000000000001',
      name: 'Sarah Jenkins',
      email: 'sarah@techflow.io',
      company: 'TechFlow Solutions',
      phone: '+1 (555) 234-5678'
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      userId: 'a0000000-0000-0000-0000-000000000001',
      name: 'David Chen',
      email: 'dchen@quantumretail.com',
      company: 'Quantum Retail Group',
      phone: '+1 (555) 987-6543'
    }
  ],
  invoices: [
    {
      id: 'i0000000-0000-0000-0000-000000000001',
      userId: 'a0000000-0000-0000-0000-000000000001',
      clientId: 'c0000000-0000-0000-0000-000000000001',
      invoiceNumber: 'INV-2026-001',
      status: 'PAID',
      issueDate: '2026-10-01',
      dueDate: '2026-10-14',
      currency: 'USD',
      subtotal: 2500.00,
      taxRate: 0.0,
      taxAmount: 0.00,
      totalAmount: 2500.00,
      notes: 'Brand Identity Design System',
      items: [
        {
          id: 'item-01',
          description: 'UI/UX Design Concept & Wireframes',
          quantity: 1,
          unitPrice: 1500.00,
          amount: 1500.00
        },
        {
          id: 'item-02',
          description: 'Design System Components in Figma',
          quantity: 1,
          unitPrice: 1000.00,
          amount: 1000.00
        }
      ],
      createdAt: '2026-10-01T10:00:00.000Z',
      updatedAt: '2026-10-14T12:00:00.000Z'
    },
    {
      id: 'i0000000-0000-0000-0000-000000000002',
      userId: 'a0000000-0000-0000-0000-000000000001',
      clientId: 'c0000000-0000-0000-0000-000000000002',
      invoiceNumber: 'INV-2026-002',
      status: 'SENT',
      issueDate: '2026-10-10',
      dueDate: '2026-10-25',
      currency: 'USD',
      subtotal: 3400.00,
      taxRate: 8.25,
      taxAmount: 280.50,
      totalAmount: 3680.50,
      notes: 'E-commerce Checkout Migration Phase 1',
      items: [
        {
          id: 'item-03',
          description: 'Next.js Frontend Checkout Architecture',
          quantity: 34,
          unitPrice: 100.00,
          amount: 3400.00
        }
      ],
      createdAt: '2026-10-10T09:00:00.000Z',
      updatedAt: '2026-10-10T09:00:00.000Z'
    },
    {
      id: 'i0000000-0000-0000-0000-000000000003',
      userId: 'a0000000-0000-0000-0000-000000000001',
      clientId: 'c0000000-0000-0000-0000-000000000001',
      invoiceNumber: 'INV-2026-003',
      status: 'DRAFT',
      issueDate: '2026-10-14',
      dueDate: '2026-10-28',
      currency: 'USD',
      subtotal: 1800.00,
      taxRate: 0.0,
      taxAmount: 0.00,
      totalAmount: 1800.00,
      notes: 'Design System Audit & Documentation',
      items: [
        {
          id: 'item-04',
          description: 'Component Accessibility Review',
          quantity: 18,
          unitPrice: 100.00,
          amount: 1800.00
        }
      ],
      createdAt: '2026-10-14T11:00:00.000Z',
      updatedAt: '2026-10-14T11:00:00.000Z'
    }
  ],
  payments: [
    {
      id: 'p0000000-0000-0000-0000-000000000001',
      invoiceId: 'i0000000-0000-0000-0000-000000000001',
      paypalOrderId: '5O190127TN364715T',
      paypalCaptureId: '2C456789TN364715A',
      amount: 2500.00,
      currency: 'USD',
      status: 'COMPLETED',
      paymentMethod: 'PAYPAL',
      payerEmail: 'sarah@techflow.io',
      verifiedAt: '2026-10-14T12:00:00.000Z',
      createdAt: '2026-10-14T11:59:00.000Z'
    }
  ]
};

/**
 * Initializes database pool and tests connectivity.
 */
export async function initDatabase() {
  try {
    pool = new Pool({
      connectionString: config.database.url,
      connectionTimeoutMillis: 2000
    });

    const client = await pool.connect();
    isConnected = true;
    client.release();
    console.log('[Database] Connected to PostgreSQL successfully.');
  } catch (error) {
    isConnected = false;
    if (config.database.allowOffline) {
      console.warn(
        '[Database] PostgreSQL connection failed. ALLOW_OFFLINE_DB=true is enabled; using in-memory store for local development.'
      );
    } else {
      console.error('[Database] PostgreSQL connection error:', error.message);
      throw error;
    }
  }
}

/**
 * Executes a SQL query or transparently delegates to offline mock handlers.
 * @param {string} text 
 * @param {Array} params 
 */
export async function query(text, params) {
  if (isConnected && pool) {
    return pool.query(text, params);
  }
  return { rows: [] };
}

export function isDatabaseConnected() {
  return isConnected;
}
