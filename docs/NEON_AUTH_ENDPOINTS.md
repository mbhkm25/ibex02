# Neon Auth Endpoints Configuration

## المشكلة
عند إنشاء حساب جديد، لا يتم إنشاؤه في جدول users في Neon Auth.

## الحل المطبق
تم إنشاء serverless endpoints في Vercel للتعامل مع Neon Auth:
- `/api/auth/register` - للتسجيل
- `/api/auth/login` - لتسجيل الدخول

## Neon Auth Base URL
```
https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth
```

## Endpoints المحتملة

### للتسجيل (Register):
1. `/signupEmailPassword` - الأكثر شيوعاً
2. `/signup` - بديل
3. `/register` - بديل آخر

### لتسجيل الدخول (Login):
1. `/token` مع `grant_type: 'password'` - OAuth2 standard
2. `/signInWithPassword` - بديل
3. `/login` - بديل آخر

## كيفية التحقق من Endpoints الصحيحة

### 1. فحص وثائق Neon Auth
- اذهب إلى Neon Console
- افتح قسم Authentication
- ابحث عن API Documentation

### 2. اختبار Endpoints مباشرة

استخدم curl أو Postman لاختبار:

```bash
# اختبار التسجيل
curl -X POST https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/signupEmailPassword \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'

# اختبار تسجيل الدخول
curl -X POST https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "grant_type": "password"
  }'
```

### 3. فحص Console Logs
عند محاولة التسجيل، تحقق من logs في Vercel:
- اذهب إلى Vercel Dashboard
- افتح Function Logs
- ابحث عن `[Register]` أو `[Login]` logs

## تحديث الكود

إذا كانت endpoints مختلفة، قم بتحديث:
- `api/auth/register.ts` - سطر `signupEmailPassword` أو `signup`
- `api/auth/login.ts` - سطر `token` أو `signInWithPassword`

## Format المتوقع للاستجابة

Neon Auth قد يعيد tokens في أحد هذه التنسيقات:

```json
// Format 1: OAuth2 Standard
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600
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

## التحقق من إنشاء المستخدم

بعد التسجيل الناجح:
1. اذهب إلى Neon Console
2. افتح Authentication → Users
3. تحقق من وجود المستخدم الجديد

إذا لم يظهر المستخدم:
- تحقق من logs في Vercel
- تحقق من أن endpoint صحيح
- تحقق من أن البيانات المرسلة صحيحة

