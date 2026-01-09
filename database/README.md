# Database Initialization

## Overview

This directory contains SQL scripts to initialize the Neon PostgreSQL database for the Service Request System.

## Files

- `schema.sql` - Creates all required tables and indexes
- `seed.sql` - Inserts canonical templates for each business model

## Quick Start

### 1. Set Environment Variable

```bash
export DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

Or in Windows PowerShell:
```powershell
$env:DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
```

### 2. Initialize Database

```bash
npm run db:init
```

This will:
1. Create all tables (`schema.sql`)
2. Insert canonical templates (`seed.sql`)

### 3. Verify Setup

```bash
npm run db:verify
```

This will:
1. List all tables in the database
2. Display all templates

## Available Scripts

- `npm run db:init` - Initialize database (schema + seed)
- `npm run db:schema` - Create tables only
- `npm run db:seed` - Insert templates only
- `npm run db:verify` - Verify database setup

## Manual Execution

If you prefer to run SQL files manually:

```bash
# Create tables
psql "$DATABASE_URL" -f database/schema.sql

# Insert templates
psql "$DATABASE_URL" -f database/seed.sql
```

## Database Schema

### Tables

1. **service_requests**
   - Stores service request lifecycle
   - Status: draft → submitted → reviewed → approved → rejected → activated
   - Business model: commerce, food, services, rental

2. **templates**
   - Canonical templates for each business model
   - Template IDs: COMMERCE_BASE, FOOD_BASE, SERVICES_BASE, RENTAL_BASE

3. **business_profiles**
   - Activated businesses
   - Links to service_request and template

### Canonical Templates

- `COMMERCE_BASE` → commerce model
- `FOOD_BASE` → food model
- `SERVICES_BASE` → services model
- `RENTAL_BASE` → rental model

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

If you get connection errors:
1. Verify `DATABASE_URL` is set correctly
2. Check SSL is enabled (`sslmode=require`)
3. Verify network access to Neon

### Table Already Exists

If tables already exist, the scripts use `CREATE TABLE IF NOT EXISTS`, so re-running is safe.

### Templates Already Exist

The seed script uses `ON CONFLICT DO NOTHING`, so re-running is safe.

## Security Notes

- Never commit `DATABASE_URL` to version control
- Use environment variables for all database credentials
- Rotate database passwords periodically
- Use SSL connections only (`sslmode=require`)

---

**Last Updated**: 2024-01-20  
**Author**: Senior PostgreSQL Engineer

