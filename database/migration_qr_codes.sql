-- Migration: Create qr_codes table with RLS
-- 
-- Architecture: Secure QR code storage for Data API access
-- 
-- Core Principle:
-- - QR = Pointer (points to entity)
-- - DB = Authority (source of truth)
-- - Data API = Read-only window
-- - Writes happen elsewhere (serverless functions)
--
-- Security Model:
-- - RLS enabled for data isolation
-- - Users can only SELECT QR codes for businesses they own
-- - INSERT/UPDATE/DELETE blocked via RLS (Data API is read-only)
-- - Write operations must go through serverless API endpoints

-- ============================================
-- STEP 1: Create qr_codes Table
-- ============================================

create table if not exists qr_codes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (
    entity_type in ('product', 'service', 'business', 'payment', 'customer')
  ),
  entity_id uuid not null,
  business_id uuid not null references business_profiles(id) on delete cascade,
  qr_data text, -- Optional: Store QR code data/payload
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_qr_codes_business_id on qr_codes(business_id);
create index if not exists idx_qr_codes_entity on qr_codes(entity_type, entity_id);
create index if not exists idx_qr_codes_active on qr_codes(is_active) where is_active = true;

-- ============================================
-- STEP 2: Enable Row Level Security
-- ============================================

alter table qr_codes enable row level security;

-- ============================================
-- STEP 3: Create RLS Policies
-- ============================================

-- Policy: SELECT - Users can only read QR codes for businesses they own
-- Rule: business_id must belong to a business where owner_id = auth.uid()
create policy "Users can view QR codes for own businesses"
  on qr_codes
  for select
  using (
    business_id in (
      select id from business_profiles
      where owner_id = auth.uid()
    )
  );

-- Policy: INSERT - Blocked for Data API (write operations go through serverless)
-- Note: This policy denies all INSERTs via Data API
-- Serverless functions will use service role which bypasses RLS
create policy "Block INSERT via Data API"
  on qr_codes
  for insert
  with check (false);

-- Policy: UPDATE - Blocked for Data API
create policy "Block UPDATE via Data API"
  on qr_codes
  for update
  using (false);

-- Policy: DELETE - Blocked for Data API
create policy "Block DELETE via Data API"
  on qr_codes
  for delete
  using (false);

-- ============================================
-- STEP 4: Revoke Public Access
-- ============================================

-- Revoke all privileges from public role
revoke all on qr_codes from public;

-- Grant SELECT only to authenticated users (via RLS policies)
grant select on qr_codes to authenticated;

-- Note: INSERT, UPDATE, DELETE should be done via serverless API endpoints
-- which use service role and bypass RLS for authorized operations

-- ============================================
-- Comments for Documentation
-- ============================================

comment on table qr_codes is 
  'QR codes table for storing QR code references. Read-only via Data API, writes via serverless functions.';

comment on column qr_codes.entity_type is 
  'Type of entity the QR code points to: product, service, business, payment, customer';

comment on column qr_codes.entity_id is 
  'ID of the entity this QR code references';

comment on column qr_codes.business_id is 
  'Business that owns this QR code (for RLS filtering)';

comment on column qr_codes.qr_data is 
  'Optional: QR code payload/data (can be generated on-the-fly or stored)';

comment on column qr_codes.is_active is 
  'Whether this QR code is currently active';

comment on policy "Users can view QR codes for own businesses" on qr_codes is 
  'RLS policy: Users can only SELECT QR codes for businesses they own. Enforced by business_id ownership check.';

comment on policy "Block INSERT via Data API" on qr_codes is 
  'RLS policy: Blocks all INSERT operations via Data API. Writes must go through serverless functions.';

comment on policy "Block UPDATE via Data API" on qr_codes is 
  'RLS policy: Blocks all UPDATE operations via Data API. Writes must go through serverless functions.';

comment on policy "Block DELETE via Data API" on qr_codes is 
  'RLS policy: Blocks all DELETE operations via Data API. Writes must go through serverless functions.';

