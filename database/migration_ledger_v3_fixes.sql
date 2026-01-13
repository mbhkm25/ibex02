-- Ledger V3 Fixes
-- Critical schema corrections for financial integrity

-- 1. Unify Types
-- Add missing values to ledger_entry_type
ALTER TYPE ledger_entry_type ADD VALUE IF NOT EXISTS 'refund';
ALTER TYPE ledger_entry_type ADD VALUE IF NOT EXISTS 'adjustment';

-- Drop redundant 'type' column
-- We assume migration V2 ran and data is fresh or compatible
ALTER TABLE ledger_entries DROP COLUMN IF EXISTS type;

-- 2. Idempotency Constraint
-- Ensure a payment intent creates exactly ONE ledger entry
ALTER TABLE ledger_entries 
  ADD CONSTRAINT uq_ledger_payment_intent UNIQUE (payment_intent_id);

-- 3. Digital Consent Integrity
-- Prevent creating an entry without customer confirmation timestamp
ALTER TABLE ledger_entries
  ADD CONSTRAINT chk_customer_consent CHECK (customer_confirmed_at IS NOT NULL);

-- 4. Audit Trail Immutability
-- Ensure ledger_events cannot be modified or deleted (Append-Only)
-- Note: Standard SQL permissions usually handle this, but triggers offer stronger enforcement.
-- For now, we rely on RLS/Grant, but here is a trigger safeguard.

CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger events are immutable. UPDATE/DELETE not allowed.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_audit_mod ON ledger_events;

CREATE TRIGGER trg_prevent_audit_mod
BEFORE UPDATE OR DELETE ON ledger_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
