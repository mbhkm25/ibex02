# إصلاح مشكلة Auth0 Vercel Integration

## 🔴 المشكلة

بعد ربط Auth0 من خلال Vercel Integrations، ظهر تطبيق جديد في Auth0 Dashboard لكنه لم يعمل.

---

## 🔍 المشاكل المكتشفة

### 1. Callback URL غير متطابق

**في Auth0 Dashboard (من Vercel Integration):**
```
Allowed Callback URLs:
https://blog-with-comments-rosy-one.vercel.app/api/auth/callback
```

**في الكود:**
```typescript
// src/app/contexts/AuthContext.tsx
const redirectUri = window.location.origin + "/callback";
```

**المشكلة:** الكود يستخدم `/callback` لكن Auth0 يتوقع `/api/auth/callback`

---

### 2. Client ID مختلف

**القديم (من الوثائق):**
```
VITE_AUTH0_CLIENT_ID=1mW18IG95RJRXGpYfQWI4OJ1TTtQz7ez
```

**الجديد (من Vercel Integration):**
```
VITE_AUTH0_CLIENT_ID=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
```

---

## ✅ الحل

### الخطوة 1: تحديث Callback URLs في Auth0 Dashboard

اذهب إلى [Auth0 Dashboard](https://manage.auth0.com/) → Applications → **blog-with-comments**

**Allowed Callback URLs:**
```
http://localhost:5173/callback
https://blog-with-comments-rosy-one.vercel.app/callback
https://ibex02-*.vercel.app/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173
https://blog-with-comments-rosy-one.vercel.app
https://ibex02-*.vercel.app
```

**Allowed Web Origins:**
```
http://localhost:5173
https://blog-with-comments-rosy-one.vercel.app
https://ibex02-*.vercel.app
```

⚠️ **مهم:** احذف `/api/auth/callback` وأضف `/callback` فقط

---

### الخطوة 2: تحديث Environment Variables في Vercel

اذهب إلى **Vercel Dashboard** → **Project Settings** → **Environment Variables**

**تحديث القيم التالية:**

#### Frontend Variables:
```
VITE_AUTH0_DOMAIN=dev-0rlg3lescok8mwu0.us.auth0.com
VITE_AUTH0_CLIENT_ID=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
VITE_AUTH0_AUDIENCE=https://api.ibex.app
```

#### Backend Variables:
```
AUTH0_DOMAIN=dev-0rlg3lescok8mwu0.us.auth0.com
AUTH0_ISSUER=https://dev-0rlg3lescok8mwu0.us.auth0.com/
AUTH0_AUDIENCE=https://api.ibex.app
```

⚠️ **مهم:** تأكد من أن `VITE_AUTH0_DOMAIN` بدون `https://` وبدون `/` في النهاية

---

### الخطوة 3: التحقق من API Identifier

اذهب إلى [Auth0 Dashboard](https://manage.auth0.com/) → **APIs**

**تأكد من وجود API:**
- **Identifier:** `https://api.ibex.app`
- **Signing Algorithm:** `RS256`
- **RBAC:** Enabled

---

### الخطوة 4: التحقق من Roles

اذهب إلى [Auth0 Dashboard](https://manage.auth0.com/) → **User Management** → **Roles**

**تأكد من وجود Roles:**
- ✅ `admin`
- ✅ `user`

---

### الخطوة 5: إعادة نشر المشروع

بعد تحديث Environment Variables:

1. اذهب إلى **Vercel Dashboard** → **Deployments**
2. انقر على **Redeploy** للـ latest deployment
3. أو ادفع commit جديد إلى GitHub

---

## 🔧 التحقق من الإعدادات

### 1. تحقق من Callback Route في الكود

```typescript
// src/app/contexts/AuthContext.tsx
const redirectUri = window.location.origin + "/callback";
```

```typescript
// src/app/App.tsx
<Route path="/callback" element={<CallbackPage />} />
```

✅ يجب أن يكون `/callback` في كلا المكانين

---

### 2. تحقق من Environment Variables

في Vercel Dashboard، تأكد من:

✅ `VITE_AUTH0_DOMAIN` = `dev-0rlg3lescok8mwu0.us.auth0.com` (بدون `https://`)
✅ `VITE_AUTH0_CLIENT_ID` = `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
✅ `VITE_AUTH0_AUDIENCE` = `https://api.ibex.app`

---

### 3. تحقق من Allowed URLs في Auth0

في Auth0 Dashboard → Applications → **blog-with-comments**:

✅ **Allowed Callback URLs** تحتوي على:
   - `https://blog-with-comments-rosy-one.vercel.app/callback`
   - `http://localhost:5173/callback`

✅ **Allowed Logout URLs** تحتوي على:
   - `https://blog-with-comments-rosy-one.vercel.app`
   - `http://localhost:5173`

✅ **Allowed Web Origins** تحتوي على:
   - `https://blog-with-comments-rosy-one.vercel.app`
   - `http://localhost:5173`

---

## 🧪 اختبار

### 1. اختبار في Local Development

```bash
npm run dev
```

1. افتح `http://localhost:5173`
2. انقر على "تسجيل الدخول"
3. يجب أن يتم توجيهك إلى Auth0
4. بعد تسجيل الدخول، يجب أن يتم توجيهك إلى `/callback`
5. ثم يتم توجيهك إلى `/dashboard`

---

### 2. اختبار في Production (Vercel)

1. افتح `https://blog-with-comments-rosy-one.vercel.app`
2. انقر على "تسجيل الدخول"
3. يجب أن يتم توجيهك إلى Auth0
4. بعد تسجيل الدخول، يجب أن يتم توجيهك إلى `/callback`
5. ثم يتم توجيهك إلى `/dashboard`

---

## 🐛 استكشاف الأخطاء

### المشكلة: "Invalid redirect_uri"

**السبب:** Callback URL في Auth0 لا يطابق الكود

**الحل:**
1. تحقق من Allowed Callback URLs في Auth0
2. تأكد من أن الكود يستخدم `/callback` وليس `/api/auth/callback`

---

### المشكلة: "Service not found"

**السبب:** `audience` غير صحيح أو API غير موجود

**الحل:**
1. تحقق من وجود API في Auth0 Dashboard
2. تأكد من أن Identifier = `https://api.ibex.app`
3. تأكد من أن `VITE_AUTH0_AUDIENCE` = `https://api.ibex.app`

---

### المشكلة: "Invalid client"

**السبب:** Client ID غير صحيح

**الحل:**
1. تحقق من Client ID في Auth0 Dashboard
2. تأكد من أن `VITE_AUTH0_CLIENT_ID` في Vercel يطابق Client ID في Auth0

---

### المشكلة: "Domain mismatch"

**السبب:** Domain format غير صحيح

**الحل:**
1. تأكد من أن `VITE_AUTH0_DOMAIN` = `dev-0rlg3lescok8mwu0.us.auth0.com`
2. **لا** تستخدم `https://dev-...` أو `dev-.../`

---

## 📝 ملاحظات مهمة

1. **Vercel Integration vs Manual Setup:**
   - Vercel Integration ينشئ تطبيق جديد تلقائياً
   - قد يكون هناك تطبيقان في Auth0 (القديم والجديد)
   - استخدم Client ID من التطبيق الجديد

2. **Callback URL:**
   - الكود يستخدم `/callback` (frontend route)
   - **لا** تستخدم `/api/auth/callback` (backend route)
   - Auth0 يتعامل مع frontend callback فقط

3. **Environment Variables:**
   - Frontend variables تبدأ بـ `VITE_`
   - Backend variables بدون `VITE_`
   - Domain بدون `https://` وبدون `/`

---

## ✅ Checklist

- [ ] Callback URLs في Auth0 = `/callback` (وليس `/api/auth/callback`)
- [ ] Logout URLs في Auth0 = domain فقط (بدون `/callback`)
- [ ] Web Origins في Auth0 = domain فقط
- [ ] `VITE_AUTH0_DOMAIN` في Vercel = `dev-0rlg3lescok8mwu0.us.auth0.com` (بدون `https://`)
- [ ] `VITE_AUTH0_CLIENT_ID` في Vercel = `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- [ ] `VITE_AUTH0_AUDIENCE` في Vercel = `https://api.ibex.app`
- [ ] API موجود في Auth0 Dashboard مع Identifier = `https://api.ibex.app`
- [ ] Roles موجودة في Auth0 (`admin`, `user`)
- [ ] تم إعادة نشر المشروع في Vercel بعد تحديث Environment Variables

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-20  
**Status**: ✅ Ready for Testing
