# إعداد Auth0 على Vercel - دليل شامل

## نظرة عامة

هذا الدليل يشرح كيفية ربط Auth0 مع Vercel لإتمام عملية المصادقة في بيئة الإنتاج.

---

## المتطلبات الأساسية

✅ **يجب أن تكون قد أكملت:**
1. إعداد Auth0 Application في Dashboard
2. إعداد Auth0 API (`https://api.ibex.app`)
3. إضافة Roles (admin, user) في Auth0
4. تحديث الكود لاستخدام Auth0

---

## الخطوة 1: إعداد Auth0 Application

### 1.1 التحقق من Application Settings

اذهب إلى [Auth0 Dashboard](https://manage.auth0.com/) → Applications → **SaaS Web App**

**تأكد من:**
- ✅ **Application Type**: `Single Page Application`
- ✅ **Token Endpoint Authentication Method**: `None`

### 1.2 إعداد Allowed URLs

**Allowed Callback URLs:**
```
http://localhost:5173/callback
https://ibex02-*.vercel.app/callback
https://your-production-domain.com/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173
https://ibex02-*.vercel.app
https://your-production-domain.com
```

**Allowed Web Origins:**
```
http://localhost:5173
https://ibex02-*.vercel.app
https://your-production-domain.com
```

**ملاحظة:** استبدل `your-production-domain.com` بالدومين الفعلي للمشروع على Vercel.

---

## الخطوة 2: إعداد Auth0 API

### 2.1 التحقق من API Configuration

اذهب إلى [Auth0 Dashboard](https://manage.auth0.com/) → APIs → **https://api.ibex.app**

**تأكد من:**
- ✅ **Identifier**: `https://api.ibex.app`
- ✅ **Signing Algorithm**: `RS256`
- ✅ **Enable RBAC**: `ON`
- ✅ **Add Permissions in Access Token**: `ON`

### 2.2 إضافة Roles

اذهب إلى [Auth0 Dashboard](https://manage.auth0.com/) → User Management → Roles

**تأكد من وجود:**
- ✅ `admin`
- ✅ `user`

**لإضافة Role:**
1. اضغط **Create Role**
2. أدخل الاسم (مثلاً: `admin`)
3. اضغط **Create**

---

## الخطوة 3: إضافة Environment Variables في Vercel

### 3.1 الوصول إلى Vercel Dashboard

1. اذهب إلى [Vercel Dashboard](https://vercel.com/dashboard)
2. اختر المشروع **ibex02**
3. اذهب إلى **Settings** → **Environment Variables**

### 3.2 إضافة Frontend Variables (VITE_ prefix)

هذه المتغيرات ستكون متاحة في المتصفح:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_AUTH0_DOMAIN` | `dev-0rlg3lescok8mwu0.us.auth0.com` | Production, Preview, Development |
| `VITE_AUTH0_CLIENT_ID` | `1mW18IG95RJRXGpYfQWI4OJ1TTtQz7ez` | Production, Preview, Development |
| `VITE_AUTH0_AUDIENCE` | `https://api.ibex.app` | Production, Preview, Development |

**كيفية الإضافة:**
1. اضغط **Add New**
2. أدخل **Key**: `VITE_AUTH0_DOMAIN`
3. أدخل **Value**: `dev-0rlg3lescok8mwu0.us.auth0.com`
4. اختر **Environments**: Production, Preview, Development
5. اضغط **Save**
6. كرر العملية للمتغيرات الأخرى

### 3.3 إضافة Backend Variables

هذه المتغيرات متاحة فقط في Serverless Functions:

| Variable | Value | Environment |
|----------|-------|-------------|
| `AUTH0_DOMAIN` | `dev-0rlg3lescok8mwu0.us.auth0.com` | Production, Preview, Development |
| `AUTH0_ISSUER` | `https://dev-0rlg3lescok8mwu0.us.auth0.com/` | Production, Preview, Development |
| `AUTH0_AUDIENCE` | `https://api.ibex.app` | Production, Preview, Development |

**ملاحظة:** تأكد من إضافة `/` في نهاية `AUTH0_ISSUER`.

---

## الخطوة 4: تحديث Allowed URLs في Auth0 بعد الحصول على Vercel Domain

### 4.1 الحصول على Vercel Domain

بعد النشر على Vercel، ستحصل على domain مثل:
```
https://ibex02-77jf12jmx-mbhkm25s-projects.vercel.app
```

### 4.2 تحديث Auth0 Application

1. اذهب إلى Auth0 Dashboard → Applications → **SaaS Web App**
2. أضف الـ domain الجديد إلى:
   - **Allowed Callback URLs**: `https://your-vercel-domain.vercel.app/callback`
   - **Allowed Logout URLs**: `https://your-vercel-domain.vercel.app`
   - **Allowed Web Origins**: `https://your-vercel-domain.vercel.app`

---

## الخطوة 5: إعادة النشر (Redeploy)

بعد إضافة جميع Environment Variables:

1. اذهب إلى Vercel Dashboard → **Deployments**
2. اضغط على **⋮** (ثلاث نقاط) بجانب آخر deployment
3. اختر **Redeploy**
4. انتظر حتى يكتمل النشر

---

## الخطوة 6: التحقق من الإعداد

### 6.1 اختبار تسجيل الدخول

1. افتح المشروع على Vercel
2. اضغط **تسجيل الدخول**
3. يجب أن يتم توجيهك إلى Auth0 Login Page
4. بعد تسجيل الدخول، يجب أن يتم توجيهك إلى `/dashboard`

### 6.2 اختبار JWT Token

افتح **Browser Console** (F12) وأدخل:

```javascript
// الحصول على Token
const token = await window.auth0.getAccessTokenSilently();
console.log('Token:', token);

// فك تشفير Token (للتحقق فقط)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token Payload:', payload);
```

**تأكد من:**
- ✅ `iss`: `https://dev-0rlg3lescok8mwu0.us.auth0.com/`
- ✅ `aud`: `https://api.ibex.app`
- ✅ `sub`: موجود (User ID)

### 6.3 اختبار Backend API

افتح **Browser Console** وأدخل:

```javascript
const token = await window.auth0.getAccessTokenSilently();
const response = await fetch('/api/storage?action=download-url&file_id=test', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
console.log('Response:', response.status);
```

**النتائج المتوقعة:**
- ✅ `200` أو `401` (إذا كان file_id غير موجود) - يعني JWT صحيح
- ❌ `401 Unauthorized` - يعني JWT غير صحيح أو غير موجود

---

## استكشاف الأخطاء (Troubleshooting)

### المشكلة 1: "Invalid state" error

**السبب:** مشكلة في الـ state parameter في OAuth flow.

**الحل:**
1. امسح **Cookies** و **Local Storage** في المتصفح
2. تأكد من أن `cacheLocation="localstorage"` موجود في `Auth0Provider`
3. تأكد من أن Allowed Web Origins صحيح في Auth0

### المشكلة 2: "Service not found: https://api.ibex.app"

**السبب:** API غير موجود في Auth0 أو `audience` غير صحيح.

**الحل:**
1. تأكد من وجود API في Auth0 Dashboard → APIs
2. تأكد من أن Identifier هو `https://api.ibex.app`
3. تأكد من أن `VITE_AUTH0_AUDIENCE` في Vercel = `https://api.ibex.app`

### المشكلة 3: "401 Unauthorized" من Backend

**السبب:** JWT غير صحيح أو Backend لا يستطيع التحقق منه.

**الحل:**
1. تأكد من أن `AUTH0_DOMAIN`, `AUTH0_ISSUER`, `AUTH0_AUDIENCE` موجودة في Vercel
2. تأكد من أن `AUTH0_ISSUER` ينتهي بـ `/`
3. تحقق من Serverless Function Logs في Vercel Dashboard

### المشكلة 4: "Redirect URI mismatch"

**السبب:** Callback URL غير موجود في Allowed Callback URLs.

**الحل:**
1. اذهب إلى Auth0 Dashboard → Applications → **SaaS Web App**
2. أضف الـ domain الكامل إلى **Allowed Callback URLs**
3. تأكد من أن الـ URL ينتهي بـ `/callback`

---

## Checklist النهائي

### Auth0 Dashboard
- [ ] Application Type = `Single Page Application`
- [ ] Allowed Callback URLs تحتوي على Vercel domain
- [ ] Allowed Logout URLs تحتوي على Vercel domain
- [ ] Allowed Web Origins تحتوي على Vercel domain
- [ ] API موجود بـ Identifier = `https://api.ibex.app`
- [ ] RBAC مفعل في API
- [ ] Roles موجودة (admin, user)

### Vercel Environment Variables
- [ ] `VITE_AUTH0_DOMAIN` موجود
- [ ] `VITE_AUTH0_CLIENT_ID` موجود
- [ ] `VITE_AUTH0_AUDIENCE` موجود
- [ ] `AUTH0_DOMAIN` موجود
- [ ] `AUTH0_ISSUER` موجود (وينتهي بـ `/`)
- [ ] `AUTH0_AUDIENCE` موجود
- [ ] جميع المتغيرات مضاف لها Production, Preview, Development

### الكود
- [ ] `src/main.tsx` يحتوي على `Auth0Provider`
- [ ] `src/app/contexts/AuthContext.tsx` يستخدم `@auth0/auth0-react`
- [ ] `api/_auth.ts` يستخدم Auth0 JWKS
- [ ] `src/app/App.tsx` يحتوي على route `/callback`

### الاختبار
- [ ] تسجيل الدخول يعمل
- [ ] تسجيل الخروج يعمل
- [ ] JWT Token موجود وصحيح
- [ ] Backend API يقبل JWT Token
- [ ] Protected routes تعمل

---

## المراجع

- [Auth0 React SDK Documentation](https://auth0.com/docs/quickstart/spa/react)
- [Auth0 API Configuration](https://auth0.com/docs/get-started/auth0-overview/create-applications/apis)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**آخر تحديث:** 2024-01-20  
**الإصدار:** 1.0
