-- Payment Intents Table
-- Represents a request for payment (QR Code)
-- Temporary state before transaction confirmation
CREATE TYPE currency_code AS ENUM ('YER', 'SAR', 'USD');
CREATE TYPE intent_status AS ENUM ('created', 'used', 'expired', 'cancelled');

CREATE TABLE IF NOT EXISTS payment_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  created_by_staff_id UUID NOT NULL REFERENCES users(id), -- User ID of the staff member
  invoice_reference TEXT, -- Optional internal reference (e.g. POS order ID)
  amount DECIMAL(18, 2) NOT NULL CHECK (amount > 0),
  currency currency_code NOT NULL,
  status intent_status DEFAULT 'created',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ledger Entries Table
-- Append-only immutable financial record
-- Represents confirmed transactions
CREATE TYPE ledger_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE transaction_type AS ENUM ('payment', 'refund', 'deposit', 'withdrawal');

CREATE TABLE IF NOT EXISTS ledger_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  customer_id UUID NOT NULL REFERENCES customers(id), -- Link to customer profile in that business
  payment_intent_id UUID REFERENCES payment_intents(id), -- Link to source intent (if applicable)
  
  amount DECIMAL(18, 2) NOT NULL, -- Can be negative for refunds
  currency currency_code NOT NULL,
  type transaction_type NOT NULL,
  status ledger_status DEFAULT 'completed',
  reference TEXT, -- External reference
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT immutable_ledger CHECK (true) -- Logical marker that this table is append-only
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_intents_status ON payment_intents(status);
CREATE INDEX IF NOT EXISTS idx_payment_intents_expires_at ON payment_intents(expires_at);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_business_id ON ledger_entries(business_id);
CREATE INDEX IF NOT EXISTS idx_ledger_entries_customer_id ON ledger_entries(customer_id);

-- RLS Policies
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_entries ENABLE ROW LEVEL SECURITY;

-- 1. Staff can view intents they created or belong to their business
CREATE POLICY "Staff view intents" ON payment_intents
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE owner_user_id = auth.uid()::uuid
      -- TODO: Add logic for staff/managers linked to business
    )
  );

-- 2. Business owners can view ledger
CREATE POLICY "Owners view ledger" ON ledger_entries
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE owner_user_id = auth.uid()::uuid
    )
  );

-- 3. Customers can view their own ledger entries
CREATE POLICY "Customers view own ledger" ON ledger_entries
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()::uuid
    )
  );
