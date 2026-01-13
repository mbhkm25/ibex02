-- Add finalized_at column to ledger_entries
-- This tracks when an entry was actually finalized (not when it's scheduled to finalize)

ALTER TABLE ledger_entries
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

-- Add index for efficient querying of pending entries
CREATE INDEX IF NOT EXISTS idx_ledger_entries_status_finalizes_at 
ON ledger_entries(status, finalizes_at) 
WHERE status = 'pending';
