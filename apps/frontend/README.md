# PayPilot AI - Frontend Application

Next.js 14 web application built with React, modern native CSS, and component testing via Vitest.

## 1. Quick Start

### Standalone Local Run
```bash
# From repository root
npm run dev:frontend

# Or from apps/frontend directory
cd apps/frontend
npm install
npm run dev
```

The application runs on `http://localhost:3000`.

---

## 2. Architecture & Directory Layout

```text
apps/frontend/
├── src/
│   ├── app/                # Next.js App Router pages & root layout
│   │   ├── dashboard/      # Financial summary & KPIs page
│   │   ├── invoices/       # Invoicing list & creation pages
│   │   ├── payments/       # PayPal checkout sandbox test page
│   │   └── ai-assistant/   # AI line-item generator & payment reminder playground
│   ├── components/         # Reusable UI primitives (Button, Card, Badge, Alert, Navbar)
│   ├── features/           # Domain feature implementations
│   │   ├── dashboard/      # DashboardView.jsx
│   │   ├── invoices/       # InvoiceList.jsx, InvoiceForm.jsx
│   │   ├── payments/       # PayPalCheckoutButton.jsx
│   │   └── ai-assistant/   # AiPromptForm.jsx
│   ├── services/           # HTTP API client and domain services
│   ├── hooks/              # useAsync custom hook
│   ├── utils/              # Currency and date formatters
│   └── styles/             # Global CSS design tokens & responsive rules
├── public/                 # Static assets
├── tests/                  # Component unit tests (Vitest + Testing Library)
└── package.json
```

---

## 3. Working Independently (Mock Mode)

To allow UI developers to build screens before backend services are fully deployed:
- `NEXT_PUBLIC_ENABLE_MOCK_API=true` activates local data fallback in `src/services/apiClient.js`.
- If the Express backend is not running at `http://localhost:5000`, the frontend automatically catches connection failures and renders safe mock data.
- **Rule:** Mock data is labeled in the UI so developers know they are not interacting with live APIs.

---

## 4. Testing

```bash
# Run frontend unit tests
npm test
```
