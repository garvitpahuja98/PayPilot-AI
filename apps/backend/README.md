# PayPilot AI - Backend Service

Express.js REST API providing financial aggregation, invoice management, PayPal sandbox checkout capture, and AI draft generation.

## 1. Quick Start

### Standalone Local Run
```bash
# From repository root
npm run dev:backend

# Or from apps/backend directory
cd apps/backend
npm install
npm run dev
```

The server binds to port `5000` by default.  
Test the health status: `curl http://localhost:5000/api/health`

---

## 2. Architecture & Modules

```text
apps/backend/
├── src/
│   ├── config/             # Environment & PostgreSQL pool setup
│   ├── middleware/         # Auth, centralized error handling, logging
│   ├── modules/
│   │   ├── auth/           # Login, registration, token verification
│   │   ├── dashboard/      # Aggregate revenue & count statistics
│   │   ├── invoices/       # Invoicing CRUD & subtotal/tax calculations
│   │   ├── payments/       # PayPal Sandbox order creation & capture
│   │   └── ai-assistant/   # AI line-item drafts & reminder generator
│   ├── routes/             # Master API router (/api/*)
│   ├── services/
│   │   ├── paypal/         # PayPal REST v2 client
│   │   └── ai/             # AI model client abstraction (Gemini/OpenAI/Mock)
│   ├── utils/              # Standard envelope helpers & error classes
│   ├── app.js              # Express app wiring
│   └── server.js           # Server bootstrap
├── tests/                  # Integration tests with Vitest & Supertest
└── package.json
```

---

## 3. Running Without External Dependencies (Offline Mode)

By default, the backend includes an **Offline Dev Mode** (`ALLOW_OFFLINE_DB=true`).
- **PostgreSQL:** If no local PostgreSQL is running, the server seamlessly keeps state in memory.
- **PayPal:** If `PAYPAL_CLIENT_ID` is empty, order endpoints generate local sandbox simulation stubs.
- **AI:** If `AI_API_KEY` is empty, it uses deterministic mock generation.

This allows frontend teammates to immediately develop against the backend without database or third-party credentials.

---

## 4. Testing

```bash
# Run unit & contract tests
npm test

# Run tests in watch mode
npm run test:watch
```
