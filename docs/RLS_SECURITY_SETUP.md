# Row Level Security (RLS) Setup

## Overview

This document describes the Row Level Security (RLS) implementation for securing Neon Data API access.

**Core Principle:**
- Data API = Read window
- RLS = Lock
- JWT = Key
- No RLS = No Data API

---

## Architecture

### Security Model

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Client    │         │  Neon Data   │         │  PostgreSQL │
│             │         │     API      │         │             │
│ 1. JWT      │────────▶│ 2. Extract  │────────▶│ 3. RLS      │
│    Token    │         │    user_id   │         │    Policy   │
│             │         │              │         │             │
│ 4. Filtered │◀────────│ 5. Query     │◀────────│ 6. Return   │
│    Results  │         │    Filtered  │         │    Filtered │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Flow

1. **Client Request:** Sends JWT token to Neon Data API
2. **Neon Data API:** Extracts `user_id` from JWT `sub` claim
3. **PostgreSQL:** Executes query with `auth.uid()` = user_id
4. **RLS Policy:** Filters rows where `user_id = auth.uid()`
5. **Result:** User only sees their own data

---

## Implementation

### STEP 1: Enable RLS

```sql
-- Enable RLS on service_requests
alter table service_requests enable row level security;

-- Enable RLS on business_profiles
alter table business_profiles enable row level security;
```

### STEP 2: Create RLS Policies

#### Service Requests Policy

```sql
create policy "Users can view own service requests"
  on service_requests
  for select
  using (user_id = auth.uid());
```

**Rule:** Users can only SELECT rows where `user_id` matches their JWT `user_id`.

#### Business Profiles Policy

```sql
create policy "Users can view own business profiles"
  on business_profiles
  for select
  using (owner_id = auth.uid());
```

**Rule:** Users can only SELECT rows where `owner_id` matches their JWT `user_id`.

### STEP 3: Revoke Public Access

```sql
-- Revoke all privileges from public role
revoke all on service_requests from public;
revoke all on business_profiles from public;
revoke all on user_profiles from public;

-- Grant SELECT only to authenticated users
grant select on service_requests to authenticated;
grant select on business_profiles to authenticated;
grant select on user_profiles to authenticated;
```

**Security:** No anonymous access. Only authenticated users can read data, and only their own data.

---

## Usage

### Running Migration

```bash
# Enable RLS and create policies
npm run db:rls

# Verify RLS setup
npm run db:rls:verify
```

### Testing via Data API

#### Authenticated Request

```javascript
// Example: Fetch user's service requests
const response = await fetch('https://ep-flat-hall-a7h51kjz.neon.tech/v1/data/service_requests', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
});

// Result: Only service requests where user_id matches JWT user_id
```

#### Unauthenticated Request

```javascript
// Example: Request without JWT
const response = await fetch('https://ep-flat-hall-a7h51kjz.neon.tech/v1/data/service_requests', {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Result: Empty array or error (no data returned)
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
where tablename in ('service_requests', 'business_profiles');
```

**Expected:**
- `service_requests` → `rls_enabled = true`
- `business_profiles` → `rls_enabled = true`

### Check Policies

```sql
-- List all policies
select 
  tablename,
  policyname,
  cmd as command,
  qual as using_expression
from pg_policies
where tablename in ('service_requests', 'business_profiles');
```

**Expected:**
- `service_requests` → Policy: "Users can view own service requests"
- `business_profiles` → Policy: "Users can view own business profiles"

### Test Data Isolation

1. **Create test data:**
   ```sql
   insert into service_requests (id, status, business_model, business_name, user_id)
   values 
     ('11111111-1111-1111-1111-111111111111', 'approved', 'commerce', 'Business 1', 'user-1'),
     ('22222222-2222-2222-2222-222222222222', 'approved', 'food', 'Business 2', 'user-2');
   ```

2. **Query as user-1 (via Data API with user-1 JWT):**
   ```sql
   select * from service_requests;
   ```
   **Expected:** Only row with `user_id = 'user-1'`

3. **Query as user-2 (via Data API with user-2 JWT):**
   ```sql
   select * from service_requests;
   ```
   **Expected:** Only row with `user_id = 'user-2'`

---

## Security Guarantees

### ✅ Enforced

- ✅ Users can only SELECT their own data
- ✅ No public read access
- ✅ No public write access
- ✅ Data isolation by user_id
- ✅ JWT required for all queries

### ❌ Not Allowed

- ❌ Users cannot see other users' data
- ❌ Unauthenticated requests return no data
- ❌ No direct INSERT/UPDATE/DELETE via Data API
- ❌ No bypassing RLS policies

---

## Write Operations

### Important Note

**RLS policies only control SELECT (read) operations.**

Write operations (INSERT, UPDATE, DELETE) should:
1. **Go through serverless API endpoints** (not Data API)
2. **Be validated server-side** (check user_id matches)
3. **Use transactions** for data integrity

### Example: Creating Service Request

```typescript
// ✅ CORRECT: Via serverless API
POST /api/service-requests
Headers: { Authorization: Bearer <jwt> }
Body: { businessModel: 'commerce', ... }

// Backend validates: req.user.id matches service request user_id
```

```sql
-- ❌ WRONG: Direct INSERT via Data API
-- This should be blocked or validated server-side
insert into service_requests (id, user_id, ...) values (...);
```

---

## Admin Access

### Current Implementation

Admin users are **not** automatically granted access to all data.

### Adding Admin Policies (Optional)

If you need admins to see all data:

```sql
create policy "Admins can view all service requests"
  on service_requests
  for select
  using (
    exists (
      select 1 from user_profiles
      where user_id = auth.uid()
      and 'admin' = any(roles)
    )
  );
```

**Note:** This requires:
1. `user_profiles` table with `roles` column
2. Admin role assigned in database
3. JWT contains user_id that matches admin user

---

## Troubleshooting

### Issue: "No rows returned" when authenticated

**Possible Causes:**
1. JWT `sub` claim doesn't match `user_id` in database
2. RLS policy condition is too strict
3. `auth.uid()` function not working

**Solution:**
```sql
-- Check what auth.uid() returns
select auth.uid() as current_user_id;

-- Check user_id values in table
select distinct user_id from service_requests;

-- Verify they match
```

### Issue: "Permission denied" error

**Possible Causes:**
1. RLS enabled but no policy matches
2. User doesn't have SELECT privilege
3. Public access revoked but authenticated not granted

**Solution:**
```sql
-- Check privileges
select * from information_schema.role_table_grants
where table_name = 'service_requests';

-- Grant SELECT if missing
grant select on service_requests to authenticated;
```

### Issue: "auth.uid() returns null"

**Possible Causes:**
1. JWT not properly passed to Neon Data API
2. JWT doesn't contain `sub` claim
3. Neon Auth not configured correctly

**Solution:**
- Verify JWT contains `sub` claim
- Check Neon Data API authentication headers
- Ensure Neon Auth is properly configured

---

## Next Steps

After RLS is enabled:

1. ✅ **Test with real JWT tokens** via Neon Data API
2. ✅ **Verify data isolation** works correctly
3. ✅ **Implement QR code generation** (secure with RLS)
4. ✅ **Add more tables** to RLS as needed

---

## References

- [Neon RLS Documentation](https://neon.tech/docs/security/row-level-security)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon Data API](https://neon.tech/docs/api/data-api)

