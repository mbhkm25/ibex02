-- Migration: Enable Row Level Security (RLS) for Data API
-- 
-- Architecture: Secure Data API access using RLS policies
-- 
-- Core Principle:
-- - Data API = Read window
-- - RLS = Lock
-- - JWT = Key
-- - No RLS = No Data API
--
-- Security Model:
-- - Users can only SELECT their own data
-- - JWT user_id extracted via auth.uid()
-- - No public write access
-- - Admin access handled separately

-- ============================================
-- STEP 1: Enable Row Level Security
-- ============================================

-- Enable RLS on service_requests
alter table service_requests enable row level security;

-- Enable RLS on business_profiles
alter table business_profiles enable row level security;

-- ============================================
-- STEP 2: Create RLS Policies
-- ============================================

-- Policy: service_requests - Users can only see their own requests
-- Rule: user_id must match auth.uid() from JWT
create policy "Users can view own service requests"
  on service_requests
  for select
  using (user_id = auth.uid());

-- Policy: business_profiles - Users can only see their own businesses
-- Rule: owner_id must match auth.uid() from JWT
create policy "Users can view own business profiles"
  on business_profiles
  for select
  using (owner_id = auth.uid());

-- ============================================
-- STEP 3: Ensure No Public Access
-- ============================================

-- Revoke all privileges from public role (if any exist)
-- This ensures no anonymous access
revoke all on service_requests from public;
revoke all on business_profiles from public;
revoke all on user_profiles from public;

-- Grant SELECT only to authenticated users (via RLS policies)
-- RLS policies will enforce the actual access rules
grant select on service_requests to authenticated;
grant select on business_profiles to authenticated;
grant select on user_profiles to authenticated;

-- Note: INSERT, UPDATE, DELETE operations should go through
-- serverless API endpoints, not directly through Data API
-- This migration only enables read access via Data API

-- ============================================
-- STEP 4: Admin Access (Optional)
-- ============================================

-- If you need admin users to see all data, create a separate policy
-- This requires checking user roles from JWT or user_profiles table
-- 
-- Example (commented out - implement based on your needs):
-- 
-- create policy "Admins can view all service requests"
--   on service_requests
--   for select
--   using (
--     exists (
--       select 1 from user_profiles
--       where user_id = auth.uid()
--       and 'admin' = any(roles)
--     )
--   );

-- ============================================
-- Comments for Documentation
-- ============================================

comment on policy "Users can view own service requests" on service_requests is 
  'RLS policy: Users can only SELECT their own service requests. Enforced by user_id = auth.uid()';

comment on policy "Users can view own business profiles" on business_profiles is 
  'RLS policy: Users can only SELECT their own business profiles. Enforced by owner_id = auth.uid()';

