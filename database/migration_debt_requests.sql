-- Debt Requests Table
-- Workflow: Merchant Request -> Customer Confirm -> Ledger Entry

CREATE TYPE debt_status AS ENUM ('requested', 'approved', 'rejected', 'cancelled');

CREATE TABLE IF NOT EXISTS debt_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  created_by_staff_id UUID NOT NULL REFERENCES users(id),
  
  amount DECIMAL(18, 2) NOT NULL CHECK (amount > 0),
  currency currency_code NOT NULL,
  
  credit_limit_snapshot DECIMAL(18, 2), -- Limit at time of request
  due_date TIMESTAMPTZ,
  notes TEXT,
  
  status debt_status DEFAULT 'requested',
  rejection_reason TEXT,
  
  -- Audit & Consent
  merchant_confirmed_at TIMESTAMPTZ DEFAULT NOW(),
  customer_confirmed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_debt_requests_business_id ON debt_requests(business_id);
CREATE INDEX IF NOT EXISTS idx_debt_requests_customer_id ON debt_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_debt_requests_status ON debt_requests(status);

-- RLS Policies
ALTER TABLE debt_requests ENABLE ROW LEVEL SECURITY;

-- 1. Merchant can manage requests for their business
CREATE POLICY "Merchants manage debt requests" ON debt_requests
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM business_profiles WHERE owner_user_id = auth.uid()::uuid
    )
  );

-- 2. Customers can view their own requests
CREATE POLICY "Customers view own debt requests" ON debt_requests
  FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()::uuid
    )
  );
