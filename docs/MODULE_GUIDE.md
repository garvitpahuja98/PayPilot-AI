# PayPilot AI - Module Guide & Parallel Development Blueprint

**Audience:** Open-source contributors, team members, and PR reviewers.  
**Objective:** Enable multiple teammates to work simultaneously on different features with minimal merge conflicts and clear separation of concerns.

---

## 1. Domain Module Boundaries

PayPilot AI is partitioned into six clear domain modules. Each module has explicit responsibilities, inputs, outputs, and file locations.

### 1.1. Dashboard Module
- **Responsibilities:** Aggregating total revenue, pending balances, overdue counts, draft metrics, and recent activity logs.
- **Frontend Directory:** `apps/frontend/src/features/dashboard/`, `apps/frontend/src/app/dashboard/`
- **Backend Directory:** `apps/backend/src/modules/dashboard/`
- **Dependencies:** Invoices, Payments.
- **Coordination Needed:** None (read-heavy, queries existing tables).

---

### 1.2. Invoices Module
- **Responsibilities:** Full CRUD lifecycle for invoices and itemized line items (creating drafts, editing rates/quantities, issuing to clients, tracking overdue status).
- **Frontend Directory:** `apps/frontend/src/features/invoices/`, `apps/frontend/src/app/invoices/`
- **Backend Directory:** `apps/backend/src/modules/invoices/`
- **Dependencies:** Clients table, Users table, Invoice Items table.
- **Coordination Needed:** Schema changes to `invoices` or `invoice_items` must be coordinated with the database team.

---

### 1.3. Payments Module (PayPal Sandbox)
- **Responsibilities:** Creating PayPal orders, capturing approved payments, verifying capture responses, recording transactions, updating invoice status to `PAID`.
- **Frontend Directory:** `apps/frontend/src/features/payments/`, `apps/frontend/src/app/payments/`
- **Backend Directory:** `apps/backend/src/modules/payments/`, `apps/backend/src/services/paypal/`
- **Dependencies:** Invoices table, Payments table, PayPal Sandbox API credentials.
- **Security Invariant:** Only the backend capture verification can mark an invoice `PAID`.
- **Coordination Needed:** Changes to PayPal webhook handlers or capture payload schemas.

---

### 1.4. AI Assistant Module
- **Responsibilities:** Generating line item suggestions and rates from project descriptions (`POST /api/ai/invoice-draft`), drafting professional reminder messages (`POST /api/ai/payment-reminder`).
- **Frontend Directory:** `apps/frontend/src/features/ai-assistant/`, `apps/frontend/src/app/ai-assistant/`
- **Backend Directory:** `apps/backend/src/modules/ai-assistant/`, `apps/backend/src/services/ai/`
- **Dependencies:** Backend AI Service client.
- **Safety Rule:** AI models produce suggestion text only. They have no write access to database records.

---

### 1.5. Authentication Module
- **Responsibilities:** User registration, password hashing (bcrypt), JWT issuance, login endpoint, and authentication middleware.
- **Frontend Directory:** `apps/frontend/src/services/authService.js`
- **Backend Directory:** `apps/backend/src/modules/auth/`, `apps/backend/src/middleware/auth.js`
- **Dependencies:** Users table.
- **Coordination Needed:** Changes to the JWT payload structure affect all protected backend routes.

---

### 1.6. Database Module
- **Responsibilities:** Maintaining `database/schema.sql`, authoring incremental numbered migrations (`database/migrations/00X_*.sql`), maintaining indexes, and managing dev seed data.
- **Directories:** `database/`
- **Coordination Needed:** High coordination. Any DDL alteration must be proposed via PR with migration scripts.

---

## 2. Directory Modification Matrix

When you are implementing a feature, reference this table to know which files you can freely change vs. which require team coordination:

| Module Under Development | Files You Freely Modify | Files Requiring Coordination |
| :--- | :--- | :--- |
| **Dashboard** | `apps/frontend/src/features/dashboard/*`<br>`apps/backend/src/modules/dashboard/*` | `apps/backend/src/routes/index.js` |
| **Invoices** | `apps/frontend/src/features/invoices/*`<br>`apps/backend/src/modules/invoices/*` | `database/schema.sql`<br>`packages/shared/src/constants.js` |
| **Payments** | `apps/frontend/src/features/payments/*`<br>`apps/backend/src/modules/payments/*`<br>`apps/backend/src/services/paypal/*` | `packages/shared/src/constants.js`<br>`database/schema.sql` |
| **AI Assistant** | `apps/frontend/src/features/ai-assistant/*`<br>`apps/backend/src/modules/ai-assistant/*`<br>`apps/backend/src/services/ai/*` | `apps/backend/src/routes/index.js` |
| **Auth** | `apps/backend/src/modules/auth/*`<br>`apps/backend/src/middleware/auth.js` | `apps/backend/src/app.js` |
| **Shared Enums** | Read-only | `packages/shared/src/constants.js` *(Coordinate via PR)* |

---

## 3. Parallel Development Workflows

### How Frontend Developers Work Before Backend Is Ready
1. **Mock Toggle:** Set `NEXT_PUBLIC_ENABLE_MOCK_API=true` in `apps/frontend/.env.local`.
2. **Frontend Service Stubs:** Feature services in `apps/frontend/src/services/` contain clean fallback mocks matching [`docs/API_CONTRACTS.md`](./API_CONTRACTS.md).
3. **Independent UI Verification:** Build screens, forms, responsive CSS, and state machines without starting the backend server.
4. **Mock Labeling Rule:** Any mock data rendered in the UI must display an explicit label `[MOCK DATA]` or `[DEV SIMULATION]`. **Never** simulate a real verified PayPal payment in the UI without real sandbox API communication.

### How Backend Developers Work Before Database/APIs Are Ready
1. **In-Memory Offline DB:** The backend comes with `ALLOW_OFFLINE_DB=true` support, keeping a volatile in-memory store so endpoints return valid payloads even if PostgreSQL is not locally installed.
2. **Modular Routers:** Each module registers its own mini-router in `src/modules/<name>/<name>.router.js`.
3. **Mounting:** Add one line to `apps/backend/src/routes/index.js` to mount your module router.

---

## 4. Shared Conventions

### 4.1. Code Formatting & Naming
- **File Names:** CamelCase for React components (`InvoiceList.jsx`), camelCase for utilities and controllers (`invoices.controller.js`).
- **Endpoints:** Plural kebab-case URLs (`/api/invoices`, `/api/payments/create-order`).
- **Identifiers:** camelCase in JavaScript JSON payloads (`invoiceNumber`, `totalAmount`); snake_case in SQL tables (`invoice_number`, `total_amount`).

### 4.2. Error Handling
- Never throw unhandled Promise rejections. Pass errors to `next(err)`.
- Use the standard error classes in `apps/backend/src/utils/errors.js` (`BadRequestError`, `NotFoundError`, `UnauthorizedError`).
- All error responses must match the standard schema:
  ```json
  { "success": false, "error": { "code": "...", "message": "..." } }
  ```
