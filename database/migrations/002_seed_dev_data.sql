-- Migration: 002_seed_dev_data.sql
-- Description: Inserts safe sample development records for initial UI/API testing.

-- 1. Insert Demo User (password is bcrypt hashed for 'Password123!')
INSERT INTO users (id, email, password_hash, full_name, business_name, role, default_currency)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'alex@paypilot.dev',
    '$2b$10$wJj7eCq1pZ0b.55H6K5YqO4uVbH6z2BqK7kE1r5sLq9nO2wQ8XJ8W',
    'Alex Morgan',
    'Apex Design Studio',
    'FREELANCER',
    'USD'
) ON CONFLICT (email) DO NOTHING;

-- 2. Insert Demo Clients
INSERT INTO clients (id, user_id, name, email, company, phone, billing_address)
VALUES 
(
    'c0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Sarah Jenkins',
    'sarah@techflow.io',
    'TechFlow Solutions',
    '+1 (555) 234-5678',
    '100 Market St, Suite 400, San Francisco, CA 94105'
),
(
    'c0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'David Chen',
    'dchen@quantumretail.com',
    'Quantum Retail Group',
    '+1 (555) 987-6543',
    '450 Lexington Ave, New York, NY 10017'
) ON CONFLICT DO NOTHING;

-- 3. Insert Demo Invoices
INSERT INTO invoices (id, user_id, client_id, invoice_number, status, issue_date, due_date, currency, subtotal, tax_rate, tax_amount, total_amount, notes)
VALUES 
(
    'i0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'INV-2026-001',
    'PAID',
    CURRENT_DATE - INTERVAL '15 days',
    CURRENT_DATE - INTERVAL '1 day',
    'USD',
    2500.00,
    0.00,
    0.00,
    2500.00,
    'Q3 Brand Identity & Web UI System'
),
(
    'i0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000002',
    'INV-2026-002',
    'SENT',
    CURRENT_DATE - INTERVAL '5 days',
    CURRENT_DATE + INTERVAL '10 days',
    'USD',
    3400.00,
    8.25,
    280.50,
    3680.50,
    'E-commerce Checkout Migration Phase 1'
),
(
    'i0000000-0000-0000-0000-000000000003',
    'a0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'INV-2026-003',
    'DRAFT',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '14 days',
    'USD',
    1800.00,
    0.00,
    0.00,
    1800.00,
    'Design System Audit & Documentation'
) ON CONFLICT DO NOTHING;

-- 4. Line Items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, amount)
VALUES
('i0000000-0000-0000-0000-000000000001', 'UI/UX Design Concept & Wireframes', 1.00, 1500.00, 1500.00),
('i0000000-0000-0000-0000-000000000001', 'Design System Components in Figma', 1.00, 1000.00, 1000.00),
('i0000000-0000-0000-0000-000000000002', 'Next.js Frontend Checkout Architecture', 34.00, 100.00, 3400.00),
('i0000000-0000-0000-0000-000000000003', 'Component Accessibility Review', 18.00, 100.00, 1800.00)
ON CONFLICT DO NOTHING;

-- 5. Verified Payment Record for the PAID invoice
INSERT INTO payments (
    id, invoice_id, paypal_order_id, paypal_capture_id, 
    amount, currency, status, payment_method, payer_email, verified_at
)
VALUES (
    'p0000000-0000-0000-0000-000000000001',
    'i0000000-0000-0000-0000-000000000001',
    '5O190127TN364715T',
    '2C456789TN364715A',
    2500.00,
    'USD',
    'COMPLETED',
    'PAYPAL',
    'sarah@techflow.io',
    CURRENT_TIMESTAMP - INTERVAL '14 days'
) ON CONFLICT DO NOTHING;
