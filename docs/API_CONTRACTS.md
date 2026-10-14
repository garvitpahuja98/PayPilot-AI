# PayPilot AI - API Contracts Specification

**Version:** 1.0.0  
**Status:** Canonical Draft  
**Base URL:** `http://localhost:5000/api` (configurable via `NEXT_PUBLIC_API_URL` & `BACKEND_URL`)

This document defines the formal API contracts for PayPilot AI. All client applications (Next.js frontend) and server controllers (Express backend) **must strictly adhere** to the schemas, HTTP status codes, and error formats detailed here.

---

## 1. Unified Envelope Specification

Every response issued by the API uses one of two standardized payload envelopes.

### Success Envelope (`2xx`)
```json
{
  "success": true,
  "data": {},
  "message": "Optional human-readable informational message"
}
```

### Error Envelope (`4xx`, `5xx`)
```json
{
  "success": false,
  "error": {
    "code": "STANDARD_ERROR_CODE",
    "message": "Human-readable description of what failed",
    "details": [
      {
        "field": "dueDate",
        "issue": "Due date cannot be before issue date"
      }
    ]
  }
}
```

### Standard Error Codes
| Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `VALIDATION_ERROR` | `400 Bad Request` | Payload failed structural or semantic validation. |
| `UNAUTHORIZED` | `401 Unauthorized` | Missing or invalid authentication token. |
| `FORBIDDEN` | `403 Forbidden` | Authenticated user lacks access to the requested resource. |
| `RESOURCE_NOT_FOUND` | `404 Not Found` | The requested entity (invoice, client, payment) does not exist. |
| `CONFLICT` | `409 Conflict` | Duplicate key (e.g. invoice number already exists for user). |
| `PAYPAL_VERIFICATION_FAILED` | `422 Unprocessable` | PayPal signature or order capture verification failed. |
| `AI_SERVICE_UNAVAILABLE` | `503 Service Unavailable` | Downstream AI model API quota exceeded or unreachable. |
| `INTERNAL_SERVER_ERROR` | `500 Server Error` | Unexpected backend runtime exception. |

---

## 2. Authentication Protocol

For all protected routes, clients must pass a Bearer token:
```http
Authorization: Bearer <jwt_token>
```
*Note during local prototyping without an auth provider: when running with dev stubs, the backend injects a mock default user context if no token is provided.*

---

## 3. Endpoints

### 3.1. Dashboard Module

#### `GET /api/dashboard/summary`
Retrieves aggregated financial figures and invoice lifecycle counts for the authenticated user.

- **Headers:** `Authorization: Bearer <token>`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "currency": "USD",
    "metrics": {
      "totalRevenue": 15420.00,
      "pendingAmount": 4250.00,
      "overdueAmount": 1200.00,
      "draftAmount": 850.00
    },
    "counts": {
      "totalInvoices": 18,
      "paidCount": 12,
      "sentCount": 4,
      "overdueCount": 1,
      "draftCount": 1
    },
    "recentActivity": [
      {
        "id": "p0000000-0000-0000-0000-000000000001",
        "type": "PAYMENT_RECEIVED",
        "invoiceNumber": "INV-2026-001",
        "amount": 2500.00,
        "currency": "USD",
        "date": "2026-10-14T18:30:00.000Z"
      }
    ]
  }
}
```

---

### 3.2. Invoices Module

#### `GET /api/invoices`
Lists all invoices belonging to the authenticated user with optional filtering and pagination.

- **Query Parameters:**
  - `status` (optional): `DRAFT`, `SENT`, `PAID`, `OVERDUE`, `CANCELLED`
  - `search` (optional): search by invoice number or client name
  - `limit` (optional, default 20): number of items per page
  - `page` (optional, default 1): page index
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "c1f158cb-09a8-4235-8622-04db80f288d4",
        "invoiceNumber": "INV-2026-001",
        "client": {
          "id": "d3b07384-d113-4ec6-8051-51de83b6314f",
          "name": "Acme Corp",
          "email": "billing@acmecorp.com"
        },
        "status": "SENT",
        "issueDate": "2026-10-10",
        "dueDate": "2026-10-25",
        "currency": "USD",
        "subtotal": 1200.00,
        "taxAmount": 120.00,
        "totalAmount": 1320.00,
        "createdAt": "2026-10-10T12:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

#### `POST /api/invoices`
Creates a new invoice and associated line items.

- **Request Body:**
```json
{
  "clientId": "d3b07384-d113-4ec6-8051-51de83b6314f",
  "invoiceNumber": "INV-2026-004",
  "dueDate": "2026-11-01",
  "currency": "USD",
  "taxRate": 10.0,
  "notes": "Payment due within 14 days.",
  "items": [
    {
      "description": "Full-stack Payment Integration",
      "quantity": 1,
      "unitPrice": 1200.00
    }
  ]
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "id": "c1f158cb-09a8-4235-8622-04db80f288d4",
    "invoiceNumber": "INV-2026-004",
    "status": "DRAFT",
    "issueDate": "2026-10-14",
    "dueDate": "2026-11-01",
    "currency": "USD",
    "subtotal": 1200.00,
    "taxRate": 10.0,
    "taxAmount": 120.00,
    "totalAmount": 1320.00,
    "notes": "Payment due within 14 days.",
    "items": [
      {
        "id": "b1b2b3b4-0000-0000-0000-000000000001",
        "description": "Full-stack Payment Integration",
        "quantity": 1.00,
        "unitPrice": 1200.00,
        "amount": 1200.00
      }
    ],
    "createdAt": "2026-10-14T23:30:00.000Z"
  },
  "message": "Invoice created successfully"
}
```
- **Response `400 Bad Request`:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid invoice payload",
    "details": [
      {
        "field": "items",
        "issue": "At least one line item is required"
      }
    ]
  }
}
```

---

#### `GET /api/invoices/:id`
Retrieves a single invoice by its UUID including full line items and linked payment history.

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "c1f158cb-09a8-4235-8622-04db80f288d4",
    "invoiceNumber": "INV-2026-001",
    "status": "PAID",
    "issueDate": "2026-10-01",
    "dueDate": "2026-10-15",
    "currency": "USD",
    "subtotal": 1500.00,
    "taxRate": 0.0,
    "taxAmount": 0.00,
    "totalAmount": 1500.00,
    "notes": "Brand Identity Design",
    "client": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "name": "Sarah Jenkins",
      "email": "sarah@techflow.io",
      "company": "TechFlow Solutions"
    },
    "items": [
      {
        "id": "item-001",
        "description": "Brand Identity Guidelines",
        "quantity": 1,
        "unitPrice": 1500.00,
        "amount": 1500.00
      }
    ],
    "payments": [
      {
        "id": "p0000000-0000-0000-0000-000000000001",
        "paypalOrderId": "5O190127TN364715T",
        "paypalCaptureId": "2C456789TN364715A",
        "amount": 1500.00,
        "status": "COMPLETED",
        "verifiedAt": "2026-10-14T18:30:00.000Z"
      }
    ]
  }
}
```
- **Response `404 Not Found`:**
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Invoice with ID c1f158cb-09a8-4235-8622-04db80f288d4 was not found"
  }
}
```

---

#### `PUT /api/invoices/:id`
Updates an existing draft or sent invoice. *Note: Paid invoices cannot be modified.*

- **Request Body:**
```json
{
  "dueDate": "2026-11-15",
  "notes": "Updated scope: includes dark mode support.",
  "items": [
    {
      "description": "Design system & Dark mode theme",
      "quantity": 1,
      "unitPrice": 1600.00
    }
  ]
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "c1f158cb-09a8-4235-8622-04db80f288d4",
    "invoiceNumber": "INV-2026-004",
    "totalAmount": 1600.00,
    "updatedAt": "2026-10-14T23:35:00.000Z"
  },
  "message": "Invoice updated successfully"
}
```
- **Response `409 Conflict`:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Paid or cancelled invoices cannot be edited"
  }
}
```

---

#### `DELETE /api/invoices/:id`
Soft-deletes or cancels an invoice. Invoices with completed payments cannot be deleted.

- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "id": "c1f158cb-09a8-4235-8622-04db80f288d4",
    "status": "CANCELLED"
  },
  "message": "Invoice cancelled successfully"
}
```

---

### 3.3. Payments Module (PayPal Sandbox Integration)

#### `POST /api/payments/create-order`
Creates a PayPal v2 checkout order for an outstanding invoice.

- **Request Body:**
```json
{
  "invoiceId": "c1f158cb-09a8-4235-8622-04db80f288d4"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "data": {
    "paypalOrderId": "5O190127TN364715T",
    "invoiceId": "c1f158cb-09a8-4235-8622-04db80f288d4",
    "amount": 1320.00,
    "currency": "USD",
    "status": "CREATED",
    "links": [
      {
        "href": "https://www.sandbox.paypal.com/checkoutnow?token=5O190127TN364715T",
        "rel": "approve",
        "method": "GET"
      }
    ]
  }
}
```

---

#### `POST /api/payments/capture-order`
Captures payment for an approved PayPal order and cryptographically verifies the transaction.

> **CRITICAL ARCHITECTURE RULE:**  
> The backend verifies the PayPal transaction status via the PayPal Orders v2 API. If and only if the capture status is `COMPLETED`, the payment is inserted as `COMPLETED` and the invoice status is updated to `PAID`.

- **Request Body:**
```json
{
  "paypalOrderId": "5O190127TN364715T",
  "invoiceId": "c1f158cb-09a8-4235-8622-04db80f288d4"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "paymentId": "p0000000-0000-0000-0000-000000000001",
    "invoiceId": "c1f158cb-09a8-4235-8622-04db80f288d4",
    "paypalOrderId": "5O190127TN364715T",
    "paypalCaptureId": "2C456789TN364715A",
    "amount": 1320.00,
    "currency": "USD",
    "status": "COMPLETED",
    "invoiceStatus": "PAID",
    "payerEmail": "buyer@example.com",
    "verifiedAt": "2026-10-14T23:40:00.000Z"
  },
  "message": "Payment captured and verified successfully"
}
```
- **Response `422 Unprocessable Entity`:**
```json
{
  "success": false,
  "error": {
    "code": "PAYPAL_VERIFICATION_FAILED",
    "message": "PayPal order capture failed or returned status DECLINED"
  }
}
```

---

### 3.4. AI Assistant Module

#### `POST /api/ai/invoice-draft`
Uses an AI model service to generate professional invoice line-item descriptions and reasonable rates based on a project summary.

- **Request Body:**
```json
{
  "projectSummary": "Designed and deployed a modern SaaS landing page in Next.js with contact form and dark mode",
  "targetHourlyRate": 95.0,
  "currency": "USD"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "suggestedTitle": "Next.js SaaS Landing Page & UI Development",
    "items": [
      {
        "description": "Next.js 14 Responsive UI Architecture & Dark Mode Theming",
        "quantity": 18.0,
        "unitPrice": 95.00,
        "amount": 1710.00
      },
      {
        "description": "Contact Form Integration, Input Validation & API Wiring",
        "quantity": 6.0,
        "unitPrice": 95.00,
        "amount": 570.00
      }
    ],
    "suggestedNotes": "Payment is due within 14 days of invoice receipt. Thank you for the collaboration!",
    "model": "gemini-1.5-flash"
  }
}
```

---

#### `POST /api/ai/payment-reminder`
Generates a polite, persuasive, and contextual payment reminder message for an overdue or pending invoice.

- **Request Body:**
```json
{
  "invoiceId": "c1f158cb-09a8-4235-8622-04db80f288d4",
  "tone": "polite | firm | urgent",
  "daysPastDue": 5
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "subject": "Gentle Reminder: Invoice INV-2026-001 is past due",
    "message": "Hi Sarah,\n\nI hope you're having a productive week! This is a friendly reminder that Invoice INV-2026-001 ($1,320.00) was due on Oct 10, 2026 (5 days ago).\n\nYou can pay directly via PayPal using the link below:\nhttps://paypilot.dev/pay/INV-2026-001\n\nPlease let me know if you have any questions.\n\nBest regards,\nAlex Morgan",
    "tone": "polite",
    "model": "gemini-1.5-flash"
  }
}
```
