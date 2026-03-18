-- Clover Integration: Add columns to payments table and create supporting tables
-- Run this in the Supabase SQL Editor

-- Add Clover-specific columns to the payments table
ALTER TABLE payments 
  ADD COLUMN IF NOT EXISTS clover_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS clover_plan_id TEXT,
  ADD COLUMN IF NOT EXISTS clover_subscription_id TEXT;

-- Add clover_customer_id column to clients table
ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS clover_customer_id TEXT;

-- Add clover_charge_id to payment_history table
ALTER TABLE payment_history
  ADD COLUMN IF NOT EXISTS clover_charge_id TEXT;

-- Create scheduled_charges table for future-dated setup fees
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

-- Disable RLS on new table (for development — enable in production)
ALTER TABLE scheduled_charges DISABLE ROW LEVEL SECURITY;
