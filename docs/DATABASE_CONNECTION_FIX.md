# إصلاح مشكلة اتصال قاعدة البيانات

## المشكلة

المشروع يبدو غير متصل بقاعدة البيانات. هذا يحدث عادة لأن:

1. **في Local Development**: Vercel Serverless Functions لا تقرأ `.env.local` تلقائياً
2. **في Production**: `DATABASE_URL` غير موجود في Vercel Environment Variables

## الحلول

### الحل 1: استخدام Vercel CLI للـ Local Development

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# ربط المشروع
vercel link

# تشغيل dev server مع Vercel
vercel dev
```

هذا سيقرأ `.env.local` تلقائياً.

### الحل 2: إضافة DATABASE_URL في Vercel

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع
3. Settings → Environment Variables
4. أضف:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_W0h7BHyTerFY@ep-flat-hall-a7h51kjz-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
5. Redeploy المشروع

### الحل 3: اختبار الاتصال

استخدم endpoint الاختبار:

```bash
# Local
curl http://localhost:3000/api/test-db

# Production
curl https://your-app.vercel.app/api/test-db
```

## التحقق من الاتصال

### 1. تحقق من Environment Variables

```bash
# في terminal
echo $DATABASE_URL

# أو في PowerShell
echo $env:DATABASE_URL
```

### 2. تحقق من قاعدة البيانات مباشرة

```bash
npm run db:verify
```

### 3. تحقق من API Endpoint

افتح في المتصفح:
```
http://localhost:3000/api/test-db
```

يجب أن ترى:
```json
{
  "success": true,
  "data": {
    "hasDatabaseUrl": true,
    "databaseConnected": true,
    "tableCount": 10,
    "error": null
  }
}
```

## الأخطاء الشائعة

### Error: "DATABASE_URL environment variable is not set"

**السبب**: المتغير غير معرّف في بيئة Serverless Function

**الحل**: 
- Local: استخدم `vercel dev` بدلاً من `npm run dev`
- Production: أضف `DATABASE_URL` في Vercel Environment Variables

### Error: "Connection refused"

**السبب**: Connection string غير صحيح أو قاعدة البيانات غير متاحة

**الحل**: 
- تحقق من connection string
- تأكد من أن Neon database نشط
- تحقق من SSL settings

### Error: "relation does not exist"

**السبب**: الجداول غير موجودة

**الحل**: 
```bash
npm run db:init
```

## الخطوات التالية

1. ✅ تحقق من `.env.local` يحتوي على `DATABASE_URL`
2. ✅ اختبر الاتصال: `npm run db:verify`
3. ✅ اختبر API: `curl http://localhost:3000/api/test-db`
4. ✅ إذا كان local: استخدم `vercel dev`
5. ✅ إذا كان production: أضف `DATABASE_URL` في Vercel

