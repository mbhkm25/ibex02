-- Create customers table (Relationship between User and Business)
-- This enforces the "Siloed Wallet" logic per business
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES business_profiles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Link to global user if registered
  
  -- Customer Info (Snapshot or Independent if no user_id)
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  
  -- Wallet / Ledger
  balance DECIMAL(10, 2) DEFAULT 0.00, -- Store-specific balance
  credit_limit DECIMAL(10, 2) DEFAULT 0.00, -- Allowed debt limit
  
  -- Status
  status TEXT DEFAULT 'active', -- active, suspended, blocked
  category TEXT DEFAULT 'standard', -- standard, vip, etc.
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure phone is unique per business
  UNIQUE(business_id, phone)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_customers_business_id ON customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 1. Business Owner can view/edit their customers
CREATE POLICY "Business owners can manage their customers" ON customers
  FOR ALL
  USING (
    business_id IN (
      SELECT id FROM business_profiles 
      WHERE owner_user_id = auth.uid()::uuid
    )
  );

-- 2. Users can view their own customer profiles (Wallets)
CREATE POLICY "Users can view their own wallets" ON customers
  FOR SELECT
  USING (
    user_id = auth.uid()::uuid
  );
