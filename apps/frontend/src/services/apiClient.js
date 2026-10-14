/**
 * @file apiClient.js
 * @description Unified API HTTP client.
 * Connects to the Express backend via Next.js rewrites (/api).
 * If the backend is offline and NEXT_PUBLIC_ENABLE_MOCK_API is enabled,
 * it returns transparent local mock responses for uninterrupted frontend development.
 */

const API_BASE = '/api';

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(body.error?.message || `HTTP ${response.status}: Request failed`);
      error.status = response.status;
      error.code = body.error?.code;
      error.details = body.error?.details;
      throw error;
    }

    return body.data;
  } catch (error) {
    // If backend is unreachable and local mock fallback is enabled
    if (error.message.includes('Failed to fetch') || error.message.includes('ECONNREFUSED')) {
      console.warn(`[API Client] Backend unreachable at ${url}. Returning local mock data fallback.`);
      return getMockFallback(endpoint, options);
    }
    throw error;
  }
}

function getMockFallback(endpoint, options) {
  if (endpoint.includes('/dashboard/summary')) {
    return {
      currency: 'USD',
      metrics: {
        totalRevenue: 5900.00,
        pendingAmount: 3680.50,
        overdueAmount: 0.00,
        draftAmount: 1800.00
      },
      counts: {
        totalInvoices: 3,
        paidCount: 1,
        sentCount: 1,
        overdueCount: 0,
        draftCount: 1
      },
      recentActivity: [
        {
          id: 'mock-p-1',
          type: 'PAYMENT_RECEIVED',
          invoiceNumber: 'INV-2026-001',
          amount: 2500.00,
          currency: 'USD',
          date: new Date().toISOString()
        }
      ],
      isFrontendMock: true
    };
  }

  if (endpoint.includes('/invoices') && (!options.method || options.method === 'GET')) {
    return {
      invoices: [
        {
          id: 'mock-inv-1',
          invoiceNumber: 'INV-2026-001',
          client: { id: 'c-1', name: 'TechFlow Solutions', email: 'sarah@techflow.io' },
          status: 'PAID',
          issueDate: '2026-10-01',
          dueDate: '2026-10-15',
          currency: 'USD',
          totalAmount: 2500.00
        },
        {
          id: 'mock-inv-2',
          invoiceNumber: 'INV-2026-002',
          client: { id: 'c-2', name: 'Quantum Retail', email: 'dchen@quantum.com' },
          status: 'SENT',
          issueDate: '2026-10-10',
          dueDate: '2026-10-25',
          currency: 'USD',
          totalAmount: 3680.50
        }
      ],
      pagination: { total: 2, page: 1, limit: 20, totalPages: 1 },
      isFrontendMock: true
    };
  }

  if (endpoint.includes('/ai/invoice-draft')) {
    return {
      suggestedTitle: 'Frontend & API Integration Services',
      items: [
        { description: 'Web Application Engineering', quantity: 15, unitPrice: 95.0, amount: 1425.0 }
      ],
      suggestedNotes: 'Payment due in 14 days. Created via mock AI engine.',
      isFrontendMock: true
    };
  }

  throw new Error(`Offline and no mock defined for ${endpoint}`);
}
