-- Migration: Create files table for object storage metadata
-- 
-- Architecture: File metadata storage for Cloudflare R2
-- 
-- Core Principle:
-- - Files live in R2 (object storage)
-- - Metadata lives in Neon (database)
-- - Access is always mediated by serverless logic
-- - No shortcuts
--
-- Security Model:
-- - RLS enabled for data isolation
-- - Users can only see files for businesses they own
-- - File operations require authentication

-- ============================================
-- STEP 1: Create files Table
-- ============================================

create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  owner_id text not null, -- User ID from Neon Auth (JWT sub claim)
  business_id uuid not null references business_profiles(id) on delete cascade,
  bucket text not null default 'assets',
  object_key text not null, -- R2 object key (e.g., business/{business_id}/{uuid}.{ext})
  mime_type text not null, -- MIME type (e.g., image/png, application/pdf)
  size bigint not null, -- File size in bytes
  original_filename text, -- Original filename (optional)
  metadata jsonb default '{}'::jsonb, -- Additional metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_files_owner_id on files(owner_id);
create index if not exists idx_files_business_id on files(business_id);
create index if not exists idx_files_object_key on files(object_key);
create index if not exists idx_files_mime_type on files(mime_type);

-- ============================================
-- STEP 2: Enable Row Level Security
-- ============================================

alter table files enable row level security;

-- ============================================
-- STEP 3: Create RLS Policies
-- ============================================

-- Policy: SELECT - Users can only read files for businesses they own
-- Rule: business_id must belong to a business where owner_id = auth.uid()
create policy "Users can view files for own businesses"
  on files
  for select
  using (
    business_id in (
      select id from business_profiles
      where owner_id::text = auth.uid()::text
    )
  );

-- Policy: INSERT - Blocked for Data API (write operations go through serverless)
create policy "Block INSERT via Data API"
  on files
  for insert
  with check (false);

-- Policy: UPDATE - Blocked for Data API
create policy "Block UPDATE via Data API"
  on files
  for update
  using (false);

-- Policy: DELETE - Blocked for Data API
create policy "Block DELETE via Data API"
  on files
  for delete
  using (false);

-- ============================================
-- STEP 4: Revoke Public Access
-- ============================================

-- Revoke all privileges from public role
revoke all on files from public;

-- Grant SELECT only to authenticated users (via RLS policies)
grant select on files to authenticated;

-- ============================================
-- Comments for Documentation
-- ============================================

comment on table files is 
  'File metadata table for Cloudflare R2 object storage. Files stored in R2, metadata in Neon.';

comment on column files.owner_id is 
  'User ID from Neon Auth (JWT sub claim) who owns this file';

comment on column files.business_id is 
  'Business that owns this file (for RLS filtering)';

comment on column files.object_key is 
  'R2 object key (e.g., business/{business_id}/{uuid}.{ext})';

comment on column files.bucket is 
  'R2 bucket name (default: assets)';

comment on policy "Users can view files for own businesses" on files is 
  'RLS policy: Users can only SELECT files for businesses they own. Enforced by business_id ownership check.';

