# Environment Variables Documentation

## ملف `.env.local`

هذا الملف يحتوي على جميع متغيرات البيئة المطلوبة للمشروع.

⚠️ **مهم جداً:** هذا الملف محمي من Git ولا يجب رفعه إلى GitHub.

## المتغيرات المطلوبة

### Frontend (Vite)
- `VITE_ADMIN_SECRET` - Secret للمصادقة في Frontend (deprecated)
- `VITE_NEON_AUTH_ISSUER` - Neon Auth Issuer URL
- `VITE_NEON_AUTH_BASE` - Neon Auth Base URL
- `VITE_NEON_AUTH_JWKS_URL` - Neon Auth JWKS URL

### Backend (Serverless Functions)
- `ADMIN_SECRET` - Secret للمصادقة في Backend (deprecated)
- `DATABASE_URL` - PostgreSQL connection string من Neon
- `NEON_AUTH_ISSUER` - Neon Auth Issuer URL
- `NEON_AUTH_BASE` - Neon Auth Base URL
- `NEON_AUTH_JWKS_URL` - Neon Auth JWKS URL

### Cloudflare R2 Storage
- `R2_ACCOUNT_ID` - Cloudflare R2 Account ID
- `R2_ACCESS_KEY_ID` - R2 Access Key ID
- `R2_SECRET_ACCESS_KEY` - R2 Secret Access Key
- `R2_BUCKET_NAME` - R2 Bucket Name

## كيفية الإعداد

### 1. إنشاء الملف محلياً
```bash
# Windows PowerShell
Copy-Item .env.example .env.local
```

### 2. ملء القيم
افتح `.env.local` واملأ جميع القيم المطلوبة.

### 3. إعادة تشغيل Dev Server
```bash
npm run dev
```

## Vercel Environment Variables

عند النشر على Vercel، يجب إضافة جميع المتغيرات في:
1. Vercel Dashboard → Project → Settings → Environment Variables
2. أضف جميع المتغيرات (بدون `VITE_` prefix للـ backend)
3. أضف `VITE_*` variables للـ frontend

## Neon Auth URLs

```
NEON_AUTH_ISSUER=https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth
NEON_AUTH_BASE=https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth
NEON_AUTH_JWKS_URL=https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/.well-known/jwks.json
```

## Database URL

```
DATABASE_URL=postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Security Notes

- ⚠️ **لا ترفع `.env.local` إلى Git**
- ⚠️ **لا تشارك Secrets مع أي شخص**
- ⚠️ **استخدم secrets مختلفة لكل environment (dev, staging, production)**

