# QR Codes Database Setup

## Overview

This document describes the database schema and RLS setup for QR codes, prepared for secure Data API access.

**Core Principle:**
- QR = Pointer (points to entity)
- DB = Authority (source of truth)
- Data API = Read-only window
- Writes happen elsewhere (serverless functions)

---

## Schema

### qr_codes Table

```sql
create table qr_codes (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (
    entity_type in ('product', 'service', 'business', 'payment', 'customer')
  ),
  entity_id uuid not null,
  business_id uuid not null references business_profiles(id) on delete cascade,
  qr_data text, -- Optional: QR code payload/data
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Columns

- **id**: UUID primary key (auto-generated)
- **entity_type**: Type of entity (product, service, business, payment, customer)
- **entity_id**: ID of the entity this QR code references
- **business_id**: Business that owns this QR code (for RLS filtering)
- **qr_data**: Optional QR code payload/data
- **is_active**: Whether QR code is currently active
- **created_at**: Timestamp of creation
- **updated_at**: Timestamp of last update

### Indexes

- `idx_qr_codes_business_id` - Fast lookups by business
- `idx_qr_codes_entity` - Fast lookups by entity type and ID
- `idx_qr_codes_active` - Partial index for active QR codes only

---

## Row Level Security (RLS)

### Enabled

RLS is enabled on `qr_codes` table to ensure data isolation.

### Policies

#### 1. SELECT Policy: "Users can view QR codes for own businesses"

```sql
create policy "Users can view QR codes for own businesses"
  on qr_codes
  for select
  using (
    business_id in (
      select id from business_profiles
      where owner_id = auth.uid()
    )
  );
```

**Rule:** Users can only SELECT QR codes where the `business_id` belongs to a business they own.

#### 2. INSERT Policy: "Block INSERT via Data API"

```sql
create policy "Block INSERT via Data API"
  on qr_codes
  for insert
  with check (false);
```

**Rule:** All INSERT operations are blocked via Data API. Writes must go through serverless functions.

#### 3. UPDATE Policy: "Block UPDATE via Data API"

```sql
create policy "Block UPDATE via Data API"
  on qr_codes
  for update
  using (false);
```

**Rule:** All UPDATE operations are blocked via Data API. Writes must go through serverless functions.

#### 4. DELETE Policy: "Block DELETE via Data API"

```sql
create policy "Block DELETE via Data API"
  on qr_codes
  for delete
  using (false);
```

**Rule:** All DELETE operations are blocked via Data API. Writes must go through serverless functions.

---

## Security Model

### Read Access (Data API)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │  Neon Data   │         │  PostgreSQL │
│             │         │     API      │         │             │
│ 1. JWT      │────────▶│ 2. Extract   │────────▶│ 3. RLS      │
│    Token    │         │    user_id   │         │    Policy   │
│             │         │              │         │             │
│ 4. Filtered │◀────────│ 5. Query     │◀────────│ 6. Check    │
│    QR Codes │         │    Filtered  │         │    Business │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Write Access (Blocked)

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │  Neon Data   │         │  PostgreSQL │
│             │         │     API      │         │             │
│ 1. INSERT   │────────▶│ 2. RLS       │────────▶│ 3. Policy   │
│    Request  │         │    Check     │         │    Blocks   │
│             │         │              │         │             │
│ 4. Error    │◀────────│ 5. Reject    │◀────────│ 6. Deny     │
│    403      │         │    Request   │         │    Access   │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Usage

### Running Migration

```bash
# Create qr_codes table and enable RLS
npm run db:qr

# Verify RLS setup
npm run db:qr:verify
```

### Data API Query Examples

#### Get All Active QR Codes for User's Businesses

```javascript
// Example: Fetch all active QR codes
const response = await fetch(
  'https://ep-flat-hall-a7h51kjz.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1/qr_codes?is_active=eq.true&select=id,entity_type,entity_id,business_id,qr_data,created_at',
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
      'apikey': jwtToken,
    },
  }
);

const qrCodes = await response.json();
// Result: Only QR codes for businesses owned by JWT user_id
```

#### Get QR Codes for Specific Business

```javascript
// Example: Fetch QR codes for a specific business
const businessId = '11111111-1111-1111-1111-111111111111';

const response = await fetch(
  `https://ep-flat-hall-a7h51kjz.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1/qr_codes?business_id=eq.${businessId}&is_active=eq.true&select=*`,
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
      'apikey': jwtToken,
    },
  }
);

const qrCodes = await response.json();
// Result: Only if business_id belongs to user's businesses
```

#### Get QR Code by Entity

```javascript
// Example: Find QR code for a specific product
const response = await fetch(
  'https://ep-flat-hall-a7h51kjz.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1/qr_codes?entity_type=eq.product&entity_id=eq.prod-123&select=*',
  {
    headers: {
      'Authorization': `Bearer ${jwtToken}`,
      'Content-Type': 'application/json',
      'apikey': jwtToken,
    },
  }
);

const qrCode = await response.json();
// Result: QR code if it belongs to user's business, empty array otherwise
```

---

## Write Operations

### Important Note

**All write operations (INSERT, UPDATE, DELETE) are blocked via RLS.**

QR code creation/updates must go through serverless API endpoints:

```typescript
// ✅ CORRECT: Via serverless API
POST /api/qr-codes
Headers: { Authorization: Bearer <jwt> }
Body: { 
  entityType: 'product',
  entityId: 'prod-123',
  businessId: 'biz-456',
  qrData: '...'
}

// Backend validates: businessId belongs to req.user.id
// Backend uses service role to bypass RLS
```

```sql
-- ❌ WRONG: Direct INSERT via Data API
-- This will be blocked by RLS policy
insert into qr_codes (entity_type, entity_id, business_id, qr_data)
values ('product', 'prod-123', 'biz-456', 'QR_DATA');
```

---

## Verification

### Check RLS Status

```sql
-- Verify RLS is enabled
select 
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where tablename = 'qr_codes';
```

**Expected:** `rls_enabled = true`

### Check Policies

```sql
-- List all policies
select 
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
from pg_policies
where tablename = 'qr_codes';
```

**Expected:** 4 policies (SELECT, INSERT, UPDATE, DELETE)

### Test Data Isolation

1. **Create test data** (as admin/service role):
   ```sql
   -- Create businesses for two users
   insert into business_profiles (id, service_request_id, business_model, template_id, owner_id)
   values 
     ('biz-1', 'req-1', 'commerce', 'COMMERCE_BASE', 'user-1'),
     ('biz-2', 'req-2', 'food', 'FOOD_BASE', 'user-2');
   
   -- Create QR codes for both businesses
   insert into qr_codes (entity_type, entity_id, business_id, qr_data)
   values 
     ('product', 'prod-1', 'biz-1', 'QR_DATA_1'),
     ('product', 'prod-2', 'biz-2', 'QR_DATA_2');
   ```

2. **Query as user-1** (via Data API with user-1 JWT):
   ```sql
   select * from qr_codes;
   ```
   **Expected:** Only QR code for `biz-1`

3. **Query as user-2** (via Data API with user-2 JWT):
   ```sql
   select * from qr_codes;
   ```
   **Expected:** Only QR code for `biz-2`

---

## Security Guarantees

### ✅ Enforced

- ✅ Users can only SELECT QR codes for businesses they own
- ✅ No public read access
- ✅ No public write access
- ✅ INSERT blocked via Data API
- ✅ UPDATE blocked via Data API
- ✅ DELETE blocked via Data API
- ✅ Data isolation by business ownership

### ❌ Not Allowed

- ❌ Users cannot see other users' QR codes
- ❌ Unauthenticated requests return no data
- ❌ No direct INSERT/UPDATE/DELETE via Data API
- ❌ No bypassing RLS policies

---

## Next Steps

After database setup:

1. ✅ **Test with real JWT tokens** via Neon Data API
2. ✅ **Verify data isolation** works correctly
3. ✅ **Implement serverless endpoints** for QR code creation
4. ✅ **Add QR code generation logic** (frontend/backend)
5. ✅ **Implement QR code scanning** (frontend)

---

## References

- [Neon RLS Documentation](https://neon.tech/docs/security/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon Data API](https://neon.tech/docs/api/data-api)

