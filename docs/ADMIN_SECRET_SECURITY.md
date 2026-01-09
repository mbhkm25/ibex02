# Admin Secret Security (MVP)

## Overview

This document describes the **temporary MVP security implementation** using an admin secret for protecting admin-only endpoints.

**⚠️ IMPORTANT: This is NOT production-grade authentication. It is a controlled access mechanism for MVP.**

---

## Architecture

### Frontend → Backend Flow

1. **Frontend** reads `VITE_ADMIN_SECRET` from environment
2. **Frontend** sends secret in `x-admin-secret` header
3. **Backend** reads `ADMIN_SECRET` from environment
4. **Backend** validates header matches environment variable
5. **Backend** rejects request if secret is missing or invalid

### Security Model

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   Vercel     │         │   Database  │
│             │         │   Serverless │         │             │
│ Reads:      │         │   Function   │         │             │
│ VITE_       │────────▶│ Validates:   │────────▶│   Stores    │
│ ADMIN_      │ Header  │ ADMIN_SECRET │         │   Data      │
│ SECRET      │         │              │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Environment Variables

### Frontend (Vite)

```env
# .env.local (development)
VITE_ADMIN_SECRET=your-super-secret-admin-key-minimum-32-characters-long

# Vercel Environment Variables (production)
VITE_ADMIN_SECRET=your-production-secret-different-from-dev
```

### Backend (Vercel Serverless)

```env
# Vercel Environment Variables
ADMIN_SECRET=your-super-secret-admin-key-minimum-32-characters-long
```

**⚠️ Security Requirements:**
- Minimum 32 characters
- Random and unpredictable
- Different for each environment (dev/staging/prod)
- Never committed to version control
- Rotated periodically

---

## Implementation

### Frontend (`src/app/config/adminConfig.ts`)

```typescript
export function getAdminSecret(): string {
  const secret = import.meta.env.VITE_ADMIN_SECRET;
  
  if (!secret) {
    throw new Error('VITE_ADMIN_SECRET is not configured');
  }
  
  return secret;
}
```

### Frontend API Client (`src/app/api/adminServiceRequests.ts`)

```typescript
const adminSecret = getAdminSecret();

const response = await fetch('/api/admin/activate-service-request', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-admin-secret': adminSecret,
  },
  body: JSON.stringify({ serviceRequestId }),
});
```

### Backend Endpoint (`api/admin/activate-service-request.ts`)

```typescript
function validateAdminSecret(req: VercelRequest): boolean {
  const expectedSecret = process.env.ADMIN_SECRET;
  
  if (!expectedSecret) {
    return false; // Reject all if not configured
  }
  
  const providedSecret = req.headers['x-admin-secret'];
  return providedSecret === expectedSecret;
}

export default async function handler(req, res) {
  // Validate admin secret FIRST (before any business logic)
  if (!validateAdminSecret(req)) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Admin authentication required'
    });
  }
  
  // ... rest of business logic
}
```

---

## Security Guarantees

### ✅ What This Protects

1. **Unauthorized Activation**: Only requests with valid secret can activate businesses
2. **Direct API Access**: Prevents direct API calls without secret
3. **Simple Attacks**: Blocks casual attackers and automated scanners

### ❌ What This Does NOT Protect

1. **Secret Leakage**: If secret is exposed, anyone can use it
2. **Replay Attacks**: Secret can be reused (no expiration)
3. **User-Level Auth**: Does not identify which admin performed action
4. **Audit Trail**: Limited audit capability (no user identity)
5. **Rate Limiting**: Does not prevent brute force (should be added)

---

## Guard Rails

### Backend Validation

```typescript
// 1. Secret must be configured
if (!process.env.ADMIN_SECRET) {
  console.error('[Security] ADMIN_SECRET not configured');
  return false;
}

// 2. Secret must be provided
if (!req.headers['x-admin-secret']) {
  console.warn('[Security] Missing admin secret header');
  return false;
}

// 3. Secret must match
if (providedSecret !== expectedSecret) {
  console.warn('[Security] Invalid admin secret');
  return false;
}
```

### Frontend Validation

```typescript
// 1. Secret must be configured
if (!import.meta.env.VITE_ADMIN_SECRET) {
  throw new Error('VITE_ADMIN_SECRET not configured');
}

// 2. Secret must be sent
headers: {
  'x-admin-secret': adminSecret,
}
```

---

## Error Handling

### Missing Secret (Frontend)

```typescript
// Development: Warning only
if (import.meta.env.DEV) {
  console.warn('VITE_ADMIN_SECRET not set');
  return '';
}

// Production: Critical error
throw new Error('VITE_ADMIN_SECRET is not configured');
```

### Missing Secret (Backend)

```typescript
if (!process.env.ADMIN_SECRET) {
  console.error('[Security] ADMIN_SECRET not configured');
  return res.status(500).json({
    error: 'CONFIGURATION_ERROR',
    message: 'Admin authentication is not properly configured'
  });
}
```

### Invalid Secret

```typescript
return res.status(401).json({
  error: 'UNAUTHORIZED',
  message: 'Admin authentication required. Invalid or missing admin secret.'
});
```

---

## Logging

### Failed Attempts

All failed authentication attempts are logged:

```typescript
console.warn('[Security] Admin activation attempt without x-admin-secret header');
console.warn('[Security] Admin activation attempt with invalid secret');
console.error('[Security] Unauthorized activation attempt blocked');
```

### Successful Activations

Successful activations are logged in database (`activation_logs` table).

---

## Migration Path

### Current (MVP)

```
Frontend → x-admin-secret header → Backend validation
```

### Future (Production)

```
Frontend → JWT Token → Backend validation → Role check → Action
```

### Steps for Migration

1. **Implement JWT Authentication**
   - User login returns JWT token
   - Token includes user ID and roles
   - Token has expiration

2. **Replace Header-Based Auth**
   - Remove `x-admin-secret` header
   - Use `Authorization: Bearer <token>` header
   - Validate JWT signature and expiration

3. **Add Role-Based Access Control**
   - Check user role in token
   - Verify user has `admin` role
   - Log user ID in audit trail

4. **Update Frontend**
   - Store JWT token in secure storage
   - Send token in Authorization header
   - Handle token expiration and refresh

---

## Best Practices

### Secret Management

1. **Generate Strong Secrets**
   ```bash
   # Generate 32-character random secret
   openssl rand -hex 32
   ```

2. **Environment-Specific Secrets**
   - Different secret for dev/staging/prod
   - Never reuse secrets across environments

3. **Secret Rotation**
   - Rotate secrets every 90 days
   - Update both frontend and backend simultaneously

4. **Access Control**
   - Limit who can view environment variables
   - Use Vercel's environment variable access controls

### Monitoring

1. **Failed Attempts**
   - Monitor logs for failed authentication attempts
   - Alert on suspicious patterns

2. **Success Rate**
   - Track successful vs failed activations
   - Monitor for anomalies

---

## Testing

### Local Development

1. **Set Environment Variable**
   ```bash
   # .env.local
   VITE_ADMIN_SECRET=dev-secret-key-here
   ```

2. **Test Valid Secret**
   ```bash
   curl -X POST http://localhost:3000/api/admin/activate-service-request \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: dev-secret-key-here" \
     -d '{"serviceRequestId": "test-id"}'
   ```

3. **Test Invalid Secret**
   ```bash
   curl -X POST http://localhost:3000/api/admin/activate-service-request \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: wrong-secret" \
     -d '{"serviceRequestId": "test-id"}'
   # Expected: 401 Unauthorized
   ```

4. **Test Missing Secret**
   ```bash
   curl -X POST http://localhost:3000/api/admin/activate-service-request \
     -H "Content-Type: application/json" \
     -d '{"serviceRequestId": "test-id"}'
   # Expected: 401 Unauthorized
   ```

---

## TODO: Future Improvements

- [ ] Replace ADMIN_SECRET with JWT authentication
- [ ] Implement role-based access control (RBAC)
- [ ] Add session management
- [ ] Implement token expiration and refresh
- [ ] Add rate limiting for authentication attempts
- [ ] Add audit trail with user identity
- [ ] Implement multi-factor authentication (MFA)
- [ ] Add IP whitelisting for admin endpoints
- [ ] Implement request signing for additional security

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-20  
**Author**: Security-conscious SaaS Engineer  
**Status**: MVP Implementation (Temporary)

