# ✅ Checklist: إصلاح Auth0 في Vercel

## 🔴 المشكلة: Auth0 يعمل على localhost:5173 لكنه لا يعمل على Vercel

---

## ✅ الحل السريع (5 دقائق)

### 1️⃣ Vercel Environment Variables

**اذهب إلى:** Vercel Dashboard → Project → Settings → Environment Variables

**أضف/تأكد من:**
```
VITE_AUTH0_DOMAIN=dev-0rlg3lescok8mwu0.us.auth0.com
VITE_AUTH0_CLIENT_ID=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
VITE_AUTH0_AUDIENCE=https://api.ibex.app
```

**⚠️ مهم:**
- تأكد من أن Environment = **Production** ✅
- بعد الإضافة، **أعد نشر** المشروع

---

### 2️⃣ Auth0 Dashboard - Callback URLs

**اذهب إلى:** [Auth0 Dashboard](https://manage.auth0.com/) → Applications → **blog-with-comments**

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

**⚠️ احذف:** `/api/auth/callback` إذا كان موجوداً

---

### 3️⃣ إعادة نشر المشروع

**في Vercel Dashboard:**
1. اذهب إلى **Deployments**
2. انقر على **Redeploy** للـ latest deployment
3. انتظر حتى يكتمل النشر

---

### 4️⃣ اختبار

1. افتح `https://blog-with-comments-rosy-one.vercel.app`
2. افتح Console (F12)
3. انقر على "تسجيل الدخول"
4. **يجب أن يعمل!** ✅

---

## 🔍 إذا لم يعمل - تحقق من:

### Console (F12)
- ❌ `Missing Auth0 environment variables` → Environment Variables غير موجودة
- ❌ `Invalid redirect_uri` → Callback URL غير متطابق
- ❌ `Invalid client` → Client ID غير صحيح

### Network Tab (F12)
- ❌ `401 Unauthorized` → مشكلة في Client ID أو Domain
- ❌ `403 Forbidden` → مشكلة في Callback URL

---

## 📚 للمزيد من التفاصيل

راجع: `docs/AUTH0_VERCEL_DEBUG.md`

---

**ملاحظة:** إذا كان domain Vercel مختلفاً عن `blog-with-comments-rosy-one.vercel.app`، استبدله بالقيمة الصحيحة في Auth0 Dashboard.
