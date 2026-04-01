-- Portal Completion Migration
-- Run this in the Supabase SQL Editor
-- Ensures all tables and columns exist for the full portal

-- ═══════════════════════════════════════════════════
-- 1. INTAKE_FORMS TABLE
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  ssn_last4 TEXT,
  dob DATE,
  current_address TEXT,
  previous_addresses TEXT,
  employer TEXT,
  income TEXT,
  goals TEXT[],  -- array of goal strings
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE intake_forms DISABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════
-- 2. DOCUMENTS TABLE (ensure it exists with all columns)
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'other',  -- id_doc, utility_bill, credit_report, dispute_letter, other
  file_url TEXT,
  file_path TEXT,  -- storage path for deletion
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE documents DISABLE ROW LEVEL SECURITY;

-- Add file_path column if table already existed without it
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_path TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_size BIGINT;

-- ═══════════════════════════════════════════════════
-- 3. DISPUTE_LETTERS TABLE (ensure all columns)
-- ═══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dispute_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  bureau TEXT NOT NULL,  -- Experian, Equifax, TransUnion
  account_name TEXT,
  account_number_last4 TEXT,
  dispute_reason TEXT,
  letter_text TEXT,
  status TEXT DEFAULT 'draft',  -- draft, sent, responded, resolved, deleted
  round_number INTEGER DEFAULT 1,
  sent_date DATE,
  response_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE dispute_letters DISABLE ROW LEVEL SECURITY;

-- Add columns if table already existed
ALTER TABLE dispute_letters ADD COLUMN IF NOT EXISTS account_number_last4 TEXT;
ALTER TABLE dispute_letters ADD COLUMN IF NOT EXISTS letter_text TEXT;
ALTER TABLE dispute_letters ADD COLUMN IF NOT EXISTS round_number INTEGER DEFAULT 1;
ALTER TABLE dispute_letters ADD COLUMN IF NOT EXISTS sent_date DATE;
ALTER TABLE dispute_letters ADD COLUMN IF NOT EXISTS response_date DATE;
ALTER TABLE dispute_letters ADD COLUMN IF NOT EXISTS notes TEXT;

-- ═══════════════════════════════════════════════════
-- 4. ADD GHL CONTACT ID TO CLIENTS
-- ═══════════════════════════════════════════════════
ALTER TABLE clients ADD COLUMN IF NOT EXISTS ghl_contact_id TEXT;

-- ═══════════════════════════════════════════════════
-- 5. STORAGE BUCKET (run separately in Supabase dashboard)
-- ═══════════════════════════════════════════════════
-- Go to Storage → Create Bucket → Name: "client-documents" → Public: OFF
-- Or run: INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) 
VALUES ('client-documents', 'client-documents', false) 
ON CONFLICT DO NOTHING;

-- Allow authenticated uploads to the bucket (using service role from API)
CREATE POLICY IF NOT EXISTS "Service role full access" ON storage.objects
  FOR ALL USING (bucket_id = 'client-documents');
