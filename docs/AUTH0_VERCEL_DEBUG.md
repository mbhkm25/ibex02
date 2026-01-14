# 🔍 تشخيص مشكلة Auth0 في Vercel

## المشكلة: Auth0 يعمل على localhost:5173 لكنه لا يعمل على Vercel

---

## ✅ خطوات التشخيص (خطوة بخطوة)

### 1️⃣ التحقق من Environment Variables في Vercel

**اذهب إلى:** Vercel Dashboard → Project → Settings → Environment Variables

**تأكد من وجود هذه المتغيرات:**

#### Frontend Variables (يجب أن تبدأ بـ `VITE_`):
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

**⚠️ نقاط مهمة:**
- `VITE_AUTH0_DOMAIN` **بدون** `https://` و**بدون** `/` في النهاية
- تأكد من أن Environment Variables موجودة في **Production**, **Preview**, و **Development**
- بعد إضافة/تحديث Environment Variables، يجب **إعادة نشر** المشروع

---

### 2️⃣ التحقق من Callback URLs في Auth0 Dashboard

**اذهب إلى:** [Auth0 Dashboard](https://manage.auth0.com/) → Applications → **blog-with-comments**

**Allowed Callback URLs يجب أن تحتوي على:**
```
http://localhost:5173/callback
https://blog-with-comments-rosy-one.vercel.app/callback
```

**Allowed Logout URLs يجب أن تحتوي على:**
```
http://localhost:5173
https://blog-with-comments-rosy-one.vercel.app
```

**Allowed Web Origins يجب أن تحتوي على:**
```
http://localhost:5173
https://blog-with-comments-rosy-one.vercel.app
```

**⚠️ مهم:**
- **احذف** `/api/auth/callback` إذا كان موجوداً
- **أضف** `/callback` فقط
- تأكد من أن domain Vercel صحيح (قد يكون مختلفاً عن `blog-with-comments-rosy-one.vercel.app`)

---

### 3️⃣ التحقق من Console في المتصفح

**افتح:** Vercel deployment → F12 → Console

**ابحث عن:**
- ✅ `🔍 Auth0 Configuration Debug:` - يجب أن تظهر القيم
- ❌ `❌ Missing Auth0 environment variables` - إذا ظهر هذا، Environment Variables غير موجودة
- ❌ `Invalid redirect_uri` - إذا ظهر هذا، Callback URL غير متطابق

**لتفعيل Debug Mode:**
أضف في Vercel Environment Variables:
```
VITE_DEBUG_AUTH0=true
```

---

### 4️⃣ التحقق من Network Tab

**افتح:** Vercel deployment → F12 → Network

**ابحث عن:**
1. Request إلى Auth0 عند الضغط على "تسجيل الدخول"
2. Request إلى `/callback` بعد تسجيل الدخول
3. Status codes:
   - ✅ `200` = نجح
   - ❌ `401` = Unauthorized (مشكلة في Client ID أو Domain)
   - ❌ `403` = Forbidden (مشكلة في Callback URL)
   - ❌ `404` = Not Found (مشكلة في Route)

---

### 5️⃣ التحقق من Vercel Logs

**اذهب إلى:** Vercel Dashboard → Deployments → Latest → Functions Logs

**ابحث عن:**
- Errors في `/api/auth/bootstrap`
- Errors في أي API endpoint يستخدم `requireAuth`

---

## 🔧 الحلول الشائعة

### المشكلة 1: Environment Variables غير موجودة في Production

**الأعراض:**
- يعمل على localhost لكن لا يعمل على Vercel
- Console يظهر: `❌ Missing Auth0 environment variables`

**الحل:**
1. اذهب إلى Vercel Dashboard → Settings → Environment Variables
2. تأكد من أن Environment Variables موجودة في **Production** environment
3. أعد نشر المشروع

---

### المشكلة 2: Callback URL غير متطابق

**الأعراض:**
- Console يظهر: `Invalid redirect_uri`
- Network tab يظهر `403 Forbidden`

**الحل:**
1. اذهب إلى Auth0 Dashboard → Applications → **blog-with-comments**
2. في **Allowed Callback URLs**، أضف:
   ```
   https://your-vercel-domain.vercel.app/callback
   ```
3. احذف `/api/auth/callback` إذا كان موجوداً

---

### المشكلة 3: Domain format غير صحيح

**الأعراض:**
- Console يظهر: `❌ VITE_AUTH0_DOMAIN must be domain only`
- Auth0 لا يستجيب

**الحل:**
1. تأكد من أن `VITE_AUTH0_DOMAIN` = `dev-0rlg3lescok8mwu0.us.auth0.com`
2. **لا** تستخدم:
   - ❌ `https://dev-0rlg3lescok8mwu0.us.auth0.com`
   - ❌ `dev-0rlg3lescok8mwu0.us.auth0.com/`

---

### المشكلة 4: Client ID غير صحيح

**الأعراض:**
- Console يظهر: `Invalid client`
- Network tab يظهر `401 Unauthorized`

**الحل:**
1. تأكد من أن `VITE_AUTH0_CLIENT_ID` في Vercel يطابق Client ID في Auth0 Dashboard
2. Client ID من Vercel Integration: `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`

---

### المشكلة 5: API Identifier غير موجود

**الأعراض:**
- Console يظهر: `Service not found`
- Network tab يظهر `401 Unauthorized`

**الحل:**
1. اذهب إلى Auth0 Dashboard → APIs
2. تأكد من وجود API مع Identifier = `https://api.ibex.app`
3. إذا لم يكن موجوداً، أنشئه:
   - Name: `IBEX API`
   - Identifier: `https://api.ibex.app`
   - Signing Algorithm: `RS256`
   - Enable RBAC: ✅

---

## 🧪 اختبار سريع

### 1. اختبار Environment Variables

افتح Console في المتصفح (F12) واكتب:
```javascript
console.log({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
});
```

**النتيجة المتوقعة:**
```javascript
{
  domain: "dev-0rlg3lescok8mwu0.us.auth0.com",
  clientId: "7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I",
  audience: "https://api.ibex.app"
}
```

**إذا كانت القيم `undefined`:**
- Environment Variables غير موجودة في Vercel
- يجب إضافتها وإعادة نشر المشروع

---

### 2. اختبار Callback URL

افتح Console واكتب:
```javascript
console.log('Redirect URI:', window.location.origin + "/callback");
```

**النتيجة المتوقعة:**
```
Redirect URI: https://blog-with-comments-rosy-one.vercel.app/callback
```

**تأكد من أن هذا الـ URL موجود في Auth0 Dashboard → Allowed Callback URLs**

---

### 3. اختبار Auth0 Connection

افتح Network tab (F12 → Network) و:
1. انقر على "تسجيل الدخول"
2. ابحث عن request إلى `authorize` في Auth0 domain
3. تحقق من Status code:
   - ✅ `302` = Redirect (نجح)
   - ❌ `400` = Bad Request (مشكلة في parameters)
   - ❌ `403` = Forbidden (مشكلة في Callback URL)

---

## 📋 Checklist النهائي

- [ ] Environment Variables موجودة في Vercel (Production)
- [ ] `VITE_AUTH0_DOMAIN` = `dev-0rlg3lescok8mwu0.us.auth0.com` (بدون `https://`)
- [ ] `VITE_AUTH0_CLIENT_ID` = `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- [ ] `VITE_AUTH0_AUDIENCE` = `https://api.ibex.app`
- [ ] Callback URLs في Auth0 تحتوي على `/callback` (وليس `/api/auth/callback`)
- [ ] Domain Vercel في Auth0 Callback URLs صحيح
- [ ] API موجود في Auth0 Dashboard مع Identifier = `https://api.ibex.app`
- [ ] تم إعادة نشر المشروع بعد تحديث Environment Variables
- [ ] Console لا يظهر أخطاء
- [ ] Network tab يظهر requests ناجحة

---

## 🆘 إذا استمرت المشكلة

1. **تحقق من Vercel Logs:**
   - Vercel Dashboard → Deployments → Latest → Functions Logs
   - ابحث عن errors

2. **تحقق من Auth0 Logs:**
   - Auth0 Dashboard → Monitoring → Logs
   - ابحث عن failed login attempts

3. **اختبر في Incognito Mode:**
   - قد تكون هناك مشكلة في cookies/cache

4. **تحقق من CORS:**
   - تأكد من أن Allowed Web Origins في Auth0 صحيحة

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-20  
**Status**: 🔍 Debugging Guide
