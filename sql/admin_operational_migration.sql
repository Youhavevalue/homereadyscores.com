-- Admin operational tables — run in Supabase SQL Editor after 001/002.
-- Enables help desk, client notes, staff hot links, prospects, and DFR date on clients.

-- ─── Clients: expected results date (DFR anchor) ───
ALTER TABLE clients ADD COLUMN IF NOT EXISTS results_expected_date DATE;

-- ─── Help tickets ───
CREATE TABLE IF NOT EXISTS help_tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  subject TEXT NOT NULL,
  body TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES team_members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_help_tickets_status ON help_tickets(status);
CREATE INDEX IF NOT EXISTS idx_help_tickets_created ON help_tickets(created_at DESC);

ALTER TABLE help_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read help_tickets" ON help_tickets;
DROP POLICY IF EXISTS "Anon insert help_tickets" ON help_tickets;
DROP POLICY IF EXISTS "Anon update help_tickets" ON help_tickets;
DROP POLICY IF EXISTS "Anon delete help_tickets" ON help_tickets;
DROP POLICY IF EXISTS "Service role full access on help_tickets" ON help_tickets;

CREATE POLICY "Anon read help_tickets" ON help_tickets FOR SELECT USING (true);
CREATE POLICY "Anon insert help_tickets" ON help_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update help_tickets" ON help_tickets FOR UPDATE USING (true);
CREATE POLICY "Anon delete help_tickets" ON help_tickets FOR DELETE USING (true);
CREATE POLICY "Service role full access on help_tickets" ON help_tickets FOR ALL USING (auth.role() = 'service_role');

-- ─── Client notes (counselor log) ───
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  note_type TEXT NOT NULL DEFAULT 'notes' CHECK (note_type IN ('notes', 'sms', 'internal')),
  received_text TEXT,
  action_text TEXT,
  counselor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id, created_at DESC);

ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read client_notes" ON client_notes;
DROP POLICY IF EXISTS "Anon insert client_notes" ON client_notes;
DROP POLICY IF EXISTS "Anon update client_notes" ON client_notes;
DROP POLICY IF EXISTS "Anon delete client_notes" ON client_notes;
DROP POLICY IF EXISTS "Service role full access on client_notes" ON client_notes;

CREATE POLICY "Anon read client_notes" ON client_notes FOR SELECT USING (true);
CREATE POLICY "Anon insert client_notes" ON client_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update client_notes" ON client_notes FOR UPDATE USING (true);
CREATE POLICY "Anon delete client_notes" ON client_notes FOR DELETE USING (true);
CREATE POLICY "Service role full access on client_notes" ON client_notes FOR ALL USING (auth.role() = 'service_role');

-- ─── Staff custom hot links (shared) ───
CREATE TABLE IF NOT EXISTS staff_hot_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff_hot_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read staff_hot_links" ON staff_hot_links;
DROP POLICY IF EXISTS "Anon insert staff_hot_links" ON staff_hot_links;
DROP POLICY IF EXISTS "Anon update staff_hot_links" ON staff_hot_links;
DROP POLICY IF EXISTS "Anon delete staff_hot_links" ON staff_hot_links;
DROP POLICY IF EXISTS "Service role full access on staff_hot_links" ON staff_hot_links;

CREATE POLICY "Anon read staff_hot_links" ON staff_hot_links FOR SELECT USING (true);
CREATE POLICY "Anon insert staff_hot_links" ON staff_hot_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update staff_hot_links" ON staff_hot_links FOR UPDATE USING (true);
CREATE POLICY "Anon delete staff_hot_links" ON staff_hot_links FOR DELETE USING (true);
CREATE POLICY "Service role full access on staff_hot_links" ON staff_hot_links FOR ALL USING (auth.role() = 'service_role');

-- ─── Prospects (pre-client leads) ───
CREATE TABLE IF NOT EXISTS prospects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prospects_status ON prospects(status);

ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon read prospects" ON prospects;
DROP POLICY IF EXISTS "Anon insert prospects" ON prospects;
DROP POLICY IF EXISTS "Anon update prospects" ON prospects;
DROP POLICY IF EXISTS "Anon delete prospects" ON prospects;
DROP POLICY IF EXISTS "Service role full access on prospects" ON prospects;

CREATE POLICY "Anon read prospects" ON prospects FOR SELECT USING (true);
CREATE POLICY "Anon insert prospects" ON prospects FOR INSERT WITH CHECK (true);
CREATE POLICY "Anon update prospects" ON prospects FOR UPDATE USING (true);
CREATE POLICY "Anon delete prospects" ON prospects FOR DELETE USING (true);
CREATE POLICY "Service role full access on prospects" ON prospects FOR ALL USING (auth.role() = 'service_role');
