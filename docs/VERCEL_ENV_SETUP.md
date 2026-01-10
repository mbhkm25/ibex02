# Vercel Environment Variables Setup

## Overview

This document explains how to configure environment variables in Vercel for production deployment.

**Architecture:**
- **Frontend (Vite)**: Variables prefixed with `VITE_` are exposed to the browser
- **Backend (Serverless)**: All variables are server-side only

---

## Required Environment Variables

### 1. Frontend Variables (VITE_ prefix)

These variables are bundled into the frontend code and exposed to the browser.

#### `VITE_ADMIN_SECRET`
- **Purpose**: Admin secret for MVP authentication
- **Type**: String (minimum 32 characters)
- **Security**: ⚠️ Exposed to browser - use with caution
- **Generate**: `openssl rand -hex 32`

### 2. Backend Variables (Serverless Functions)

These variables are only available in serverless functions, never exposed to the browser.

#### `ADMIN_SECRET`
- **Purpose**: Admin secret for backend authentication
- **Type**: String (minimum 32 characters)
- **Security**: ✅ Server-side only
- **Important**: Must match `VITE_ADMIN_SECRET` for MVP
- **Generate**: `openssl rand -hex 32`

#### `DATABASE_URL`
- **Purpose**: Neon PostgreSQL connection string
- **Type**: PostgreSQL connection URI
- **Security**: ✅ Server-side only
- **Format**: `postgresql://user:password@host/db?sslmode=require`
- **Note**: Never expose this to the frontend

#### `R2_ACCOUNT_ID`
- **Purpose**: Cloudflare R2 Account ID
- **Type**: String
- **Security**: ✅ Server-side only
- **Where to find**: Cloudflare Dashboard → R2 → Account ID

#### `R2_ACCESS_KEY_ID`
- **Purpose**: Cloudflare R2 API Access Key ID
- **Type**: String
- **Security**: ✅ Server-side only
- **Where to find**: Cloudflare Dashboard → R2 → Manage R2 API Tokens

#### `R2_SECRET_ACCESS_KEY`
- **Purpose**: Cloudflare R2 API Secret Access Key
- **Type**: String
- **Security**: ✅ Server-side only (highly sensitive)
- **Where to find**: Cloudflare Dashboard → R2 → Manage R2 API Tokens
- **Note**: Store securely, never expose

#### `R2_BUCKET_NAME`
- **Purpose**: Cloudflare R2 bucket name
- **Type**: String
- **Security**: ✅ Server-side only
- **Default**: `assets`
- **Where to find**: Cloudflare Dashboard → R2 → Your bucket name

---

## Setup Instructions

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add the following variables:

#### For All Environments (Production, Preview, Development)

```
VITE_ADMIN_SECRET = <your-generated-secret>
ADMIN_SECRET = <same-secret-as-above>
DATABASE_URL = postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
R2_ACCOUNT_ID = <your-r2-account-id>
R2_ACCESS_KEY_ID = <your-r2-access-key-id>
R2_SECRET_ACCESS_KEY = <your-r2-secret-access-key>
R2_BUCKET_NAME = assets
```

**Important Notes:**
- `VITE_ADMIN_SECRET` and `ADMIN_SECRET` must be **the same value**
- Use different secrets for Production, Preview, and Development
- Never use production secrets in development

### Step 3: Generate Strong Secrets

For each environment, generate a unique secret:

```bash
# Generate a 32-byte (64 hex characters) random secret
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Step 4: Set Environment-Specific Values

**Production:**
- Use the strongest, most secure secrets
- Rotate secrets periodically (every 90 days)
- Never share production secrets

**Preview:**
- Use different secrets from production
- Can be less secure (for testing)

**Development:**
- Use different secrets from production/preview
- Can match local `.env.local` for consistency

---

## Variable Matching Rules

### Critical: VITE_ADMIN_SECRET = ADMIN_SECRET

For MVP authentication to work, these must match:

```
VITE_ADMIN_SECRET = "your-secret-here"
ADMIN_SECRET = "your-secret-here"  ← Must be identical
```

**Why?**
- Frontend sends `VITE_ADMIN_SECRET` in `x-admin-secret` header
- Backend validates against `ADMIN_SECRET`
- If they don't match, all admin requests will fail with 401 Unauthorized

---

## Security Best Practices

### ✅ DO

- Use different secrets for each environment
- Rotate secrets periodically
- Use strong, random secrets (minimum 32 characters)
- Store secrets only in Vercel environment variables
- Use Vercel's environment variable encryption

### ❌ DON'T

- Never commit secrets to version control
- Never hardcode secrets in code
- Never share secrets in screenshots or documentation
- Never use production secrets in development
- Never expose `DATABASE_URL` to the frontend

---

## Verification Checklist

After setting up environment variables, verify:

### Local Development
- [ ] `.env.local` exists locally (create from `docs/ENV_SETUP.md`)
- [ ] `.env.local` is gitignored (check `.gitignore` - should already be there)
- [ ] `VITE_ADMIN_SECRET` and `ADMIN_SECRET` match in `.env.local`
- [ ] `DATABASE_URL` is set in `.env.local`
- [ ] Secrets are strong (minimum 32 characters, generated with `openssl rand -hex 32`)

### Vercel Production
- [ ] All variables added to Vercel → Settings → Environment Variables
- [ ] `VITE_ADMIN_SECRET` and `ADMIN_SECRET` match in Vercel
- [ ] `DATABASE_URL` is set in Vercel (backend only)
- [ ] Variables set for correct environments (Production/Preview/Development)
- [ ] Project redeployed after adding variables
- [ ] Test admin activation endpoint works
- [ ] Database connection works from serverless functions

---

## Testing After Setup

### 1. Test Frontend Secret

```bash
# In browser console
console.log(import.meta.env.VITE_ADMIN_SECRET)
# Should show your secret (this is expected for MVP)
```

### 2. Test Backend Secret

```bash
# Call activation endpoint
curl -X POST https://your-app.vercel.app/api/admin/activate-service-request \
  -H "Content-Type: application/json" \
  -H "x-admin-secret: your-secret-here" \
  -d '{"serviceRequestId": "test-id"}'
```

### 3. Test Database Connection

Check serverless function logs in Vercel dashboard for database connection errors.

---

## Troubleshooting

### Problem: 401 Unauthorized

**Cause**: `VITE_ADMIN_SECRET` and `ADMIN_SECRET` don't match

**Solution**: 
1. Verify both variables in Vercel
2. Ensure they are identical
3. Redeploy the project

### Problem: Database Connection Failed

**Cause**: `DATABASE_URL` not set or incorrect

**Solution**:
1. Verify `DATABASE_URL` in Vercel
2. Check connection string format
3. Ensure SSL is enabled (`sslmode=require`)

### Problem: Frontend Can't Read VITE_ADMIN_SECRET

**Cause**: Variable not prefixed with `VITE_` or not redeployed

**Solution**:
1. Ensure variable name starts with `VITE_`
2. Redeploy the project after adding variable
3. Clear browser cache

---

## Environment Variable Reference

| Variable | Scope | Required | Security |
|----------|-------|----------|----------|
| `VITE_ADMIN_SECRET` | Frontend | Yes | ⚠️ Exposed to browser |
| `ADMIN_SECRET` | Backend | Yes | ✅ Server-side only |
| `DATABASE_URL` | Backend | Yes | ✅ Server-side only |
| `R2_ACCOUNT_ID` | Backend | Yes | ✅ Server-side only |
| `R2_ACCESS_KEY_ID` | Backend | Yes | ✅ Server-side only |
| `R2_SECRET_ACCESS_KEY` | Backend | Yes | ✅ Server-side only (highly sensitive) |
| `R2_BUCKET_NAME` | Backend | No | ✅ Server-side only (default: `assets`) |

---

## Migration from Local to Vercel

When moving from local development to Vercel:

1. **Copy secrets from `.env.local`** to Vercel
2. **Generate new secrets** for production (don't reuse dev secrets)
3. **Set environment-specific values** in Vercel
4. **Redeploy** the project
5. **Test** all endpoints

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-20  
**Author**: DevOps-aware SaaS Engineer

