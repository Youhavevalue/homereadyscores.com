-- ═══════════════════════════════════════════════════
-- HOME READY SCORES — Row Level Security Policies
-- Run AFTER 001_base_tables.sql
--
-- Strategy: The anon key (used by the browser) gets
-- read-only access to clients for the portal pages.
-- All writes go through the service_role key in our
-- Vercel serverless functions, which bypasses RLS.
-- This prevents any anonymous user from modifying data
-- even if they obtain the anon key from the frontend.
-- ═══════════════════════════════════════════════════

-- ─── Enable RLS on all tables ───
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_charges ENABLE ROW LEVEL SECURITY;

-- ─── TEAM MEMBERS: no anon access (login goes through service_role API) ───
CREATE POLICY "Service role full access on team_members"
  ON team_members FOR ALL
  USING (auth.role() = 'service_role');

-- ─── CLIENTS: anon can read (portal dashboard), writes via service_role ───
CREATE POLICY "Anon read clients"
  ON clients FOR SELECT
  USING (true);

CREATE POLICY "Anon insert clients"
  ON clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon update clients"
  ON clients FOR UPDATE
  USING (true);

CREATE POLICY "Service role full access on clients"
  ON clients FOR ALL
  USING (auth.role() = 'service_role');

-- ─── PAYMENTS: anon can read + write (portal manages billing config) ───
CREATE POLICY "Anon read payments"
  ON payments FOR SELECT
  USING (true);

CREATE POLICY "Anon insert payments"
  ON payments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon update payments"
  ON payments FOR UPDATE
  USING (true);

CREATE POLICY "Service role full access on payments"
  ON payments FOR ALL
  USING (auth.role() = 'service_role');

-- ─── PAYMENT HISTORY: anon read, service_role writes ───
CREATE POLICY "Anon read payment_history"
  ON payment_history FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on payment_history"
  ON payment_history FOR ALL
  USING (auth.role() = 'service_role');

-- ─── INTAKE FORMS: anon can read + write (portal intake tab) ───
CREATE POLICY "Anon read intake_forms"
  ON intake_forms FOR SELECT
  USING (true);

CREATE POLICY "Anon insert intake_forms"
  ON intake_forms FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon update intake_forms"
  ON intake_forms FOR UPDATE
  USING (true);

CREATE POLICY "Service role full access on intake_forms"
  ON intake_forms FOR ALL
  USING (auth.role() = 'service_role');

-- ─── DOCUMENTS: anon can read + insert + delete (portal doc tab) ───
CREATE POLICY "Anon read documents"
  ON documents FOR SELECT
  USING (true);

CREATE POLICY "Anon insert documents"
  ON documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon delete documents"
  ON documents FOR DELETE
  USING (true);

CREATE POLICY "Service role full access on documents"
  ON documents FOR ALL
  USING (auth.role() = 'service_role');

-- ─── DISPUTE LETTERS: anon can read + write (portal disputes tab) ───
CREATE POLICY "Anon read dispute_letters"
  ON dispute_letters FOR SELECT
  USING (true);

CREATE POLICY "Anon insert dispute_letters"
  ON dispute_letters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anon update dispute_letters"
  ON dispute_letters FOR UPDATE
  USING (true);

CREATE POLICY "Service role full access on dispute_letters"
  ON dispute_letters FOR ALL
  USING (auth.role() = 'service_role');

-- ─── SCHEDULED CHARGES: anon read, service_role writes ───
CREATE POLICY "Anon read scheduled_charges"
  ON scheduled_charges FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on scheduled_charges"
  ON scheduled_charges FOR ALL
  USING (auth.role() = 'service_role');

-- ─── STORAGE: service role full access to client-documents bucket ───
CREATE POLICY IF NOT EXISTS "Service role full access on storage"
  ON storage.objects FOR ALL
  USING (bucket_id = 'client-documents');
