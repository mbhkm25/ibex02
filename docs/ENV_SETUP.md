# Environment Variables Setup Guide

## Quick Start

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the project root with the following content:

```bash
# ===== Frontend (Vite) =====
VITE_ADMIN_SECRET=CHANGE_ME_TO_A_STRONG_RANDOM_SECRET

# ===== Backend (Serverless Functions) =====
ADMIN_SECRET=CHANGE_ME_TO_THE_SAME_STRONG_RANDOM_SECRET
DATABASE_URL=postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### Step 2: Generate Strong Secrets

Run this command to generate a secure random secret:

```bash
openssl rand -hex 32
```

**Example output:**
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

### Step 3: Replace Placeholders

1. Copy the generated secret
2. Replace `CHANGE_ME_TO_A_STRONG_RANDOM_SECRET` with the generated value
3. Replace `CHANGE_ME_TO_THE_SAME_STRONG_RANDOM_SECRET` with the **same** value
4. Save the file

**Important:** `VITE_ADMIN_SECRET` and `ADMIN_SECRET` must be **identical**.

---

## Security Rules

### ⚠️ CRITICAL: Never Commit `.env.local`

The `.env.local` file is already in `.gitignore`. **Never commit it to version control.**

### ⚠️ Security Warnings

- **NEVER** commit `.env.local` to version control
- **NEVER** expose secrets in frontend code
- **NEVER** share secrets in screenshots or documentation
- **NEVER** hardcode secrets in source code

---

## Verification Checklist

After setup, verify:

- [ ] `.env.local` exists locally
- [ ] `.env.local` is gitignored (check `.gitignore`)
- [ ] `VITE_ADMIN_SECRET` and `ADMIN_SECRET` match
- [ ] Secrets are strong (minimum 32 characters)
- [ ] `DATABASE_URL` is set correctly
- [ ] Variables added to Vercel (for production)
- [ ] Project redeployed after adding variables (for production)

---

## File Structure

```
project-root/
├── .env.local          ← Create this file (gitignored)
├── .gitignore          ← Already includes .env.local
└── docs/
    ├── ENV_SETUP.md    ← This file
    └── VERCEL_ENV_SETUP.md  ← Vercel-specific setup
```

---

## Variable Reference

| Variable | Scope | Required | Security |
|----------|-------|----------|----------|
| `VITE_ADMIN_SECRET` | Frontend | Yes | ⚠️ Exposed to browser |
| `ADMIN_SECRET` | Backend | Yes | ✅ Server-side only |
| `DATABASE_URL` | Backend | Yes | ✅ Server-side only |

---

## Troubleshooting

### Problem: Frontend can't read `VITE_ADMIN_SECRET`

**Solution:**
1. Ensure variable name starts with `VITE_`
2. Restart the dev server: `npm run dev`
3. Clear browser cache

### Problem: Backend can't read `ADMIN_SECRET` or `DATABASE_URL`

**Solution:**
1. Verify variables are set in Vercel (for production)
2. Check variable names are correct (case-sensitive)
3. Redeploy the project

### Problem: 401 Unauthorized errors

**Solution:**
1. Verify `VITE_ADMIN_SECRET` and `ADMIN_SECRET` match exactly
2. Check for extra spaces or newlines in secrets
3. Regenerate secrets if needed

---

**For Vercel production setup, see:** `docs/VERCEL_ENV_SETUP.md`

