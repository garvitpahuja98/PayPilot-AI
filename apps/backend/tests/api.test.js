/**
 * @file api.test.js
 * @description Contract and integration tests for core PayPilot AI backend endpoints.
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('PayPilot AI Backend API', () => {
  it('GET /api/health should return 200 OK with healthy status payload', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ONLINE');
    expect(res.body.data.service).toBe('paypilot-backend');
  });

  it('GET /api/dashboard/summary should return financial metrics envelope', async () => {
    const res = await request(app).get('/api/dashboard/summary');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('metrics');
    expect(res.body.data.metrics).toHaveProperty('totalRevenue');
    expect(res.body.data).toHaveProperty('counts');
  });

  it('GET /api/invoices should return list of invoices matching contract', async () => {
    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.invoices)).toBe(true);
    expect(res.body.data).toHaveProperty('pagination');
  });

  it('POST /api/invoices should create a draft invoice', async () => {
    const newInvoice = {
      dueDate: '2026-11-30',
      currency: 'USD',
      taxRate: 5.0,
      notes: 'Initial test invoice',
      items: [
        {
          description: 'Frontend Architecture Setup',
          quantity: 2,
          unitPrice: 150.00
        }
      ]
    };

    const res = await request(app)
      .post('/api/invoices')
      .send(newInvoice);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('DRAFT');
    expect(res.body.data.subtotal).toBe(300.00);
    expect(res.body.data.totalAmount).toBe(315.00);
  });

  it('POST /api/invoices should reject empty line items with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({ dueDate: '2026-11-30', items: [] });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST /api/ai/invoice-draft should return structured line items', async () => {
    const res = await request(app)
      .post('/api/ai/invoice-draft')
      .send({
        projectSummary: 'Built an e-commerce checkout flow in React',
        targetHourlyRate: 90
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('suggestedTitle');
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it('GET /api/unknown-route should return 404 with error envelope', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('RESOURCE_NOT_FOUND');
  });
});
