# Environment Variables Documentation

## ملف `.env.local`

هذا الملف يحتوي على جميع متغيرات البيئة المطلوبة للمشروع.

⚠️ **مهم جداً:** هذا الملف محمي من Git ولا يجب رفعه إلى GitHub.

## المتغيرات المطلوبة

### Frontend (Vite)
- `VITE_AUTH0_DOMAIN` - Auth0 Domain (e.g., dev-0rlg3lescok8mwu0.us.auth0.com)
- `VITE_AUTH0_CLIENT_ID` - Auth0 Client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API Audience (https://api.ibex.app)

### Backend (Serverless Functions)
- `AUTH0_DOMAIN` - Auth0 Domain
- `AUTH0_ISSUER` - Auth0 Issuer URL (e.g., https://dev-0rlg3lescok8mwu0.us.auth0.com/)
- `AUTH0_AUDIENCE` - Auth0 API Audience (https://api.ibex.app)
- `DATABASE_URL` - PostgreSQL connection string من Neon
- `CRON_SECRET` - Secret key for protecting cron job endpoints (e.g., auto-generated secure random string)

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

## Database URL

```
DATABASE_URL=postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Security Notes

- ⚠️ **لا ترفع `.env.local` إلى Git**
- ⚠️ **لا تشارك Secrets مع أي شخص**
- ⚠️ **استخدم secrets مختلفة لكل environment (dev, staging, production)**
