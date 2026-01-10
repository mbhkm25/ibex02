-- Migration: Add logo_file_id to business_profiles
-- 
-- Architecture: Business logo storage using Cloudflare R2
-- 
-- Core Principle:
-- - R2 stores bytes (logo image)
-- - Neon stores metadata (file reference)
-- - JWT enforces ownership
-- - UI only orchestrates
--
-- Security Model:
-- - logo_file_id references files table
-- - Files table has RLS enabled
-- - Only business owners can update logo
-- - No direct file URLs stored

-- ============================================
-- STEP 1: Add logo_file_id Column
-- ============================================

alter table business_profiles
add column if not exists logo_file_id uuid
references files(id) on delete set null;

-- Index for performance
create index if not exists idx_business_profiles_logo_file_id 
on business_profiles(logo_file_id);

-- ============================================
-- Comments for Documentation
-- ============================================

comment on column business_profiles.logo_file_id is 
  'Reference to files table for business logo. NULL if no logo uploaded.';

