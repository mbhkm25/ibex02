# Database Schema - PostgreSQL (Neon)

## Overview

This document defines the PostgreSQL schema for the Service Request System. The database is hosted on Neon and accessed via Vercel Serverless Functions.

**Architecture**: All database access is server-side only. Frontend never connects directly to PostgreSQL.

---

## Tables

### service_requests

Stores service requests from users requesting "Customer Management Service".

```sql
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Status & Lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  activated_at TIMESTAMPTZ,
  rejection_reason TEXT,
  
  -- Business Information
  business_name VARCHAR(255) NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  logo_url TEXT,
  logo_key TEXT,
  
  -- Manager Information
  manager_phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  
  -- Business Details
  description TEXT NOT NULL,
  business_type VARCHAR(20) NOT NULL, -- 'products', 'services', 'both'
  business_model VARCHAR(20), -- 'commerce', 'food', 'services', 'rental' (PRIMARY)
  
  -- Template Matching (backend-driven)
  suggested_template_ids TEXT[], -- Array of template IDs
  selected_template_id VARCHAR(100),
  template_match_scores JSONB, -- Array of {templateId, score, reasons}
  
  -- Relations
  business_profile_id UUID,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  
  CONSTRAINT status_check CHECK (status IN ('draft', 'submitted', 'reviewed', 'approved', 'rejected', 'activated')),
  CONSTRAINT business_type_check CHECK (business_type IN ('products', 'services', 'both')),
  CONSTRAINT business_model_check CHECK (business_model IN ('commerce', 'food', 'services', 'rental'))
);

CREATE INDEX idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_business_model ON service_requests(business_model);
CREATE INDEX idx_service_requests_created_at ON service_requests(created_at DESC);
```

### business_profiles

Stores activated businesses (created from approved service requests).

```sql
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE REFERENCES service_requests(id),
  user_id UUID NOT NULL,
  business_number VARCHAR(50) UNIQUE NOT NULL,
  
  -- Basic Information
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  contact_info VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  logo_url TEXT,
  
  -- Manager Information
  manager_phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  
  -- Business Details
  description TEXT NOT NULL,
  business_type VARCHAR(20) NOT NULL,
  business_model VARCHAR(20) NOT NULL, -- PRIMARY decision axis
  category VARCHAR(100),
  tags TEXT[],
  
  -- Template Instance
  template_instance_id UUID NOT NULL,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  activated_at TIMESTAMPTZ NOT NULL,
  suspended_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  
  -- Metrics (computed, cached)
  customers_count INTEGER NOT NULL DEFAULT 0,
  orders_count INTEGER NOT NULL DEFAULT 0,
  total_balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(15, 2),
  growth DECIMAL(5, 2),
  
  -- Settings (JSONB for flexibility)
  settings JSONB NOT NULL DEFAULT '{
    "allowCreditPurchases": false,
    "defaultCurrency": "SAR",
    "notificationPreferences": {
      "email": true,
      "sms": true,
      "push": true
    }
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT status_check CHECK (status IN ('active', 'suspended', 'closed')),
  CONSTRAINT business_type_check CHECK (business_type IN ('products', 'services', 'both')),
  CONSTRAINT business_model_check CHECK (business_model IN ('commerce', 'food', 'services', 'rental'))
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_profiles_status ON business_profiles(status);
CREATE INDEX idx_business_profiles_business_model ON business_profiles(business_model);
CREATE INDEX idx_business_profiles_slug ON business_profiles(slug);
```

### template_instances

Stores template instances linked to business profiles.

```sql
CREATE TABLE template_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id VARCHAR(100) NOT NULL, -- References template registry
  business_profile_id UUID NOT NULL UNIQUE REFERENCES business_profiles(id),
  
  -- Configuration (JSONB for flexibility)
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  customizations JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  migrated_from VARCHAR(100),
  
  CONSTRAINT status_check CHECK (status IN ('active', 'suspended', 'migrated'))
);

CREATE INDEX idx_template_instances_business_profile_id ON template_instances(business_profile_id);
CREATE INDEX idx_template_instances_template_id ON template_instances(template_id);
```

### activation_logs

Audit trail for business activations.

```sql
CREATE TABLE activation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id),
  business_profile_id UUID NOT NULL REFERENCES business_profiles(id),
  template_id VARCHAR(100) NOT NULL,
  business_model VARCHAR(20) NOT NULL,
  activated_by UUID NOT NULL,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_activation_logs_service_request_id ON activation_logs(service_request_id);
CREATE INDEX idx_activation_logs_business_profile_id ON activation_logs(business_profile_id);
CREATE INDEX idx_activation_logs_activated_at ON activation_logs(activated_at DESC);
```

---

## Key Constraints

### Foreign Keys
- `business_profiles.service_request_id` → `service_requests.id` (1:1)
- `business_profiles.template_instance_id` → `template_instances.id` (1:1)
- `template_instances.business_profile_id` → `business_profiles.id` (1:1)

### Unique Constraints
- `service_requests.request_number` (unique)
- `service_requests.business_profile_id` (unique, nullable)
- `business_profiles.business_number` (unique)
- `business_profiles.slug` (unique)
- `template_instances.business_profile_id` (unique)

### Check Constraints
- Status values are enforced at database level
- Business type and model values are enforced

---

## Indexes

### Performance Indexes
- User lookups: `user_id` on both tables
- Status filtering: `status` on both tables
- Business model filtering: `business_model` on both tables
- Time-based queries: `created_at` DESC

---

## Environment Variables

Required in Vercel:

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**Security**: Never commit `DATABASE_URL` to version control. Set in Vercel dashboard.

---

## Migration Notes

### Initial Setup
1. Create database on Neon
2. Run schema creation SQL
3. Set `DATABASE_URL` in Vercel environment variables
4. Test connection from serverless function

### Future Migrations
- Use migration tool (e.g., `node-pg-migrate`) for version control
- Never drop columns without deprecation period
- Always add new columns as nullable first, then backfill

---

## Data Types

### UUID
- All IDs use UUID for security and distribution
- Generated with `gen_random_uuid()`

### JSONB
- Used for flexible schema (settings, configuration, customizations)
- Allows querying and indexing JSON fields
- PostgreSQL-optimized binary format

### TIMESTAMPTZ
- All timestamps use timezone-aware type
- Stored in UTC, converted in application layer

### DECIMAL
- Financial amounts use DECIMAL for precision
- Format: `DECIMAL(15, 2)` (up to 999,999,999,999,999.99)

---

## Security Considerations

1. **Parameterized Queries**: Always use `$1, $2, ...` placeholders
2. **Input Validation**: Validate all inputs before database operations
3. **Connection Pooling**: Use connection pool, not direct connections
4. **SSL Required**: Neon requires SSL connections
5. **Environment Variables**: Never expose `DATABASE_URL` in code

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-20  
**Author**: Senior Serverless Architect + PostgreSQL Engineer

