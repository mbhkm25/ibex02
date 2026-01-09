# Database Initialization Guide

## Quick Start

### 1. Set Database URL

**Windows PowerShell:**
```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

**Linux/Mac:**
```bash
export DATABASE_URL="postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
```

### 2. Initialize Database

```bash
npm run db:init
```

This will:
- Create all tables (`service_requests`, `templates`, `business_profiles`)
- Insert 4 canonical templates
- Create indexes for performance

### 3. Verify Setup

```bash
npm run db:verify
```

Expected output:
- 3 tables: `service_requests`, `templates`, `business_profiles`
- 4 templates: `COMMERCE_BASE`, `FOOD_BASE`, `SERVICES_BASE`, `RENTAL_BASE`

## Manual Execution

If npm scripts don't work, run SQL files directly:

```bash
# Create tables
psql "$DATABASE_URL" -f database/schema.sql

# Insert templates
psql "$DATABASE_URL" -f database/seed.sql

# Verify
psql "$DATABASE_URL" -f database/test-connection.sql
```

## Schema Overview

### Tables

1. **service_requests**
   - `id` (uuid, primary key)
   - `status` (text, check: draft/submitted/reviewed/approved/rejected/activated)
   - `business_model` (text, check: commerce/food/services/rental)
   - `business_name` (text, not null)
   - `description` (text)
   - `rejection_reason` (text)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

2. **templates**
   - `id` (text, primary key)
   - `business_model` (text, not null)
   - `config` (jsonb, not null)
   - `created_at` (timestamptz)

3. **business_profiles**
   - `id` (uuid, primary key)
   - `service_request_id` (uuid, foreign key → service_requests.id)
   - `business_model` (text, not null)
   - `template_id` (text, foreign key → templates.id)
   - `created_at` (timestamptz)

### Canonical Templates

| Template ID | Business Model | Features |
|------------|----------------|----------|
| COMMERCE_BASE | commerce | inventory, sales, debts |
| FOOD_BASE | food | menu, orders |
| SERVICES_BASE | services | appointments, clients |
| RENTAL_BASE | rental | contracts, availability |

## Verification Queries

### List all tables
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### View all templates
```sql
SELECT * FROM templates;
```

### Check service requests
```sql
SELECT id, status, business_model, business_name 
FROM service_requests;
```

### Check business profiles
```sql
SELECT id, service_request_id, business_model, template_id 
FROM business_profiles;
```

## Troubleshooting

### Connection Issues

**Error: "connection refused"**
- Verify `DATABASE_URL` is set correctly
- Check network access to Neon
- Ensure SSL is enabled (`sslmode=require`)

**Error: "authentication failed"**
- Verify credentials in `DATABASE_URL`
- Check if password contains special characters (may need URL encoding)

### Table Already Exists

The schema uses `CREATE TABLE IF NOT EXISTS`, so re-running is safe.

### Templates Already Exist

The seed script uses `ON CONFLICT DO NOTHING`, so re-running is safe.

### psql Not Found

Install PostgreSQL client tools:
- **Windows**: Install PostgreSQL from postgresql.org
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql-client`

## Next Steps

After initialization:

1. **Set Environment Variables in Vercel:**
   ```
   DATABASE_URL=postgresql://...
   ADMIN_SECRET=your-admin-secret
   ```

2. **Test API Endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/activate-service-request \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: your-secret" \
     -d '{"serviceRequestId": "test-id"}'
   ```

3. **Verify Database Connection:**
   - Check serverless function logs
   - Verify queries execute successfully

---

**Last Updated**: 2024-01-20  
**Author**: Senior PostgreSQL Engineer

