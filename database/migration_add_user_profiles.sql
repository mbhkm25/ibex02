-- Migration: Add user_profiles table for role management
-- This table stores user profile information linked to Neon Auth user IDs

create table if not exists user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id text not null unique, -- Neon Auth user ID (from JWT 'sub' claim)
  email text,
  phone text,
  roles text[] default array[]::text[], -- Array of roles: ['admin', 'merchant', 'customer']
  metadata jsonb default '{}'::jsonb, -- Additional user metadata
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for fast user_id lookups
create index if not exists idx_user_profiles_user_id on user_profiles(user_id);

-- Index for role-based queries
create index if not exists idx_user_profiles_roles on user_profiles using gin(roles);

-- Add user_id column to service_requests if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'service_requests' 
    and column_name = 'user_id'
  ) then
    alter table service_requests add column user_id text;
    create index if not exists idx_service_requests_user_id on service_requests(user_id);
  end if;
end $$;

-- Add owner_id column to business_profiles if it doesn't exist
do $$
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'business_profiles' 
    and column_name = 'owner_id'
  ) then
    alter table business_profiles add column owner_id text;
    create index if not exists idx_business_profiles_owner_id on business_profiles(owner_id);
  end if;
end $$;

-- Comments for documentation
comment on table user_profiles is 'User profile information linked to Neon Auth user IDs';
comment on column user_profiles.user_id is 'Neon Auth user ID from JWT sub claim';
comment on column user_profiles.roles is 'Array of user roles (admin, merchant, customer)';
comment on column service_requests.user_id is 'User ID from Neon Auth (JWT sub claim)';
comment on column business_profiles.owner_id is 'Owner user ID from Neon Auth (JWT sub claim)';

