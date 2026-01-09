-- Test Database Connection
-- 
-- This script verifies that:
-- 1. Database connection works
-- 2. All tables exist
-- 3. All templates are inserted
--
-- Run: psql "$DATABASE_URL" -f database/test-connection.sql

-- Test 1: List all tables
\echo '=== Tables in database ==='
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Test 2: Verify service_requests table structure
\echo ''
\echo '=== service_requests table structure ==='
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'service_requests'
ORDER BY ordinal_position;

-- Test 3: Verify templates table structure
\echo ''
\echo '=== templates table structure ==='
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'templates'
ORDER BY ordinal_position;

-- Test 4: Verify business_profiles table structure
\echo ''
\echo '=== business_profiles table structure ==='
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'business_profiles'
ORDER BY ordinal_position;

-- Test 5: Count templates (should be 4)
\echo ''
\echo '=== Template count (should be 4) ==='
SELECT COUNT(*) as template_count FROM templates;

-- Test 6: List all templates
\echo ''
\echo '=== All templates ==='
SELECT id, business_model, config FROM templates ORDER BY business_model;

-- Test 7: Verify indexes
\echo ''
\echo '=== Indexes ==='
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

\echo ''
\echo '=== Database verification complete ==='

