# QR Code Generation API

## Overview

This document describes the secure serverless endpoint for generating QR codes.

**Core Principle:**
- Data API = Read
- Serverless = Decide & Write
- DB = Authority
- QR generation is a privileged operation

---

## Endpoint

### POST /api/qr/generate

Generate a new QR code for an entity (product, service, business, payment, customer).

---

## Request

### Headers

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Body

```json
{
  "entity_type": "business | product | service | payment | customer",
  "entity_id": "uuid",
  "business_id": "uuid"
}
```

### Parameters

- **entity_type** (required): Type of entity the QR code points to
  - Valid values: `business`, `product`, `service`, `payment`, `customer`
- **entity_id** (required): UUID of the entity
- **business_id** (required): UUID of the business that owns this QR code

---

## Response

### Success (201 Created)

```json
{
  "success": true,
  "data": {
    "qr_id": "uuid",
    "qr_url": "https://<app-domain>/q/<qr_id>",
    "entity_type": "product",
    "entity_id": "uuid",
    "business_id": "uuid",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

### QR Code Already Exists (200 OK)

If a QR code already exists for the entity, returns existing QR code:

```json
{
  "success": true,
  "data": {
    "qr_id": "uuid",
    "qr_url": "https://<app-domain>/q/<qr_id>",
    "message": "QR code already exists for this entity"
  }
}
```

### Error Responses

#### 401 Unauthorized

```json
{
  "error": "UNAUTHORIZED",
  "message": "Authentication required. Please log in."
}
```

#### 403 Forbidden

```json
{
  "error": "FORBIDDEN",
  "message": "You do not own this business. Cannot generate QR code."
}
```

#### 400 Bad Request

```json
{
  "error": "VALIDATION_ERROR",
  "message": "entity_type is required"
}
```

#### 500 Internal Server Error

```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred while generating QR code"
}
```

---

## Security

### Authentication

- Requires valid JWT token in `Authorization` header
- JWT is verified using Neon Auth JWKS
- User ID is extracted from JWT `sub` claim

### Authorization

- Verifies business ownership: `business.owner_id === user_id`
- Rejects requests if user doesn't own the business (403)

### Input Validation

- Validates `entity_type` is one of allowed values
- Validates `entity_id` and `business_id` are valid UUIDs
- Rejects invalid input (400)

### Database Security

- Uses parameterized SQL queries (SQL injection protection)
- All operations in SQL transaction
- RLS policies enforce data isolation

---

## Usage Examples

### Generate QR Code for Product

```typescript
const response = await fetch('/api/qr/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    entity_type: 'product',
    entity_id: '123e4567-e89b-12d3-a456-426614174000',
    business_id: '11111111-1111-1111-1111-111111111111',
  }),
});

const result = await response.json();
// { success: true, data: { qr_id: '...', qr_url: '...' } }
```

### Generate QR Code for Business

```typescript
const response = await fetch('/api/qr/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    entity_type: 'business',
    entity_id: '11111111-1111-1111-1111-111111111111',
    business_id: '11111111-1111-1111-1111-111111111111',
  }),
});

const result = await response.json();
```

### Generate QR Code for Payment

```typescript
const response = await fetch('/api/qr/generate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    entity_type: 'payment',
    entity_id: 'payment-123',
    business_id: '11111111-1111-1111-1111-111111111111',
  }),
});

const result = await response.json();
```

---

## Flow Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │         │   Serverless │         │  PostgreSQL │
│             │         │   Function   │         │             │
│ 1. POST     │────────▶│ 2. Verify    │────────▶│ 3. Check    │
│    Request  │ JWT     │    JWT       │         │    Business │
│             │         │              │         │    Ownership │
│             │         │              │         │             │
│ 4. Verify   │◀────────│ 5. Check    │◀────────│ 6. Return   │
│    Business │         │    Ownership │         │    Business │
│             │         │              │         │             │
│ 7. Insert   │────────▶│ 8. Insert    │────────▶│ 9. Create   │
│    QR Code  │         │    QR Code   │         │    QR Code  │
│             │         │              │         │             │
│ 10. Return  │◀────────│ 11. Return  │◀────────│ 12. Return   │
│     QR URL  │         │     QR Data  │         │     QR ID   │
└─────────────┘         └──────────────┘         └─────────────┘
```

---

## Error Handling

### 401 Unauthorized

**Cause:** Missing or invalid JWT token

**Solution:** Ensure JWT token is included in `Authorization` header and is not expired

### 403 Forbidden

**Cause:** User doesn't own the business

**Solution:** Verify `business_id` belongs to the authenticated user

### 400 Bad Request

**Cause:** Invalid input (missing fields, invalid entity_type, invalid UUID format)

**Solution:** Check request body matches required format

### 500 Internal Server Error

**Cause:** Database error or unexpected exception

**Solution:** Check server logs, verify database connection

---

## Guard Rails

### ✅ Enforced

- ✅ Requires valid JWT authentication
- ✅ Verifies business ownership
- ✅ Validates input format
- ✅ Uses parameterized SQL
- ✅ Prevents duplicate QR codes (returns existing if found)
- ✅ All operations in transaction

### ❌ Not Allowed

- ❌ No batch inserts
- ❌ No frontend ID trust (all IDs validated)
- ❌ No direct database access (must go through endpoint)
- ❌ No unauthenticated requests
- ❌ No cross-business QR generation

---

## Database Operations

### Insert Query

```sql
INSERT INTO qr_codes (
  entity_type,
  entity_id,
  business_id,
  is_active
) VALUES ($1, $2, $3, $4)
RETURNING id, entity_type, entity_id, business_id, created_at
```

### Ownership Verification Query

```sql
SELECT id, owner_id, business_model, template_id 
FROM business_profiles 
WHERE id = $1 AND owner_id = $2
```

### Duplicate Check Query

```sql
SELECT id FROM qr_codes 
WHERE entity_type = $1 
AND entity_id = $2 
AND business_id = $3 
AND is_active = true
```

---

## Next Steps

After QR code generation:

1. ✅ **QR code is stored in database** with unique ID
2. ✅ **QR URL is returned** to frontend
3. ⏳ **Frontend generates QR image** using QR URL
4. ⏳ **QR code can be scanned** to access entity
5. ⏳ **QR code scanning endpoint** (GET /q/:qr_id)

---

## Testing

### Manual Testing

```bash
# Test with curl
curl -X POST https://your-domain.com/api/qr/generate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_type": "product",
    "entity_id": "123e4567-e89b-12d3-a456-426614174000",
    "business_id": "11111111-1111-1111-1111-111111111111"
  }'
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "qr_id": "new-uuid",
    "qr_url": "https://your-domain.com/q/new-uuid",
    "entity_type": "product",
    "entity_id": "123e4567-e89b-12d3-a456-426614174000",
    "business_id": "11111111-1111-1111-1111-111111111111",
    "created_at": "2024-01-20T10:30:00Z"
  }
}
```

---

## References

- [Neon Auth JWT Verification](../docs/NEON_AUTH_INTEGRATION.md)
- [QR Codes Database Setup](../docs/QR_CODES_DATABASE_SETUP.md)
- [RLS Security Setup](../docs/RLS_SECURITY_SETUP.md)

