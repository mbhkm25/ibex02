# ✅ التحقق من طلب Auth0 في Vercel

## 🔍 خطوات التحقق السريعة

### 1️⃣ افتح الموقع في Vercel

```
https://blog-with-comments-rosy-one.vercel.app
```

---

### 2️⃣ افتح Developer Tools

اضغط `F12` أو `Ctrl+Shift+I`

---

### 3️⃣ افتح Console Tab

**ابحث عن:**
```
🔍 Auth0 Configuration Debug: { ... }
```

**إذا ظهر:**
- ✅ Environment Variables موجودة
- ❌ إذا لم يظهر أو ظهر `MISSING` → Environment Variables غير موجودة

---

### 4️⃣ افتح Network Tab

1. اضغط `F12` → `Network`
2. انقر على "تسجيل الدخول" في الموقع
3. ابحث عن request إلى `authorize` في domain `dev-0rlg3lescok8mwu0.us.auth0.com`

---

### 5️⃣ تحقق من Request URL

**انقر على Request → Headers → Request URL**

**يجب أن ترى:**
```
https://dev-0rlg3lescok8mwu0.us.auth0.com/authorize?
  response_type=code
  &client_id=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
  &redirect_uri=https://blog-with-comments-rosy-one.vercel.app/callback
  &audience=https://api.ibex.app
  &scope=openid profile email offline_access
  &state=...
  &code_challenge=...
  &code_challenge_method=S256
```

---

### 6️⃣ تحقق من Query String Parameters

**انقر على Request → Payload → Query String Parameters**

**تحقق من:**

#### ✅ `client_id`
```
7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
```
**يجب أن يطابق:** Client ID في Auth0 Dashboard

---

#### ✅ `redirect_uri`
```
https://blog-with-comments-rosy-one.vercel.app/callback
```
**يجب أن يطابق:** Allowed Callback URLs في Auth0 Dashboard

**⚠️ مهم:** يجب أن يكون `/callback` وليس `/api/auth/callback`

---

#### ✅ `audience`
```
https://api.ibex.app
```
**يجب أن يطابق:** API Identifier في Auth0 Dashboard → APIs

---

#### ✅ `scope`
```
openid profile email offline_access
```
**هذه القيمة صحيحة** (Auth0 SDK يضيفها تلقائياً)

---

### 7️⃣ تحقق من Response

**انقر على Request → Response**

**إذا نجح:**
- Status: `302 Found` (Redirect)
- Location: `https://blog-with-comments-rosy-one.vercel.app/callback?code=...&state=...`

**إذا فشل:**
- Status: `400 Bad Request` أو `403 Forbidden`
- Response body: يحتوي على error message

---

## 🐛 الأخطاء الشائعة

### Error: `Invalid redirect_uri`

**المشكلة:**
```
redirect_uri=https://blog-with-comments-rosy-one.vercel.app/callback
```
**لكن في Auth0 Dashboard:**
```
Allowed Callback URLs: https://blog-with-comments-rosy-one.vercel.app/api/auth/callback
```

**الحل:**
1. اذهب إلى Auth0 Dashboard → Applications → **blog-with-comments**
2. في **Allowed Callback URLs**، أضف:
   ```
   https://blog-with-comments-rosy-one.vercel.app/callback
   ```
3. احذف `/api/auth/callback` إذا كان موجوداً

---

### Error: `Invalid client`

**المشكلة:**
```
client_id=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
```
**لكن في Auth0 Dashboard:**
```
Client ID: 1mW18IG95RJRXGpYfQWI4OJ1TTtQz7ez
```

**الحل:**
1. تحقق من Client ID في Auth0 Dashboard → Applications → **blog-with-comments**
2. تأكد من أن `VITE_AUTH0_CLIENT_ID` في Vercel يطابق Client ID في Auth0

---

### Error: `Service not found`

**المشكلة:**
```
audience=https://api.ibex.app
```
**لكن في Auth0 Dashboard:**
```
APIs: (لا يوجد API مع Identifier = https://api.ibex.app)
```

**الحل:**
1. اذهب إلى Auth0 Dashboard → APIs
2. أنشئ API جديد:
   - Name: `IBEX API`
   - Identifier: `https://api.ibex.app`
   - Signing Algorithm: `RS256`
   - Enable RBAC: ✅

---

## 📋 Checklist سريع

- [ ] Console يظهر `🔍 Auth0 Configuration Debug` مع القيم
- [ ] Network tab يظهر request إلى `authorize`
- [ ] `client_id` في Request يطابق Client ID في Auth0
- [ ] `redirect_uri` في Request يطابق Allowed Callback URLs في Auth0
- [ ] `audience` في Request يطابق API Identifier في Auth0
- [ ] Response Status = `302 Found` (نجح) وليس `400` أو `403` (فشل)

---

## 🆘 إذا استمرت المشكلة

1. **انسخ Request URL الكامل** من Network tab
2. **انسخ Response body** إذا كان هناك error
3. **تحقق من Auth0 Logs:**
   - Auth0 Dashboard → Monitoring → Logs
   - ابحث عن failed login attempts

---

**ملاحظة:** راجع `docs/AUTH0_REQUEST_DETAILS.md` للتفاصيل الكاملة عن جميع البيانات المرسلة.
