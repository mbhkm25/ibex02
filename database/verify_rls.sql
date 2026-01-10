-- Verification Script: Row Level Security (RLS) Testing
-- 
-- Purpose: Test RLS policies to ensure Data API security
-- 
-- Usage:
-- 1. Test authenticated access (with JWT)
-- 2. Test unauthenticated access (should fail)
-- 3. Verify policies are working correctly

-- ============================================
-- STEP 1: Check RLS Status
-- ============================================

-- Verify RLS is enabled on service_requests
select 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where tablename in ('service_requests', 'business_profiles')
order by tablename;

-- Expected Result:
-- service_requests | rls_enabled = true
-- business_profiles | rls_enabled = true

-- ============================================
-- STEP 2: Check RLS Policies
-- ============================================

-- List all policies on service_requests
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression
from pg_policies
where tablename in ('service_requests', 'business_profiles')
order by tablename, policyname;

-- Expected Result:
-- service_requests | "Users can view own service requests" | SELECT | user_id = auth.uid()
-- business_profiles | "Users can view own business profiles" | SELECT | owner_id = auth.uid()

-- ============================================
-- STEP 3: Test Authenticated Access
-- ============================================

-- Note: These queries require a valid JWT token in the request
-- When using Neon Data API, the JWT is automatically extracted
-- and auth.uid() returns the user_id from the JWT 'sub' claim

-- Test 1: User should see only their own service requests
-- (Run this via Data API with user's JWT token)
select 
  id,
  status,
  business_model,
  business_name,
  user_id,
  created_at
from service_requests
order by created_at desc;

-- Expected: Only rows where user_id matches JWT user_id

-- Test 2: User should see only their own business profiles
-- (Run this via Data API with user's JWT token)
select 
  id,
  service_request_id,
  business_model,
  template_id,
  owner_id,
  created_at
from business_profiles
order by created_at desc;

-- Expected: Only rows where owner_id matches JWT user_id

-- ============================================
-- STEP 4: Test Unauthenticated Access
-- ============================================

-- Note: These queries should return empty results or error
-- when run without authentication

-- Test 1: Without JWT, should return no rows
select count(*) as total_requests
from service_requests;

-- Expected: 0 (or error if RLS is strict)

-- Test 2: Without JWT, should return no rows
select count(*) as total_businesses
from business_profiles;

-- Expected: 0 (or error if RLS is strict)

-- ============================================
-- STEP 5: Verify No Public Write Access
-- ============================================

-- Check table privileges
select 
  grantee,
  table_schema,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_name in ('service_requests', 'business_profiles')
  and grantee = 'public'
order by table_name, privilege_type;

-- Expected: No rows (public should have no privileges)

-- Check if authenticated role has SELECT only
select 
  grantee,
  table_schema,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_name in ('service_requests', 'business_profiles')
  and grantee = 'authenticated'
order by table_name, privilege_type;

-- Expected: Only SELECT privileges (no INSERT, UPDATE, DELETE)

-- ============================================
-- STEP 6: Test Data Isolation
-- ============================================

-- Create test scenario (requires admin access):
-- 1. Create service_request with user_id = 'user-1'
-- 2. Create service_request with user_id = 'user-2'
-- 3. Login as user-1 via Data API
-- 4. Query service_requests
-- 5. Should only see user-1's request

-- Example test data (run as admin):
-- insert into service_requests (id, status, business_model, business_name, user_id)
-- values 
--   ('11111111-1111-1111-1111-111111111111', 'approved', 'commerce', 'Test Business 1', 'user-1'),
--   ('22222222-2222-2222-2222-222222222222', 'approved', 'food', 'Test Business 2', 'user-2');

-- Then query as user-1 (via Data API with user-1 JWT):
-- select * from service_requests;
-- Expected: Only row with user_id = 'user-1'

-- ============================================
-- STEP 7: Verify auth.uid() Function
-- ============================================

-- Check if auth.uid() function exists
select 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
from pg_proc
where proname = 'uid'
  and pronamespace = (select oid from pg_namespace where nspname = 'auth');

-- Expected: Function exists and returns text (user_id from JWT)

-- Test auth.uid() (requires JWT in request)
select auth.uid() as current_user_id;

-- Expected: Returns user_id from JWT 'sub' claim, or null if not authenticated

-- ============================================
-- Summary
-- ============================================

-- ✅ RLS Enabled: service_requests, business_profiles
-- ✅ Policies Created: Users can only see own data
-- ✅ Public Access: Revoked
-- ✅ Authenticated Access: SELECT only
-- ✅ Data Isolation: Enforced by user_id/owner_id = auth.uid()

-- Next Steps:
-- 1. Test via Neon Data API with real JWT tokens
-- 2. Verify users can only see their own data
-- 3. Verify unauthenticated requests return empty results
-- 4. Test admin access (if admin policies are added)

