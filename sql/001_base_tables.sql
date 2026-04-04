-- ═══════════════════════════════════════════════════
-- HOME READY SCORES — Base Table Definitions
-- Run this FIRST in the Supabase SQL Editor
-- Creates all core tables that other migrations depend on
-- ═══════════════════════════════════════════════════

-- ─── 1. TEAM MEMBERS (admin/staff login) ───
CREATE TABLE IF NOT EXISTS team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 2. CLIENTS (core directory) ───
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  ghl_contact_id TEXT,
  clover_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_ghl ON clients(ghl_contact_id);

-- ─── 3. PAYMENTS (billing config per client) ───
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  setup_fee_amount INTEGER DEFAULT 0,
  setup_fee_date DATE,
  setup_fee_status TEXT DEFAULT 'pending',
  monthly_amount INTEGER DEFAULT 0,
  monthly_start_date DATE,
  monthly_status TEXT DEFAULT 'inactive',
  card_last_four TEXT,
  card_brand TEXT,
  clover_customer_id TEXT,
  clover_plan_id TEXT,
  clover_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 4. PAYMENT HISTORY (transaction log) ───
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT,
  amount INTEGER,
  status TEXT DEFAULT 'pending',
  description TEXT,
  clover_charge_id TEXT,
  charged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_history_client ON payment_history(client_id);

-- ─── 5. INTAKE FORMS ───
CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  ssn_last4 TEXT,
  dob DATE,
  current_address TEXT,
  previous_addresses TEXT,
  employer TEXT,
  income TEXT,
  goals TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── 6. DOCUMENTS ───
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other',
  file_url TEXT,
  file_path TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_client ON documents(client_id);

-- ─── 7. DISPUTE LETTERS ───
CREATE TABLE IF NOT EXISTS dispute_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  bureau TEXT NOT NULL,
  account_name TEXT,
  account_number_last4 TEXT,
  dispute_reason TEXT,
  letter_text TEXT,
  status TEXT DEFAULT 'draft',
  round_number INTEGER DEFAULT 1,
  sent_date DATE,
  response_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_disputes_client ON dispute_letters(client_id);

-- ─── 8. SCHEDULED CHARGES ───
CREATE TABLE IF NOT EXISTS scheduled_charges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'setup_fee',
  amount NUMERIC,
  scheduled_date DATE,
  status TEXT DEFAULT 'pending',
  clover_customer_id TEXT,
  clover_charge_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  charged_at TIMESTAMPTZ
);

-- ─── 9. STORAGE BUCKET ───
INSERT INTO storage.buckets (id, name, public)
VALUES ('client-documents', 'client-documents', false)
ON CONFLICT DO NOTHING;
