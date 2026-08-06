-- ═══════════════════════════════════════════════════════════════
-- HOME READY SCORES — Enrollment & Billing Migration
-- Run this in the Supabase SQL Editor
-- Adds: activity log, audit trail, enrollment tracking, billing columns
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. ACTIVITY LOG (audit trail for all client/admin/system actions) ───
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL DEFAULT 'client',
  entity_id UUID,
  action TEXT NOT NULL,
  description TEXT,
  actor_type TEXT DEFAULT 'system',
  actor_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_log(created_at DESC);

-- ─── 2. ENROLLMENTS (tracks every website enrollment with full billing detail) ───
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  goal TEXT,
  plan TEXT NOT NULL,
  billing_zip TEXT,
  credit_report_agreement BOOLEAN DEFAULT false,
  setup_fee_amount INTEGER NOT NULL DEFAULT 0,
  monthly_amount INTEGER NOT NULL DEFAULT 0,
  setup_fee_status TEXT DEFAULT 'pending',
  subscription_status TEXT DEFAULT 'pending',
  clover_customer_id TEXT,
  clover_charge_id TEXT,
  clover_plan_id TEXT,
  clover_subscription_id TEXT,
  ghl_contact_id TEXT,
  enrollment_source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_client ON enrollments(client_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_email ON enrollments(email);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_created ON enrollments(created_at DESC);

-- ─── 3. ADD ENROLLMENT COLUMNS TO CLIENTS ───
ALTER TABLE clients ADD COLUMN IF NOT EXISTS billing_zip TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS enrollment_goal TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS enrollment_plan TEXT;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS enrollment_date TIMESTAMPTZ;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS results_expected_date DATE;

-- ─── 4. ADD CARD TOKEN COLUMNS TO PAYMENTS ───
ALTER TABLE payments ADD COLUMN IF NOT EXISTS setup_fee_date TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMPTZ;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS last_payment_status TEXT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS next_billing_date DATE;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS billing_status TEXT DEFAULT 'inactive';

-- ─── 5. ADD SUBSCRIPTION COLUMNS TO PAYMENT_HISTORY ───
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS clover_subscription_id TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS clover_plan_id TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS refund_amount INTEGER DEFAULT 0;

-- ─── 6. RLS POLICIES ───
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on activity_log" ON activity_log;
CREATE POLICY "Service role full access on activity_log" ON activity_log
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anon read activity_log" ON activity_log;
CREATE POLICY "Anon read activity_log" ON activity_log
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anon insert activity_log" ON activity_log;
CREATE POLICY "Anon insert activity_log" ON activity_log
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access on enrollments" ON enrollments;
CREATE POLICY "Service role full access on enrollments" ON enrollments
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anon insert enrollments" ON enrollments;
CREATE POLICY "Anon insert enrollments" ON enrollments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anon read enrollments" ON enrollments;
CREATE POLICY "Anon read enrollments" ON enrollments
  FOR SELECT USING (true);