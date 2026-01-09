# Serverless Backend Implementation

## Overview

This document describes the serverless backend implementation using **Vercel Serverless Functions** and **Neon PostgreSQL**.

**Architecture Principle**: Frontend captures intent, Backend enforces authority, Database stores truth.

---

## Technology Stack

- **Runtime**: Vercel Serverless Functions (Node.js)
- **Database**: Neon PostgreSQL
- **Connection**: `pg` library with connection pooling
- **Type Safety**: TypeScript

---

## Directory Structure

```
/api
  ├── _db.ts                          # Database connection utility
  └── admin/
      └── activate-service-request.ts  # Business activation endpoint
```

**Note**: Vercel automatically treats files in `/api` as serverless functions.

---

## Database Connection (`/api/_db.ts`)

### Features

- **Connection Pooling**: Reuses connections across function invocations
- **SSL Required**: Neon requires SSL connections
- **Lazy Initialization**: Pool created on first use (not at module load)
- **Transaction Support**: Helper functions for atomic operations

### Usage

```typescript
import { query, transaction } from '../_db';

// Simple query
const result = await query('SELECT * FROM service_requests WHERE id = $1', [id]);

// Transaction
await transaction(async (client) => {
  await client.query('BEGIN');
  // ... multiple queries ...
  await client.query('COMMIT');
});
```

### Environment Variable

```env
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**Security**: Set in Vercel dashboard, never commit to version control.

---

## Activation Endpoint (`/api/admin/activate-service-request.ts`)

### Endpoint

```
POST /api/admin/activate-service-request
```

### Request Body

```json
{
  "serviceRequestId": "uuid"
}
```

### Responsibilities

1. **Validate Request State**
   - Request exists
   - Status is `approved`
   - `businessModel` is present
   - Not already activated

2. **Resolve Template** (Deterministic)
   - `commerce` → `commerce-base-v1`
   - `food` → `food-base-v1`
   - `services` → `services-base-v1`
   - `rental` → `rental-base-v1`

3. **Create Business Profile**
   - Generate business number
   - Create slug from business name
   - Initialize default settings from template

4. **Create Template Instance**
   - Link to business profile
   - Copy template configuration
   - Set default customizations

5. **Update Service Request**
   - Set status to `activated`
   - Set `activated_at` timestamp
   - Link to business profile

6. **Audit Trail**
   - Log activation in `activation_logs` table

### Response

```json
{
  "success": true,
  "data": {
    "businessProfile": { ... },
    "templateInstance": { ... },
    "activationDate": "2024-01-20T10:00:00Z"
  }
}
```

### Error Responses

- `400`: Validation errors (invalid status, missing businessModel, etc.)
- `404`: Service request not found
- `500`: Internal server error

---

## Guard Rails

### Validation Rules

1. **Cannot activate without `businessModel`**
   ```typescript
   if (!serviceRequest.business_model) {
     throw new Error('MISSING_BUSINESS_MODEL');
   }
   ```

2. **Cannot activate if not approved**
   ```typescript
   if (serviceRequest.status !== 'approved') {
     throw new Error('INVALID_STATUS');
   }
   ```

3. **Cannot activate twice**
   ```typescript
   if (serviceRequest.status === 'activated') {
     throw new Error('ALREADY_ACTIVATED');
   }
   ```

### Transaction Safety

All database operations run in a single transaction:

```typescript
await transaction(async (client) => {
  // 1. Fetch service request
  // 2. Validate prerequisites
  // 3. Create business profile
  // 4. Create template instance
  // 5. Update service request
  // 6. Log activation
});
```

If any step fails, all changes are rolled back.

---

## Frontend Integration

### API Client (`src/app/api/adminServiceRequests.ts`)

```typescript
export async function activateBusinessFromRequest(
  requestId: string,
  payload?: ActivateBusinessPayload
): Promise<ActivationResult> {
  const response = await fetch('/api/admin/activate-service-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ serviceRequestId: requestId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  return response.json();
}
```

### Component Usage (`AdminServiceRequests.tsx`)

```typescript
const handleActivate = async (request: ServiceRequest) => {
  if (!canAdminActivate(request.status)) {
    toast.error('Cannot activate in current state');
    return;
  }

  try {
    const result = await activateBusinessFromRequest(request.id);
    toast.success(`Business "${result.businessProfile.name}" activated!`);
  } catch (error) {
    toast.error(error.message);
  }
};
```

---

## Database Schema

See `docs/DATABASE_SCHEMA.md` for complete schema definition.

### Key Tables

- `service_requests`: Service request lifecycle
- `business_profiles`: Activated businesses
- `template_instances`: Template configurations
- `activation_logs`: Audit trail

---

## Security Considerations

### 1. Input Validation

All inputs are validated before database operations:

```typescript
if (!serviceRequestId) {
  return res.status(400).json({ error: 'VALIDATION_ERROR' });
}
```

### 2. Parameterized Queries

All queries use parameterized placeholders to prevent SQL injection:

```typescript
await query('SELECT * FROM service_requests WHERE id = $1', [id]);
```

### 3. Environment Variables

Database credentials stored in Vercel environment variables, never in code.

### 4. Admin-Only Access

Activation endpoint should be protected by authentication middleware (to be implemented).

---

## Deployment

### Vercel Configuration

1. **Set Environment Variable**:
   ```
   DATABASE_URL=postgresql://user:pass@host.neon.tech/db?sslmode=require
   ```

2. **Install Dependencies**:
   ```bash
   npm install pg @vercel/node
   ```

3. **Deploy**:
   ```bash
   vercel deploy
   ```

Vercel automatically:
- Detects `/api` directory
- Creates serverless functions
- Handles routing
- Manages cold starts

---

## Testing

### Local Development

1. **Set up Neon database**
2. **Set `DATABASE_URL` in `.env.local`**
3. **Run Vercel dev server**:
   ```bash
   vercel dev
   ```

### Testing Endpoint

```bash
curl -X POST http://localhost:3000/api/admin/activate-service-request \
  -H "Content-Type: application/json" \
  -d '{"serviceRequestId": "uuid-here"}'
```

---

## Error Handling

### Known Errors

- `SERVICE_REQUEST_NOT_FOUND`: Request doesn't exist
- `INVALID_STATUS`: Request not in `approved` state
- `ALREADY_ACTIVATED`: Request already activated
- `MISSING_BUSINESS_MODEL`: Business model not set
- `INVALID_BUSINESS_MODEL`: Unknown business model

### Error Response Format

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable error message"
}
```

---

## Future Enhancements

1. **Authentication Middleware**: Protect admin endpoints
2. **Rate Limiting**: Prevent abuse
3. **Caching**: Cache template registry
4. **Monitoring**: Add logging and metrics
5. **Retry Logic**: Handle transient database errors
6. **Migration Tool**: Version-controlled schema changes

---

## Architecture Decisions

### Why Serverless Functions?

- **Scalability**: Auto-scales with traffic
- **Cost**: Pay per invocation
- **Simplicity**: No server management
- **Integration**: Native Vercel integration

### Why Neon PostgreSQL?

- **Serverless**: Scales automatically
- **Branching**: Database branches for testing
- **Performance**: Low latency
- **Compatibility**: Standard PostgreSQL

### Why Connection Pooling?

- **Performance**: Reuses connections
- **Efficiency**: Reduces connection overhead
- **Reliability**: Handles connection errors

### Why Transactions?

- **Atomicity**: All-or-nothing operations
- **Consistency**: Database stays consistent
- **Reliability**: Rollback on errors

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-20  
**Author**: Senior Serverless Architect + PostgreSQL Engineer

