-- Database Schema for Service Request System
-- 
-- Architecture: Minimal MVP schema for Neon PostgreSQL
-- 
-- Tables:
-- 1. service_requests - Service request lifecycle
-- 2. templates - Canonical templates for business models
-- 3. business_profiles - Activated businesses
--
-- Security:
-- - UUID primary keys for security
-- - Check constraints for data integrity
-- - Foreign key constraints for referential integrity
--
-- Created: 2024-01-20
-- Author: Senior PostgreSQL Engineer

-- Service Requests Table
-- Stores service requests from users requesting business activation
create table if not exists service_requests (
  id uuid primary key,
  status text not null check (
    status in (
      'draft',
      'submitted',
      'reviewed',
      'approved',
      'rejected',
      'activated'
    )
  ),

  business_model text not null check (
    business_model in ('commerce', 'food', 'services', 'rental')
  ),

  business_name text not null,
  description text,

  rejection_reason text,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Templates Table
-- Stores canonical templates for each business model
-- These are the base templates that get applied during activation
create table if not exists templates (
  id text primary key,
  business_model text not null,
  config jsonb not null,
  created_at timestamptz default now()
);

-- Business Profiles Table
-- Stores activated businesses (created from approved service requests)
create table if not exists business_profiles (
  id uuid primary key,
  service_request_id uuid references service_requests(id),
  business_model text not null,
  template_id text references templates(id),
  created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_service_requests_status on service_requests(status);
create index if not exists idx_service_requests_business_model on service_requests(business_model);
create index if not exists idx_templates_business_model on templates(business_model);
create index if not exists idx_business_profiles_service_request_id on business_profiles(service_request_id);
create index if not exists idx_business_profiles_template_id on business_profiles(template_id);

