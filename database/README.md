# PayPilot AI - Database Documentation & Setup Guide

This directory houses the canonical PostgreSQL schema definitions, migration files, and database seed data for **PayPilot AI**.

## 1. Quick Overview

PayPilot AI relies on **PostgreSQL (v14+)** for transactional guarantees, referential integrity, and monetary precision.

### Key Tenets
1. **Monetary Precision:** All amounts, subtotals, taxes, and prices are strictly stored as `NUMERIC(12, 2)`. Floating point types (`FLOAT`, `DOUBLE`) are strictly forbidden.
2. **Deterministic Status Lifecycle:** Invoice and payment statuses are validated via `CHECK` constraints matching shared constants.
3. **Payment Integrity Rule:** An invoice status transitions to `PAID` and a payment record transitions to `COMPLETED` **only** after the backend verifies a cryptographically/programmatically authentic capture response from PayPal. AI services must never touch payment states.

---

## 2. Directory Layout

```text
database/
├── schema.sql                     # Master DDL with full tables, indexes, triggers
├── migrations/
│   ├── 001_initial_schema.sql     # Baseline migration script
│   └── 002_seed_dev_data.sql      # Safe mock records for local development
└── README.md                      # This document
```

---

## 3. Local Setup Instructions

### Option A: Using Local PostgreSQL Service
1. Create a local database and user:
   ```bash
   psql -U postgres
   CREATE USER paypilot_user WITH PASSWORD 'your_secure_db_password_here';
   CREATE DATABASE paypilot_db OWNER paypilot_user;
   GRANT ALL PRIVILEGES ON DATABASE paypilot_db TO paypilot_user;
   \q
   ```
2. Apply the schema:
   ```bash
   psql -U paypilot_user -d paypilot_db -f database/schema.sql
   ```
3. (Optional) Load sample seed data:
   ```bash
   psql -U paypilot_user -d paypilot_db -f database/migrations/002_seed_dev_data.sql
   ```

### Option B: Using Docker
You can run a quick PostgreSQL container with one command:
```bash
docker run --name paypilot-postgres \
  -e POSTGRES_USER=paypilot_user \
  -e POSTGRES_PASSWORD=your_secure_db_password_here \
  -e POSTGRES_DB=paypilot_db \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Then initialize the schema:
```bash
docker exec -i paypilot-postgres psql -U paypilot_user -d paypilot_db < database/schema.sql
```

### Option C: Offline / Mock Mode (Zero Setup)
In `apps/backend`, if `ALLOW_OFFLINE_DB=true` is set in your `.env` (the default in `.env.example`), the server automatically runs using structured mock data so you can develop UI components, test PayPal sandbox routes, and prototype AI calls without a running Postgres instance!

---

## 4. Entity-Relationship Overview

```
 [users] 1 ──────────< N [clients]
    │                        │
    │ 1                      │ 1
    │                        │
    ▼                        ▼
 [invoices] 1 ────────< N [invoice_items]
    │
    │ 1
    ▼
 [payments]
```

Detailed ERD diagrams and column-level descriptions can be found in [docs/DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md).
