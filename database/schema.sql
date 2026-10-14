-- ==============================================================================
-- PayPilot AI - PostgreSQL Canonical Database Schema
-- Version: 1.0.0
-- Architecture: Single or Multi-tenant Freelancer/SME Invoicing Platform
-- ==============================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- Table: users
-- Core account entity for freelancers and small business owners
-- ==============================================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    business_name VARCHAR(150),
    role VARCHAR(30) NOT NULL DEFAULT 'FREELANCER' CHECK (role IN ('FREELANCER', 'BUSINESS', 'ADMIN')),
    default_currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Table: clients
-- Customers / recipients of invoices
-- ==============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    company VARCHAR(150),
    phone VARCHAR(50),
    billing_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Table: invoices
-- Core invoice model capturing financial totals, lifecycle status, and dates
-- Status: DRAFT -> SENT -> PAID (or OVERDUE / CANCELLED)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' 
        CHECK (status IN ('DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    tax_rate NUMERIC(5, 2) NOT NULL DEFAULT 0.00 CHECK (tax_rate >= 0),
    tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (tax_amount >= 0),
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_invoice_number UNIQUE (user_id, invoice_number)
);

-- ==============================================================================
-- Table: invoice_items
-- Itemized line items associated with an invoice
-- ==============================================================================
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00 CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Table: payments
-- Immutable and verified transaction records
-- 
-- ARCHITECTURAL SECURITY RULE:
-- Payment status must ONLY transition to 'COMPLETED' after the backend service
-- captures and cryptographically/programmatically verifies the order with
-- the PayPal Sandbox/Production API.
-- AI output or untrusted client payloads MUST NEVER determine payment status.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE RESTRICT,
    paypal_order_id VARCHAR(100) NOT NULL UNIQUE,
    paypal_capture_id VARCHAR(100) UNIQUE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'PAYPAL',
    payer_email VARCHAR(255),
    raw_paypal_response JSONB,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- Indexes for Performance & Query Optimization
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_paypal_order_id ON payments(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- ==============================================================================
-- Automatically update updated_at timestamps
-- ==============================================================================
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_users') THEN
        CREATE TRIGGER set_timestamp_users
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_clients') THEN
        CREATE TRIGGER set_timestamp_clients
        BEFORE UPDATE ON clients
        FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_invoices') THEN
        CREATE TRIGGER set_timestamp_invoices
        BEFORE UPDATE ON invoices
        FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_payments') THEN
        CREATE TRIGGER set_timestamp_payments
        BEFORE UPDATE ON payments
        FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
    END IF;
END $$;
