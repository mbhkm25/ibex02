-- Verification Script: QR Codes RLS Testing
-- 
-- Purpose: Test RLS policies to ensure QR codes are secure
-- 
-- Usage:
-- 1. Test authenticated access (with JWT)
-- 2. Test unauthenticated access (should fail)
-- 3. Verify policies block writes
-- 4. Verify data isolation works

-- ============================================
-- STEP 1: Check Table and RLS Status
-- ============================================

-- Verify table exists
select 
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_name = 'qr_codes'
order by ordinal_position;

-- Expected: 8 columns (id, entity_type, entity_id, business_id, qr_data, is_active, created_at, updated_at)

-- Verify RLS is enabled
select 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where tablename = 'qr_codes';

-- Expected: rls_enabled = true

-- ============================================
-- STEP 2: Check RLS Policies
-- ============================================

-- List all policies on qr_codes
select 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
from pg_policies
where tablename = 'qr_codes'
order by policyname;

-- Expected Policies:
-- 1. "Users can view QR codes for own businesses" - SELECT - business_id in (select id from business_profiles where owner_id = auth.uid())
-- 2. "Block INSERT via Data API" - INSERT - with_check = false
-- 3. "Block UPDATE via Data API" - UPDATE - using = false
-- 4. "Block DELETE via Data API" - DELETE - using = false

-- ============================================
-- STEP 3: Test SELECT (Authenticated)
-- ============================================

-- Test 1: User should see only QR codes for their own businesses
-- (Run this via Data API with user's JWT token)
select 
  id,
  entity_type,
  entity_id,
  business_id,
  qr_data,
  is_active,
  created_at
from qr_codes
where is_active = true
order by created_at desc;

-- Expected: Only rows where business_id belongs to businesses owned by JWT user_id

-- Test 2: Count QR codes per business
select 
  business_id,
  entity_type,
  count(*) as qr_count
from qr_codes
where is_active = true
group by business_id, entity_type
order by business_id, entity_type;

-- Expected: Only businesses owned by JWT user_id

-- ============================================
-- STEP 4: Test Data Isolation
-- ============================================

-- Create test scenario (requires admin/service role):
-- 1. Create business_profiles for user-1 and user-2
-- 2. Create QR codes for both businesses
-- 3. Query as user-1 via Data API
-- 4. Should only see user-1's QR codes

-- Example test data (run as admin/service role):
-- 
-- insert into business_profiles (id, service_request_id, business_model, template_id, owner_id)
-- values 
--   ('11111111-1111-1111-1111-111111111111', 'req-1', 'commerce', 'COMMERCE_BASE', 'user-1'),
--   ('22222222-2222-2222-2222-222222222222', 'req-2', 'food', 'FOOD_BASE', 'user-2');
--
-- insert into qr_codes (entity_type, entity_id, business_id, qr_data, is_active)
-- values 
--   ('product', 'prod-1', '11111111-1111-1111-1111-111111111111', 'QR_DATA_1', true),
--   ('product', 'prod-2', '22222222-2222-2222-2222-222222222222', 'QR_DATA_2', true);

-- Then query as user-1 (via Data API with user-1 JWT):
-- select * from qr_codes;
-- Expected: Only QR codes for business '11111111-1111-1111-1111-111111111111'

-- ============================================
-- STEP 5: Test Write Blocking
-- ============================================

-- Test INSERT (should fail via Data API)
-- Note: This will fail with RLS policy violation
-- 
-- insert into qr_codes (entity_type, entity_id, business_id, qr_data)
-- values ('product', 'prod-3', '11111111-1111-1111-1111-111111111111', 'QR_DATA_3');
--
-- Expected: Error - RLS policy blocks INSERT

-- Test UPDATE (should fail via Data API)
-- 
-- update qr_codes 
-- set is_active = false 
-- where id = 'some-uuid';
--
-- Expected: Error - RLS policy blocks UPDATE

-- Test DELETE (should fail via Data API)
-- 
-- delete from qr_codes 
-- where id = 'some-uuid';
--
-- Expected: Error - RLS policy blocks DELETE

-- ============================================
-- STEP 6: Verify Privileges
-- ============================================

-- Check table privileges
select 
  grantee,
  table_schema,
  table_name,
  privilege_type
from information_schema.role_table_grants
where table_name = 'qr_codes'
order by grantee, privilege_type;

-- Expected:
-- - public: No privileges
-- - authenticated: SELECT only

-- ============================================
-- STEP 7: Test Business Ownership Check
-- ============================================

-- Verify the RLS policy logic works correctly
-- (This query simulates what RLS does internally)
select 
  qr.id,
  qr.entity_type,
  qr.entity_id,
  qr.business_id,
  bp.owner_id,
  case 
    when bp.owner_id = auth.uid() then 'Accessible'
    else 'Blocked'
  end as access_status
from qr_codes qr
left join business_profiles bp on qr.business_id = bp.id;

-- Expected: Only rows where owner_id matches auth.uid() are accessible

-- ============================================
-- Summary
-- ============================================

-- ✅ Table Created: qr_codes with proper schema
-- ✅ RLS Enabled: Row Level Security active
-- ✅ SELECT Policy: Users can only see QR codes for own businesses
-- ✅ INSERT Blocked: RLS policy blocks INSERT via Data API
-- ✅ UPDATE Blocked: RLS policy blocks UPDATE via Data API
-- ✅ DELETE Blocked: RLS policy blocks DELETE via Data API
-- ✅ Public Access: Revoked
-- ✅ Authenticated Access: SELECT only

-- Next Steps:
-- 1. Test via Neon Data API with real JWT tokens
-- 2. Verify users can only see their own QR codes
-- 3. Verify write operations are blocked
-- 4. Implement serverless endpoints for QR code creation/updates

