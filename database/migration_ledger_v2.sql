-- Ledger V2 Migration
-- Enhances ledger with detailed types, statuses, consent tracking, and audit trail

-- 1. Entry Type & Status Updates
-- Create new types
CREATE TYPE ledger_entry_type AS ENUM ('payment', 'debt');

-- Update existing ledger_status enum (if needed, otherwise we assume existing is compatible or we migrate)
-- Current status: 'pending', 'completed', 'failed', 'refunded'
-- We need: 'pending', 'finalized', 'disputed', 'cancelled'
-- 'completed' maps to 'finalized' conceptually, but let's add new values if they don't exist
ALTER TYPE ledger_status ADD VALUE IF NOT EXISTS 'finalized';
ALTER TYPE ledger_status ADD VALUE IF NOT EXISTS 'disputed';
ALTER TYPE ledger_status ADD VALUE IF NOT EXISTS 'cancelled';

-- 2. Update ledger_entries table
ALTER TABLE ledger_entries
  ADD COLUMN IF NOT EXISTS entry_type ledger_entry_type DEFAULT 'payment', -- Default to payment for existing rows
  ADD COLUMN IF NOT EXISTS finalizes_at TIMESTAMPTZ, -- Will be set for new rows
  ADD COLUMN IF NOT EXISTS merchant_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS customer_confirmed_at TIMESTAMPTZ;

-- Backfill existing finalized rows (completed -> finalized logic if needed)
-- For this migration, we assume existing 'completed' rows are finalized.
UPDATE ledger_entries 
SET finalizes_at = created_at 
WHERE status = 'completed' AND finalizes_at IS NULL;

-- 3. Audit Trail Table
CREATE TABLE IF NOT EXISTS ledger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ledger_entry_id UUID NOT NULL REFERENCES ledger_entries(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id), -- Who performed the action
  action TEXT NOT NULL, -- 'create', 'confirm', 'finalize', 'dispute', 'cancel'
  metadata JSONB DEFAULT '{}', -- Extra context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_ledger_events_entry_id ON ledger_events(ledger_entry_id);
