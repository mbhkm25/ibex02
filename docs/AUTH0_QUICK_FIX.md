# 🔧 إصلاح سريع لـ Auth0 في Vercel

## المشكلة الرئيسية

Callback URL في Auth0 لا يطابق الكود:
- ❌ Auth0 يتوقع: `/api/auth/callback`
- ✅ الكود يستخدم: `/callback`

---

## ✅ الحل السريع (3 خطوات)

### 1️⃣ تحديث Callback URLs في Auth0 Dashboard

اذهب إلى: [Auth0 Dashboard](https://manage.auth0.com/) → Applications → **blog-with-comments**

**Allowed Callback URLs:**
```
http://localhost:5173/callback
https://blog-with-comments-rosy-one.vercel.app/callback
```

**Allowed Logout URLs:**
```
http://localhost:5173
https://blog-with-comments-rosy-one.vercel.app
```

**Allowed Web Origins:**
```
http://localhost:5173
https://blog-with-comments-rosy-one.vercel.app
```

⚠️ **احذف:** `/api/auth/callback`  
✅ **أضف:** `/callback`

---

### 2️⃣ تحديث Environment Variables في Vercel

اذهب إلى: **Vercel Dashboard** → **Project Settings** → **Environment Variables**

**تحديث:**
```
VITE_AUTH0_CLIENT_ID=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
```

**تأكد من:**
```
VITE_AUTH0_DOMAIN=dev-0rlg3lescok8mwu0.us.auth0.com
VITE_AUTH0_AUDIENCE=https://api.ibex.app
```

---

### 3️⃣ تحديث `.env.local` محلياً

افتح `.env.local` وحدّث:

```env
VITE_AUTH0_CLIENT_ID=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
```

---

### 4️⃣ إعادة نشر المشروع

في Vercel Dashboard:
1. اذهب إلى **Deployments**
2. انقر على **Redeploy** للـ latest deployment

---

## ✅ التحقق النهائي

- [ ] Callback URLs في Auth0 = `/callback` ✅
- [ ] `VITE_AUTH0_CLIENT_ID` في Vercel = `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I` ✅
- [ ] `VITE_AUTH0_DOMAIN` في Vercel = `dev-0rlg3lescok8mwu0.us.auth0.com` (بدون `https://`) ✅
- [ ] تم إعادة نشر المشروع ✅

---

## 🧪 اختبار

1. افتح `https://blog-with-comments-rosy-one.vercel.app`
2. انقر على "تسجيل الدخول"
3. يجب أن يعمل! ✅

---

**ملاحظة:** إذا استمرت المشكلة، راجع `docs/AUTH0_VERCEL_INTEGRATION_FIX.md` للتفاصيل الكاملة.
