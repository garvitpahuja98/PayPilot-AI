# PayPilot AI
> **AI-Assisted Invoice & Payment Management Platform for Freelancers and Small Businesses**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D20-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-lightgrey.svg)](https://expressjs.com/)
[![PayPal Checkout](https://img.shields.io/badge/PayPal-Sandbox%20v2-blue.svg)](https://developer.paypal.com/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg)](https://www.postgresql.org/)

---

## 1. Project Overview is:

**PayPilot AI** provides independent freelancers and small businesses with an intelligent, seamless billing and cashflow operations engine. With PayPilot AI, users can:
1. **Accelerate Invoicing:** Convert natural-language task lists into itemized, priced line items with AI assistance.
2. **Collect Payments:** Issue direct payment checkout links powered by the **PayPal Checkout Sandbox**.
3. **Automate Reminders:** Generate contextual, polite, and persuasive reminder drafts for overdue invoices.
4. **Track Cash Flow:** Monitor real-time revenue KPIs, pending collections, and invoice status metrics on a unified dashboard.

This repository is designed as a **clean, modular, fork-friendly monorepo** so multiple teammates can fork the repository and independently develop different features in parallel.

---

## 2. Technology Stack

- **Frontend:** React with Next.js 14 (App Router) and JavaScript
- **Styling:** Modern native CSS with custom property design tokens
- **Backend:** Node.js with Express (REST API)
- **Database:** PostgreSQL (with transactional DDL and migrations)
- **Payments:** PayPal Checkout Sandbox (Server-Side Capture Verification)
- **AI Integration:** Service-layer abstraction (Google Gemini / OpenAI / Deterministic Mock)
- **Version Control:** Git, GitHub fork-and-pull-request model
- **Testing:** Vitest and Testing Library

---

## 3. Repository Structure

```text
paypilot-ai/
├── apps/
│   ├── frontend/                  # Next.js 14 client application
│   │   ├── src/
│   │   │   ├── app/               # App Router pages (dashboard, invoices, payments, ai)
│   │   │   ├── components/        # Reusable UI primitives (Button, Card, Badge, Alert)
│   │   │   ├── features/          # Domain feature components
│   │   │   │   ├── dashboard/     # DashboardView.jsx
│   │   │   │   ├── invoices/      # InvoiceList.jsx, InvoiceForm.jsx
│   │   │   │   ├── payments/      # PayPalCheckoutButton.jsx
│   │   │   │   └── ai-assistant/  # AiPromptForm.jsx
│   │   │   ├── services/          # Client API client & domain services
│   │   │   ├── hooks/             # useAsync hook
│   │   │   ├── utils/             # Formatters (currency, dates, statuses)
│   │   │   └── styles/            # globals.css design system
│   │   ├── public/                # Static assets
│   │   ├── tests/                 # Component unit tests (Vitest)
│   │   ├── package.json
│   │   └── README.md
│   │
│   └── backend/                   # Express REST API
│       ├── src/
│       │   ├── config/            # Environment & PostgreSQL connection pool
│       │   ├── middleware/        # Auth, error handling, logging
│       │   ├── modules/           # Feature domain modules
│       │   │   ├── auth/          # Login & user context
│       │   │   ├── dashboard/     # Revenue metrics & activity log
│       │   │   ├── invoices/      # Invoice CRUD & financial calculations
│       │   │   ├── payments/      # PayPal order create & capture verification
│       │   │   └── ai-assistant/  # Invoice drafts & payment reminders
│       │   ├── routes/            # Consolidated router & /api/health check
│       │   ├── services/          # External integrations
│       │   │   ├── paypal/        # PayPal Checkout v2 client
│       │   │   └── ai/            # AI model adapter (Gemini/OpenAI/Mock)
│       │   ├── utils/             # API envelopes & custom AppError classes
│       │   ├── app.js             # Express app setup
│       │   └── server.js          # HTTP server bootstrap
│       ├── tests/                 # API contract tests (Vitest + Supertest)
│       ├── package.json
│       └── README.md
│
├── packages/
│   └── shared/                    # Shared domain constants & contracts
│       ├── src/
│       │   ├── constants.js       # INVOICE_STATUS, PAYMENT_STATUS, HTTP_STATUS, ERROR_CODES
│       │   └── api-contracts.md   # Shared schema payload reference
│       └── package.json
│
├── database/                      # PostgreSQL database assets
│   ├── schema.sql                 # Master DDL with tables, triggers, and constraints
│   ├── migrations/                # Versioned SQL migrations
│   │   ├── 001_initial_schema.sql
│   │   └── 002_seed_dev_data.sql  # Safe mock records for local testing
│   └── README.md                  # Database setup instructions
│
├── docs/                          # Comprehensive architectural specifications
│   ├── ARCHITECTURE.md            # Monorepo architecture & security model
│   ├── API_CONTRACTS.md           # Formal request/response contracts for all endpoints
│   ├── DATABASE_SCHEMA.md         # Schema ERD, field constraints & lifecycle rules
│   ├── MODULE_GUIDE.md            # Team module boundaries & parallel workflow
│   └── CONTRIBUTING.md            # Step-by-step GitHub fork & PR guide
│
├── .github/
│   └── pull_request_template.md   # PR template with checklist
├── .env.example                   # Environment variable template
├── .gitignore                     # Git ignore rules
├── package.json                   # Root monorepo workspace configuration
├── README.md                      # This document
└── LICENSE                        # MIT License
```

---

## 4. Getting Started

### 4.1. Prerequisites
- **Node.js:** v20.x or higher (`node -v`)
- **npm:** v10.x or higher (`npm -v`)
- **Git:** v2.x or higher (`git --version`)
- *(Optional)* **PostgreSQL:** v14+ (the platform runs in **Zero-Config Offline Mode** if Postgres is not installed)

### 4.2. Clone & Install
```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/paypilot-ai.git
cd paypilot-ai

# 2. Copy the environment configuration
cp .env.example .env

# 3. Install dependencies across all workspace packages
npm install
```

### 4.3. Run Applications

#### Option A: Run Both Frontend and Backend Concurrently
```bash
npm run dev
```
- Frontend will open at: `http://localhost:3000`
- Backend API will run at: `http://localhost:5000`
- API Health Status: `http://localhost:5000/api/health`

#### Option B: Run Apps Independently (in separate terminal windows)
```bash
# Terminal 1: Run Express Backend
npm run dev:backend

# Terminal 2: Run Next.js Frontend
npm run dev:frontend
```

---

## 5. Offline & Mock Development (Zero-Credential Setup)

PayPilot AI is engineered to be **runnable immediately after cloning**, even before PostgreSQL, PayPal, or AI credentials are configured:

1. **Database Fallback:** When `ALLOW_OFFLINE_DB=true` (default in `.env.example`), the backend initializes an in-memory data store with safe demo records if PostgreSQL is unavailable.
2. **PayPal Sandbox Fallback:** If `PAYPAL_CLIENT_ID` is unset, the payments module returns clearly labeled development simulation orders for testing checkout UI.
3. **AI Provider Fallback:** When `AI_PROVIDER=mock`, the AI assistant generates deterministic, realistic invoice line items and reminder letters without consuming API tokens.

---

## 6. Testing & Quality Checks

Run test suites across both backend and frontend:

```bash
# Run all tests in the monorepo
npm test

# Run backend integration tests
npm test -w @paypilot/backend

# Run frontend UI component tests
npm test -w @paypilot/frontend
```

---

## 7. Fork Collaboration & Team Development

Multiple teammates can work simultaneously without stepping on each other's code.

1. **Fork the main repository** on GitHub.
2. **Clone your fork** and configure the `upstream` remote:
   ```bash
   git remote add upstream https://github.com/paypilot-ai/paypilot-ai.git
   ```
3. **Create a dedicated feature branch** for your assigned module:
   ```bash
   git checkout -b feature/invoices-table-filters
   ```
4. **Develop within your designated module directory**:
   - Dashboard: `apps/frontend/src/features/dashboard/` & `apps/backend/src/modules/dashboard/`
   - Invoices: `apps/frontend/src/features/invoices/` & `apps/backend/src/modules/invoices/`
   - Payments: `apps/frontend/src/features/payments/` & `apps/backend/src/modules/payments/`
   - AI Assistant: `apps/frontend/src/features/ai-assistant/` & `apps/backend/src/modules/ai-assistant/`
5. **Verify your changes**: Ensure `npm test` passes.
6. **Submit a Pull Request** against `upstream/main` using the provided [pull request template](./.github/pull_request_template.md).

For full details on boundaries and coordination, refer to [`docs/MODULE_GUIDE.md`](./docs/MODULE_GUIDE.md) and [`docs/CONTRIBUTING.md`](./docs/CONTRIBUTING.md).

---

## 8. Documentation Index

- [System Architecture Specification](./docs/ARCHITECTURE.md)
- [Formal API Contracts](./docs/API_CONTRACTS.md)
- [Database Schema & ERD](./docs/DATABASE_SCHEMA.md)
- [Module Boundaries & Parallel Workflow](./docs/MODULE_GUIDE.md)
- [Contributor's Guide](./docs/CONTRIBUTING.md)
- [Shared Package Constants](./packages/shared/src/constants.js)

---

## 9. License

This project is licensed under the [MIT License](./LICENSE).
