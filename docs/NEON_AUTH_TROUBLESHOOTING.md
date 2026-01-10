# Neon Auth Troubleshooting Guide

## المشكلة
عند إنشاء حساب جديد من واجهة التسجيل، لا يظهر الحساب في قائمة المستخدمين في Neon Auth Console.

## خطوات التحقق

### 1. فحص Vercel Function Logs

اذهب إلى Vercel Dashboard → Functions → Logs وابحث عن:
- `[Register] Trying endpoint:` - لمعرفة الـ endpoints التي تم تجربتها
- `[Register] Response status:` - لمعرفة status code
- `[Register] Response body:` - لمعرفة الـ response من Neon Auth
- `[Register] Error from:` - لمعرفة الأخطاء

### 2. التحقق من Neon Auth Base URL

تأكد من أن `NEON_AUTH_BASE` في Vercel Environment Variables صحيح:
```
https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth
```

### 3. اختبار Endpoints مباشرة

استخدم curl أو Postman لاختبار الـ endpoints:

```bash
# اختبار /signupEmailPassword
curl -X POST https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/signupEmailPassword \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User",
    "phone": "+966501234567"
  }'

# اختبار /signup
curl -X POST https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/signup \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'

# اختبار /register
curl -X POST https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### 4. فحص Neon Auth Console

1. اذهب إلى: https://console.neon.tech/app/projects/floral-rice-67740703/branches/br-fancy-bread-a7xulzy6/auth
2. افتح قسم "API Documentation" أو "Endpoints"
3. ابحث عن endpoint التسجيل الصحيح
4. تحقق من format الـ request body المطلوب

### 5. التحقق من Response Format

Neon Auth قد يعيد tokens في أحد هذه التنسيقات:

```json
// Format 1: OAuth2 Standard
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "...",
    "email": "..."
  }
}

// Format 2: Session-based
{
  "session": {
    "access_token": "...",
    "refresh_token": "...",
    "user": {...}
  }
}

// Format 3: Direct
{
  "token": "...",
  "user": {...}
}
```

الكود الحالي يدعم جميع هذه التنسيقات.

### 6. التحقق من Environment Variables في Vercel

تأكد من إضافة `NEON_AUTH_BASE` في Vercel Environment Variables:
1. اذهب إلى Vercel Dashboard → Project → Settings → Environment Variables
2. أضف:
   - Key: `NEON_AUTH_BASE`
   - Value: `https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth`
   - Environment: Production, Preview, Development

### 7. التحقق من CORS

إذا كانت هناك مشاكل CORS، تأكد من أن Neon Auth يسمح بـ requests من Vercel domain.

### 8. فحص Network Tab في Browser

1. افتح Developer Tools → Network
2. حاول إنشاء حساب جديد
3. ابحث عن request إلى `/api/auth/register`
4. تحقق من:
   - Request payload
   - Response status
   - Response body

## الحلول المحتملة

### إذا كان الـ endpoint غير صحيح:
1. حدد الـ endpoint الصحيح من Neon Auth Console
2. حدّث `api/auth/register.ts`:
   - أضف الـ endpoint الصحيح في قائمة `endpoints`
   - أو ضعه أولاً في القائمة

### إذا كان Request Body غير صحيح:
1. تحقق من format المطلوب من Neon Auth Documentation
2. حدّث `requestBody` في `api/auth/register.ts`

### إذا كان هناك مشكلة في Authentication:
1. تحقق من أن Neon Auth لا يحتاج إلى API Key أو Secret
2. إذا كان يحتاج، أضفه في Environment Variables واستخدمه في headers

## معلومات Debugging

الكود الحالي يسجل:
- كل endpoint يتم تجربته
- Response status لكل endpoint
- Response body (أول 200 حرف)
- الأخطاء المفصلة

استخدم هذه المعلومات لتحديد المشكلة.

