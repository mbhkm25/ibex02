-- Migration: Create product_images table for product image management
-- 
-- Architecture: Product images storage using Cloudflare R2
-- 
-- Core Principle:
-- - R2 stores bytes (image files)
-- - Neon stores relations (product_images table)
-- - JWT enforces ownership
-- - UI orchestrates only
--
-- Security Model:
-- - product_images references files table
-- - Files table has RLS enabled
-- - Only product owners (via business ownership) can manage images
-- - No direct file URLs stored

-- ============================================
-- STEP 1: Create product_images Table
-- ============================================

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null,
  file_id uuid not null references files(id) on delete cascade,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_product_images_product_id on product_images(product_id);
create index if not exists idx_product_images_file_id on product_images(file_id);
create index if not exists idx_product_images_sort_order on product_images(product_id, sort_order);

-- ============================================
-- STEP 2: Enable Row Level Security
-- ============================================

alter table product_images enable row level security;

-- ============================================
-- STEP 3: Create RLS Policies
-- ============================================

-- Policy: SELECT - Users can only read images for products they own
-- Rule: product must belong to a business where owner_id = auth.uid()
-- Note: This assumes products table exists with business_id column
-- If products table doesn't exist yet, this policy will be created but won't work until products table is created
do $$
begin
  if exists (select 1 from information_schema.tables where table_name = 'products') then
    create policy "Users can view product images for own businesses"
      on product_images
      for select
      using (
        product_id in (
          select p.id from products p
          inner join business_profiles bp on p.business_id = bp.id
          where bp.owner_id::text = auth.uid()::text
        )
      );
  else
    -- Create a temporary policy that will be replaced when products table is created
    create policy "Users can view product images for own businesses"
      on product_images
      for select
      using (false); -- Block all access until products table exists
  end if;
exception
  when duplicate_object then
    -- Policy already exists, skip
    null;
end $$;

-- Policy: INSERT - Blocked for Data API (write operations go through serverless)
create policy "Block INSERT via Data API"
  on product_images
  for insert
  with check (false);

-- Policy: UPDATE - Blocked for Data API
create policy "Block UPDATE via Data API"
  on product_images
  for update
  using (false);

-- Policy: DELETE - Blocked for Data API
create policy "Block DELETE via Data API"
  on product_images
  for delete
  using (false);

-- ============================================
-- STEP 4: Revoke Public Access
-- ============================================

-- Revoke all privileges from public role
revoke all on product_images from public;

-- Grant SELECT only to authenticated users (via RLS policies)
grant select on product_images to authenticated;

-- ============================================
-- Comments for Documentation
-- ============================================

comment on table product_images is 
  'Product images table linking products to files. Multiple images per product supported.';

comment on column product_images.product_id is 
  'Product that owns this image';

comment on column product_images.file_id is 
  'Reference to files table for the image file';

comment on column product_images.sort_order is 
  'Display order for images (0 = first, 1 = second, etc.)';

comment on policy "Users can view product images for own businesses" on product_images is 
  'RLS policy: Users can only SELECT product images for products in businesses they own.';

