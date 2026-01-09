# Neon Auth Integration

## Overview

This document describes the Neon Auth integration that replaces mock/manual authentication with production-grade OIDC-compatible authentication.

**Core Principle:**
- Neon Auth = Identity Authority
- JWT = Proof of Identity
- API = Gatekeeper
- Database = Truth

---

## Architecture

### Frontend → Backend Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   Vercel     │         │  Neon Auth  │
│             │         │   Serverless │         │             │
│ 1. Login    │────────▶│ 2. Verify    │────────▶│ 3. Issue    │
│    Request  │         │    JWT       │         │    JWT      │
│             │         │              │         │             │
│ 4. Store    │◀────────│ 5. Return    │◀────────│ 6. Validate │
│    Token    │         │    User      │         │    User     │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Authentication Flow

1. **User Login/Register**
   - Frontend calls Neon Auth endpoints
   - Receives JWT access token + refresh token
   - Stores tokens in sessionStorage

2. **API Request**
   - Frontend includes JWT in `Authorization: Bearer <token>` header
   - Backend verifies JWT using JWKS from Neon Auth
   - Backend extracts user_id from `sub` claim
   - Backend checks roles for authorization

3. **Token Refresh**
   - Frontend detects token expiration
   - Uses refresh token to get new access token
   - Updates stored tokens

---

## Configuration

### Neon Auth Endpoints

- **Issuer:** `https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth`
- **JWKS:** `https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/.well-known/jwks.json`

### Environment Variables

No additional environment variables required. The issuer and JWKS URLs are hardcoded in the auth service.

---

## Frontend Implementation

### Auth Service (`src/app/services/auth.ts`)

**Functions:**
- `login(email, password)` - Authenticate with Neon Auth
- `register(email, password, phone?)` - Register new user
- `logout()` - Clear stored tokens
- `getAccessToken()` - Get current access token
- `getCurrentUser()` - Get user info from JWT (UI only, not trusted)
- `isAuthenticated()` - Check if user is logged in
- `isAdmin()` - Check if user has admin role (UI only)
- `getAuthHeader()` - Get Authorization header for API requests
- `refreshAccessToken()` - Refresh expired token

**Token Storage:**
- Tokens stored in `sessionStorage` (cleared on tab close)
- Keys: `neon_auth_access_token`, `neon_auth_refresh_token`, `neon_auth_expires_at`

**Security Notes:**
- JWT payload is decoded for UI display only
- Never trust client-side claims for security
- Always verify JWT on backend

---

## Backend Implementation

### Auth Middleware (`api/_auth.ts`)

**Functions:**
- `verifyToken(token)` - Verify JWT signature using JWKS
- `requireAuth(req)` - Require authentication, return user
- `requireAdmin(req)` - Require admin role, return user

**JWT Verification:**
1. Extract token from `Authorization: Bearer <token>` header
2. Fetch public key from JWKS endpoint
3. Verify signature using RS256 algorithm
4. Validate issuer matches Neon Auth
5. Validate expiration
6. Extract user_id from `sub` claim
7. Extract roles from `roles` claim

**Error Handling:**
- Missing token → `401 UNAUTHORIZED`
- Invalid token → `401 UNAUTHORIZED`
- Expired token → `401 UNAUTHORIZED`
- Missing admin role → `403 FORBIDDEN`

---

## Database Integration

### User Profiles Table

```sql
create table user_profiles (
  id uuid primary key,
  user_id text not null unique, -- Neon Auth user ID (JWT 'sub')
  email text,
  phone text,
  roles text[] default array[]::text[],
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### Foreign Key Relationships

- `service_requests.user_id` → `user_profiles.user_id`
- `business_profiles.owner_id` → `user_profiles.user_id`

### Migration

Run migration script:
```bash
psql "$DATABASE_URL" -f database/migration_add_user_profiles.sql
```

---

## API Endpoint Updates

### Admin Activation Endpoint

**Before (Admin Secret):**
```typescript
// Validate admin secret
if (!validateAdminSecret(req)) {
  return res.status(401).json({ error: 'UNAUTHORIZED' });
}
```

**After (JWT):**
```typescript
// Validate JWT and admin role
const adminUser = await requireAdmin(req);
// adminUser.id, adminUser.roles available
```

**Backward Compatibility:**
- Legacy admin secret still supported during migration
- Will be removed once all clients are updated

---

## Role-Based Access Control

### Roles

- `admin` - Full system access
- `merchant` - Business management access
- `customer` - Customer-facing features

### Role Assignment

Roles are stored in:
1. JWT token `roles` claim (from Neon Auth)
2. `user_profiles.roles` array (database)

**Priority:** JWT roles take precedence. Database roles are for additional metadata.

### Admin Access

Admin access is determined by:
1. JWT token contains `roles: ['admin']`
2. Backend verifies using `requireAdmin(req)`
3. Frontend checks using `isAdmin()` (UI only, not trusted)

---

## Migration from Admin Secret

### Step 1: Frontend ✅
- ✅ Created auth service with Neon Auth integration
- ✅ Updated API client to use JWT tokens
- ✅ Removed admin secret from API calls

### Step 2: Backend ✅
- ✅ Created JWT verification middleware
- ✅ Updated admin endpoints to use `requireAdmin()`
- ⚠️ Legacy admin secret still supported

### Step 3: Database ✅
- ✅ Created `user_profiles` table migration
- ✅ Added `user_id` to `service_requests`
- ✅ Added `owner_id` to `business_profiles`

### Step 4: Frontend Components (In Progress)
- ⏳ Update LoginScreen to use Neon Auth
- ⏳ Update AdminLogin to use Neon Auth
- ⏳ Add auth state management

---

## Security Rules

### ✅ DO

- ✅ Verify JWT on every API request
- ✅ Use JWKS for public key verification
- ✅ Validate issuer matches Neon Auth
- ✅ Check expiration on every request
- ✅ Extract user_id from `sub` claim
- ✅ Store tokens securely (sessionStorage)
- ✅ Clear tokens on logout

### ❌ DON'T

- ❌ Never trust client-side claims
- ❌ Never store passwords
- ❌ Never hardcode tokens
- ❌ Never skip JWT verification
- ❌ Never use expired tokens
- ❌ Never trust roles from client

---

## Testing

### Manual Testing

1. **Login Flow:**
   ```typescript
   import { login } from './services/auth';
   const tokens = await login('user@example.com', 'password');
   ```

2. **API Request:**
   ```typescript
   import { getAuthHeader } from './services/auth';
   const headers = getAuthHeader();
   fetch('/api/endpoint', { headers });
   ```

3. **Backend Verification:**
   ```typescript
   import { requireAuth } from './_auth';
   const user = await requireAuth(req);
   console.log(user.id, user.roles);
   ```

---

## Troubleshooting

### "JWT verification failed"

- Check token is not expired
- Verify issuer matches Neon Auth
- Ensure JWKS endpoint is accessible
- Check token format: `Bearer <token>`

### "Admin role required"

- Verify JWT contains `roles: ['admin']`
- Check `user_profiles.roles` in database
- Ensure token is not expired

### "UNAUTHORIZED: Missing Authorization header"

- Ensure frontend sends `Authorization: Bearer <token>`
- Check token is stored in sessionStorage
- Verify token is not expired

---

## Future Improvements

- [ ] Add token refresh automation
- [ ] Add session management
- [ ] Add multi-factor authentication
- [ ] Add OAuth providers (Google, Apple)
- [ ] Add password reset flow
- [ ] Add email verification
- [ ] Remove legacy admin secret support

---

## References

- [Neon Auth Documentation](https://neon.tech/docs/auth)
- [OIDC Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [JWT Specification](https://tools.ietf.org/html/rfc7519)
- [JWKS Specification](https://tools.ietf.org/html/rfc7517)

