# Shared API Contract Schema Specifications

This file defines the machine- and developer-readable payload standards shared across **apps/frontend** and **apps/backend**.

## 1. Unified Response Envelope

All API endpoints MUST respond with one of the two standard envelope structures:

### Success Response (`2xx`)
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable informational message"
}
```

### Error Response (`4xx`, `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | RESOURCE_NOT_FOUND | UNAUTHORIZED | etc",
    "message": "Human-readable description of error",
    "details": [
      {
        "field": "amount",
        "issue": "Must be greater than 0.00"
      }
    ]
  }
}
```

---

## 2. Shared Data Models

### Invoice Object
```json
{
  "id": "c1f158cb-09a8-4235-8622-04db80f288d4",
  "invoiceNumber": "INV-2026-001",
  "userId": "u1a2b3c4-0000-0000-0000-000000000001",
  "clientId": "d3b07384-d113-4ec6-8051-51de83b6314f",
  "clientName": "Acme Corp",
  "clientEmail": "billing@acmecorp.com",
  "status": "DRAFT | SENT | PAID | OVERDUE | CANCELLED",
  "issueDate": "2026-10-15",
  "dueDate": "2026-10-30",
  "currency": "USD",
  "subtotal": 1200.00,
  "tax": 120.00,
  "totalAmount": 1320.00,
  "notes": "Thank you for your business.",
  "items": [
    {
      "id": "i1-item-uuid",
      "description": "Full-stack Web Architecture Design",
      "quantity": 1,
      "unitPrice": 1200.00,
      "amount": 1200.00
    }
  ],
  "createdAt": "2026-10-14T23:00:00.000Z",
  "updatedAt": "2026-10-14T23:00:00.000Z"
}
```

### Payment Object
```json
{
  "id": "p9a8b7c6-0000-0000-0000-000000000001",
  "invoiceId": "c1f158cb-09a8-4235-8622-04db80f288d4",
  "paypalOrderId": "5O190127TN364715T",
  "paypalCaptureId": "2C456789TN364715A",
  "amount": 1320.00,
  "currency": "USD",
  "status": "PENDING | COMPLETED | FAILED | REFUNDED",
  "paymentMethod": "PAYPAL",
  "payerEmail": "payer@example.com",
  "verifiedAt": "2026-10-15T14:32:00.000Z",
  "createdAt": "2026-10-15T14:31:00.000Z"
}
```

> For exhaustive endpoint documentation, query params, status codes, and curl examples, see the authoritative document: [docs/API_CONTRACTS.md](../../docs/API_CONTRACTS.md).
