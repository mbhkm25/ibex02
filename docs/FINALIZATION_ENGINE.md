# Finalization Engine - Ledger Auto-Finalization

## Overview

The Finalization Engine is a secure, automated background process that converts `pending` ledger entries to `finalized` status after their finalization window expires.

**Architecture Principle**: Immutable Ledger - Only status changes, never modifies financial data.

---

## How It Works

### 1. Cron Job Schedule

- **Frequency**: Every 5 minutes
- **Endpoint**: `POST /api/cron/finalize-ledger`
- **Platform**: Vercel Cron Jobs (configured in `vercel.json`)

### 2. Finalization Criteria

An entry is eligible for finalization if:
- `status = 'pending'`
- `finalizes_at <= NOW()`

### 3. Process Flow

```
1. Verify CRON_SECRET header
2. Find eligible entries (status='pending' AND finalizes_at <= NOW())
3. Lock rows (FOR UPDATE) to prevent concurrent updates
4. Update status to 'finalized' and set finalized_at = NOW()
5. Record audit events in ledger_events table
6. Return count of finalized entries
```

### 4. What Gets Updated

**✅ Updated:**
- `status`: `'pending'` → `'finalized'`
- `finalized_at`: Set to `NOW()`

**❌ Never Modified:**
- `amount` (immutable)
- `currency` (immutable)
- `entry_type` (immutable)
- `business_id` (immutable)
- `customer_id` (immutable)
- Any other financial data

---

## Security

### Protection Mechanism

The endpoint is protected by a secret. Multiple methods are supported:

**Method 1: Header (Recommended for Manual Testing)**
```http
POST /api/cron/finalize-ledger
x-cron-secret: <CRON_SECRET>
```

**Method 2: Authorization Header (For Vercel Cron)**
```http
POST /api/cron/finalize-ledger
Authorization: Bearer <CRON_SECRET>
```

**Method 3: Query Parameter (Fallback)**
```http
POST /api/cron/finalize-ledger?secret=<CRON_SECRET>
```

**Requirements:**
- `CRON_SECRET` must be set in Vercel environment variables
- Secret must match exactly
- Unauthorized requests return `401 Unauthorized`

### Vercel Cron Configuration

Vercel Cron Jobs don't support custom headers. For production, you can:
1. Use Authorization header (if Vercel supports it)
2. Use query parameter (less secure, secret in URL)
3. Use environment variable check in code (recommended)

**Note**: The current implementation checks the secret from multiple sources for flexibility.

---

## Audit Trail

Every finalization is recorded in `ledger_events`:

```sql
INSERT INTO ledger_events (
  ledger_entry_id,
  actor_user_id,  -- NULL (automated process)
  action,         -- 'auto_finalized'
  metadata        -- JSON with details
)
```

**Metadata includes:**
- `finalized_at`: Timestamp when finalized
- `original_finalizes_at`: Scheduled finalization time
- `amount`: Entry amount
- `currency`: Entry currency
- `entry_type`: 'payment' or 'debt'
- `cron_timestamp`: When the cron job ran

---

## Database Schema

### Required Column

The `finalized_at` column must exist in `ledger_entries`:

```sql
ALTER TABLE ledger_entries
ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;
```

**Migration**: Run `npm run db:ledger-finalized-at`

### Index

For performance, an index is created:

```sql
CREATE INDEX IF NOT EXISTS idx_ledger_entries_status_finalizes_at 
ON ledger_entries(status, finalizes_at) 
WHERE status = 'pending';
```

---

## Configuration

### 1. Environment Variable

Set in Vercel Dashboard → Settings → Environment Variables:

```
CRON_SECRET = <generate-using-openssl-rand-hex-32>
```

**Generate Secret:**
```bash
openssl rand -hex 32
```

### 2. Vercel Cron Configuration

Already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/finalize-ledger",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 3. Database Migration

Run the migration to add `finalized_at` column:

```bash
npm run db:ledger-finalized-at
```

---

## Monitoring

### Success Response

```json
{
  "success": true,
  "message": "Finalized 5 ledger entries",
  "data": {
    "finalizedCount": 5,
    "timestamp": "2026-01-20T10:00:00.000Z"
  }
}
```

### Error Handling

- **401 Unauthorized**: Invalid or missing `CRON_SECRET`
- **500 Internal Server Error**: Database or transaction error

### Logs

Check Vercel Function Logs for:
- `[FinalizeLedger]` prefix
- Number of entries finalized
- Any errors or warnings

---

## Testing

### Manual Test (Local Development)

```bash
# Set CRON_SECRET in .env.local
CRON_SECRET=test-secret-123

# Call the endpoint
curl -X POST http://localhost:3000/api/cron/finalize-ledger \
  -H "x-cron-secret: test-secret-123"
```

### Verify Finalization

```sql
-- Check pending entries
SELECT id, status, finalizes_at, finalized_at
FROM ledger_entries
WHERE status = 'pending'
ORDER BY finalizes_at ASC;

-- Check finalized entries
SELECT id, status, finalized_at, created_at
FROM ledger_entries
WHERE status = 'finalized'
ORDER BY finalized_at DESC
LIMIT 10;

-- Check audit events
SELECT action, metadata, created_at
FROM ledger_events
WHERE action = 'auto_finalized'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Constraints & Guarantees

### ✅ Guaranteed

1. **Idempotency**: Safe to run multiple times (only updates eligible entries)
2. **Atomicity**: All updates in a single transaction
3. **Immutability**: Never modifies financial data (amount, currency, etc.)
4. **Audit Trail**: Every finalization is logged
5. **Concurrency Safe**: Uses `FOR UPDATE` to prevent race conditions

### ❌ Never

1. **No Triggers**: Explicit logic only (no database triggers)
2. **No Balance Calculation**: This is a status change only
3. **No DELETE**: Never deletes ledger entries
4. **No Modification**: Never modifies amounts or other immutable fields
5. **No Public Access**: Requires `CRON_SECRET` header

---

## Troubleshooting

### Problem: Cron Job Not Running

**Check:**
1. `vercel.json` exists and is valid
2. Cron job is configured in Vercel Dashboard
3. `CRON_SECRET` is set in Vercel environment variables
4. Project is deployed (cron jobs only run in production/preview)

### Problem: No Entries Finalized

**Possible Causes:**
1. No entries with `status='pending'` and `finalizes_at <= NOW()`
2. All entries already finalized
3. Finalization window hasn't expired yet

**Check:**
```sql
SELECT COUNT(*) 
FROM ledger_entries 
WHERE status = 'pending' 
  AND finalizes_at <= NOW();
```

### Problem: 401 Unauthorized

**Cause**: `CRON_SECRET` mismatch

**Solution**:
1. Verify `CRON_SECRET` in Vercel matches the header
2. Vercel automatically adds the header, so check environment variable
3. For manual testing, ensure header matches exactly

---

## Related Documentation

- `docs/LEDGER_ARCHITECTURE.md` - Overall ledger architecture
- `docs/ENV_VARIABLES.md` - Environment variables reference
- `docs/VERCEL_ENV_SETUP.md` - Vercel configuration guide

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-20  
**Status**: Active
