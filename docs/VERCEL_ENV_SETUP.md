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

#### `VITE_AUTH0_DOMAIN`
- **Purpose**: Auth0 Domain for authentication
- **Type**: String
- **Security**: ⚠️ Exposed to browser (public information)
- **Example**: `dev-0rlg3lescok8mwu0.us.auth0.com`
- **Where to find**: Auth0 Dashboard → Applications → Your App → Domain

#### `VITE_AUTH0_CLIENT_ID`
- **Purpose**: Auth0 Application Client ID
- **Type**: String
- **Security**: ⚠️ Exposed to browser (public information)
- **Example**: `1mW18IG95RJRXGpYfQWI4OJ1TTtQz7ez`
- **Where to find**: Auth0 Dashboard → Applications → Your App → Client ID

#### `VITE_AUTH0_AUDIENCE`
- **Purpose**: Auth0 API Audience (Identifier)
- **Type**: String (URL)
- **Security**: ⚠️ Exposed to browser (public information)
- **Example**: `https://api.ibex.app`
- **Where to find**: Auth0 Dashboard → APIs → Your API → Identifier

### 2. Backend Variables (Serverless Functions)

These variables are only available in serverless functions, never exposed to the browser.

#### `AUTH0_DOMAIN`
- **Purpose**: Auth0 Domain for JWT verification
- **Type**: String
- **Security**: ✅ Server-side only
- **Example**: `dev-0rlg3lescok8mwu0.us.auth0.com`
- **Note**: Should match `VITE_AUTH0_DOMAIN` (without `https://`)

#### `AUTH0_ISSUER`
- **Purpose**: Auth0 Issuer URL for JWT verification
- **Type**: String (URL)
- **Security**: ✅ Server-side only
- **Example**: `https://dev-0rlg3lescok8mwu0.us.auth0.com/`
- **Important**: Must end with `/` (trailing slash)
- **Note**: Usually `https://{AUTH0_DOMAIN}/`

#### `AUTH0_AUDIENCE`
- **Purpose**: Auth0 API Audience for JWT verification
- **Type**: String (URL)
- **Security**: ✅ Server-side only
- **Example**: `https://api.ibex.app`
- **Note**: Should match `VITE_AUTH0_AUDIENCE`

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

#### `CRON_SECRET`
- **Purpose**: Secret key for protecting cron job endpoints
- **Type**: String (secure random)
- **Security**: ✅ Server-side only (highly sensitive)
- **Generation**: Use `openssl rand -hex 32` to generate a secure random string
- **Example**: `a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`
- **Usage**: Required by `/api/cron/finalize-ledger` endpoint to prevent unauthorized access
- **Important**: Must be set in Vercel for cron jobs to work

---

## Setup Instructions

### Step 1: Access Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

Add the following variables:

#### For All Environments (Production, Preview, Development)

**Frontend Variables (VITE_ prefix):**
```
VITE_AUTH0_DOMAIN = dev-0rlg3lescok8mwu0.us.auth0.com
VITE_AUTH0_CLIENT_ID = <your-client-id>
VITE_AUTH0_AUDIENCE = https://api.ibex.app
```

**Backend Variables:**
```
AUTH0_DOMAIN = dev-0rlg3lescok8mwu0.us.auth0.com
AUTH0_ISSUER = https://dev-0rlg3lescok8mwu0.us.auth0.com/
AUTH0_AUDIENCE = https://api.ibex.app
DATABASE_URL = postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
R2_ACCOUNT_ID = <your-r2-account-id>
R2_ACCESS_KEY_ID = <your-r2-access-key-id>
R2_SECRET_ACCESS_KEY = <your-r2-secret-access-key>
R2_BUCKET_NAME = assets
CRON_SECRET = <generate-using-openssl-rand-hex-32>
```

**Important Notes:**
- `AUTH0_ISSUER` must end with `/` (trailing slash)
- `AUTH0_DOMAIN` should match `VITE_AUTH0_DOMAIN` (without `https://`)
- `AUTH0_AUDIENCE` should match `VITE_AUTH0_AUDIENCE`
- Use the same values for Production, Preview, and Development (Auth0 is shared)

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

### Critical: Auth0 Domain and Audience Matching

For Auth0 authentication to work, these must match:

```
VITE_AUTH0_DOMAIN = "dev-0rlg3lescok8mwu0.us.auth0.com"
AUTH0_DOMAIN = "dev-0rlg3lescok8mwu0.us.auth0.com"  ← Must match (without https://)
AUTH0_ISSUER = "https://dev-0rlg3lescok8mwu0.us.auth0.com/"  ← Must end with /

VITE_AUTH0_AUDIENCE = "https://api.ibex.app"
AUTH0_AUDIENCE = "https://api.ibex.app"  ← Must match exactly
```

**Why?**
- Frontend uses `VITE_AUTH0_DOMAIN` and `VITE_AUTH0_AUDIENCE` to request tokens
- Backend uses `AUTH0_ISSUER` and `AUTH0_AUDIENCE` to verify tokens
- If they don't match, JWT verification will fail with 401 Unauthorized

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
- [ ] `.env.local` exists locally (create from `docs/ENV_VARIABLES.md`)
- [ ] `.env.local` is gitignored (check `.gitignore` - should already be there)
- [ ] `VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`, `VITE_AUTH0_AUDIENCE` are set in `.env.local`
- [ ] `DATABASE_URL` is set in `.env.local`
- [ ] Auth0 Application is configured in Auth0 Dashboard

### Vercel Production
- [ ] All variables added to Vercel → Settings → Environment Variables
- [ ] `VITE_AUTH0_DOMAIN` and `AUTH0_DOMAIN` match in Vercel
- [ ] `VITE_AUTH0_AUDIENCE` and `AUTH0_AUDIENCE` match in Vercel
- [ ] `AUTH0_ISSUER` ends with `/` (trailing slash)
- [ ] `DATABASE_URL` is set in Vercel (backend only)
- [ ] Variables set for correct environments (Production/Preview/Development)
- [ ] Project redeployed after adding variables
- [ ] Test login/logout works
- [ ] Test JWT token verification works
- [ ] Database connection works from serverless functions

---

## Testing After Setup

### 1. Test Frontend Auth0 Variables

```javascript
// In browser console
console.log('Domain:', import.meta.env.VITE_AUTH0_DOMAIN);
console.log('Client ID:', import.meta.env.VITE_AUTH0_CLIENT_ID);
console.log('Audience:', import.meta.env.VITE_AUTH0_AUDIENCE);
// Should show your Auth0 configuration
```

### 2. Test Auth0 Login

1. Go to your Vercel deployment
2. Click "تسجيل الدخول" (Login)
3. You should be redirected to Auth0 login page
4. After login, you should be redirected back to `/dashboard`

### 3. Test JWT Token

```javascript
// In browser console (after login)
const { getAccessTokenSilently } = useAuth0();
const token = await getAccessTokenSilently();
console.log('Token:', token);

// Decode token payload (for verification only)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token Payload:', payload);
// Should show: iss, aud, sub, etc.
```

### 4. Test Backend JWT Verification

```javascript
// In browser console (after login)
const token = await getAccessTokenSilently();
const response = await fetch('/api/storage?action=download-url&file_id=test', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Response Status:', response.status);
// Should be 200 or 401 (not 500 or 403)
```

### 5. Test Database Connection

Check serverless function logs in Vercel dashboard for database connection errors.

---

## Troubleshooting

### Problem: 401 Unauthorized from Backend

**Cause**: JWT token verification failed (issuer/audience mismatch)

**Solution**: 
1. Verify `AUTH0_ISSUER` ends with `/` (trailing slash)
2. Verify `AUTH0_AUDIENCE` matches `VITE_AUTH0_AUDIENCE`
3. Verify `AUTH0_DOMAIN` matches `VITE_AUTH0_DOMAIN` (without `https://`)
4. Check serverless function logs in Vercel for JWT errors
5. Redeploy the project

### Problem: "Invalid state" Error

**Cause**: OAuth state parameter mismatch (usually cache/cookie issue)

**Solution**:
1. Clear browser cookies and local storage
2. Ensure `cacheLocation="localstorage"` in `Auth0Provider`
3. Verify Allowed Web Origins in Auth0 Dashboard
4. Try incognito/private browsing mode

### Problem: "Service not found: https://api.ibex.app"

**Cause**: Auth0 API not created or audience mismatch

**Solution**:
1. Go to Auth0 Dashboard → APIs
2. Verify API exists with Identifier = `https://api.ibex.app`
3. Verify `VITE_AUTH0_AUDIENCE` and `AUTH0_AUDIENCE` match the API Identifier
4. Ensure API is enabled

### Problem: Database Connection Failed

**Cause**: `DATABASE_URL` not set or incorrect

**Solution**:
1. Verify `DATABASE_URL` in Vercel
2. Check connection string format
3. Ensure SSL is enabled (`sslmode=require`)

### Problem: Frontend Can't Read VITE_ Variables

**Cause**: Variable not prefixed with `VITE_` or not redeployed

**Solution**:
1. Ensure variable name starts with `VITE_`
2. Redeploy the project after adding variable
3. Clear browser cache

---

## Environment Variable Reference

| Variable | Scope | Required | Security |
|----------|-------|----------|----------|
| `VITE_AUTH0_DOMAIN` | Frontend | Yes | ⚠️ Exposed to browser (public) |
| `VITE_AUTH0_CLIENT_ID` | Frontend | Yes | ⚠️ Exposed to browser (public) |
| `VITE_AUTH0_AUDIENCE` | Frontend | Yes | ⚠️ Exposed to browser (public) |
| `AUTH0_DOMAIN` | Backend | Yes | ✅ Server-side only |
| `AUTH0_ISSUER` | Backend | Yes | ✅ Server-side only |
| `AUTH0_AUDIENCE` | Backend | Yes | ✅ Server-side only |
| `DATABASE_URL` | Backend | Yes | ✅ Server-side only |
| `R2_ACCOUNT_ID` | Backend | Yes | ✅ Server-side only |
| `R2_ACCESS_KEY_ID` | Backend | Yes | ✅ Server-side only |
| `R2_SECRET_ACCESS_KEY` | Backend | Yes | ✅ Server-side only (highly sensitive) |
| `R2_BUCKET_NAME` | Backend | No | ✅ Server-side only (default: `assets`) |
| `CRON_SECRET` | Backend | Yes | ✅ Server-side only (highly sensitive) |

---

## Migration from Local to Vercel

When moving from local development to Vercel:

1. **Copy Auth0 variables from `.env.local`** to Vercel
2. **Use the same Auth0 values** for all environments (Auth0 is shared)
3. **Set all environment variables** in Vercel (Production, Preview, Development)
4. **Update Auth0 Dashboard** with Vercel domain (Allowed Callback/Logout URLs)
5. **Redeploy** the project
6. **Test** login/logout and API endpoints

---

**Document Version**: 2.0  
**Last Updated**: 2024-01-20  
**Author**: DevOps-aware SaaS Engineer  
**Related**: See `docs/VERCEL_AUTH0_SETUP.md` for detailed Auth0 configuration guide

