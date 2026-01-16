# 🔍 تفاصيل طلب Auth0 - جميع البيانات المرسلة

## 📋 نظرة عامة

عند الضغط على "تسجيل الدخول"، يتم إرسال طلب إلى Auth0 مع البيانات التالية:

---

## 🌐 URL الكامل

### Authorization Endpoint

```
https://dev-0rlg3lescok8mwu0.us.auth0.com/authorize
```

**المصدر:**
- Domain: `import.meta.env.VITE_AUTH0_DOMAIN` = `dev-0rlg3lescok8mwu0.us.auth0.com`
- Auth0 SDK يضيف `/authorize` تلقائياً

---

## 📤 Query Parameters (المعاملات المرسلة)

### 1. `response_type`
```
response_type=code
```
**القيمة:** دائماً `code` (Authorization Code Flow)

---

### 2. `client_id`
```
client_id=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
```
**المصدر:** `import.meta.env.VITE_AUTH0_CLIENT_ID`

**القيمة الحالية:**
- من Vercel Integration: `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- القديم (غير مستخدم): `1mW18IG95RJRXGpYfQWI4OJ1TTtQz7ez`

**⚠️ يجب أن يطابق:** Client ID في Auth0 Dashboard → Applications → **blog-with-comments**

---

### 3. `redirect_uri`
```
redirect_uri=https://blog-with-comments-rosy-one.vercel.app/callback
```
**المصدر:** `window.location.origin + "/callback"`

**القيمة الحالية:**
- في Production: `https://blog-with-comments-rosy-one.vercel.app/callback`
- في Development: `http://localhost:5173/callback`

**⚠️ يجب أن يطابق:** Allowed Callback URLs في Auth0 Dashboard

**الكود:**
```typescript
// src/app/contexts/AuthContext.tsx:219
const redirectUri = window.location.origin + "/callback";
```

---

### 4. `audience`
```
audience=https://api.ibex.app
```
**المصدر:** `import.meta.env.VITE_AUTH0_AUDIENCE`

**القيمة الحالية:** `https://api.ibex.app`

**⚠️ يجب أن يطابق:** API Identifier في Auth0 Dashboard → APIs

---

### 5. `scope`
```
scope=openid profile email offline_access
```
**المصدر:** Auth0 SDK default + `useRefreshTokens={true}`

**القيمة:** 
- `openid` - OpenID Connect
- `profile` - User profile information
- `email` - User email
- `offline_access` - Refresh tokens (لأن `useRefreshTokens={true}`)

**الكود:**
```typescript
// src/app/contexts/AuthContext.tsx:235
useRefreshTokens={true}  // يضيف offline_access تلقائياً
```

---

### 6. `state`
```
state=<random-string>
```
**المصدر:** Auth0 SDK يولدها تلقائياً

**الغرض:** CSRF protection - يتم التحقق منها عند callback

---

### 7. `code_challenge` و `code_challenge_method` (PKCE)
```
code_challenge=<base64-url-encoded-sha256-hash>
code_challenge_method=S256
```
**المصدر:** Auth0 SDK يولدها تلقائياً (PKCE)

**الغرض:** Security enhancement للـ Authorization Code Flow

---

## 📋 URL الكامل (مثال)

```
https://dev-0rlg3lescok8mwu0.us.auth0.com/authorize?
  response_type=code
  &client_id=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
  &redirect_uri=https://blog-with-comments-rosy-one.vercel.app/callback
  &audience=https://api.ibex.app
  &scope=openid profile email offline_access
  &state=<random-state>
  &code_challenge=<pkce-challenge>
  &code_challenge_method=S256
```

---

## 🔧 الإعدادات من الكود

### Auth0Provider Configuration

```typescript
// src/app/contexts/AuthContext.tsx:227-236
<Auth0Provider
  domain={auth0Domain || ""}                    // dev-0rlg3lescok8mwu0.us.auth0.com
  clientId={auth0ClientId || ""}                // 7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I
  authorizationParams={{
    redirect_uri: redirectUri,                  // window.location.origin + "/callback"
    audience: auth0Audience || "",               // https://api.ibex.app
  }}
  cacheLocation="localstorage"                   // تخزين tokens في localStorage
  useRefreshTokens={true}                        // تفعيل refresh tokens
>
```

---

## 📊 Environment Variables المستخدمة

### Frontend (Vite)

| Variable | القيمة الحالية | المصدر |
|----------|----------------|--------|
| `VITE_AUTH0_DOMAIN` | `dev-0rlg3lescok8mwu0.us.auth0.com` | Vercel Environment Variables |
| `VITE_AUTH0_CLIENT_ID` | `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I` | Vercel Environment Variables |
| `VITE_AUTH0_AUDIENCE` | `https://api.ibex.app` | Vercel Environment Variables |

**⚠️ مهم:**
- يجب أن تكون موجودة في **Production** environment في Vercel
- `VITE_AUTH0_DOMAIN` **بدون** `https://` و**بدون** `/` في النهاية

---

## 🔄 Flow الكامل

### 1. User Clicks "تسجيل الدخول"

```typescript
// src/app/components/auth/LoginScreen.tsx:25
onClick={() => login()}
```

### 2. login() Function

```typescript
// src/app/contexts/AuthContext.tsx:98-100
const login = async () => {
  await loginWithRedirect();
};
```

### 3. Auth0 SDK Redirects

Auth0 SDK يقوم بـ:
1. توليد `state` و `code_challenge`
2. بناء URL كامل مع جميع المعاملات
3. Redirect المتصفح إلى Auth0

### 4. User Authenticates

المستخدم يسجل الدخول في Auth0 Dashboard

### 5. Auth0 Redirects Back

```
https://blog-with-comments-rosy-one.vercel.app/callback?
  code=<authorization-code>
  &state=<same-state-from-step-3>
```

### 6. CallbackPage Handles

```typescript
// src/app/components/auth/CallbackPage.tsx
// Auth0 SDK يتبادل authorization code مع access token
// ثم redirects إلى /dashboard
```

---

## 🧪 كيفية التحقق من البيانات المرسلة

### 1. في Browser Console

افتح Console (F12) واكتب:
```javascript
console.log({
  domain: import.meta.env.VITE_AUTH0_DOMAIN,
  clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
  audience: import.meta.env.VITE_AUTH0_AUDIENCE,
  redirectUri: window.location.origin + "/callback",
});
```

### 2. في Network Tab

1. افتح Network tab (F12 → Network)
2. انقر على "تسجيل الدخول"
3. ابحث عن request إلى `authorize` في domain `dev-0rlg3lescok8mwu0.us.auth0.com`
4. انقر على Request → Headers → Query String Parameters

**سترى:**
- `response_type=code`
- `client_id=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- `redirect_uri=https://blog-with-comments-rosy-one.vercel.app/callback`
- `audience=https://api.ibex.app`
- `scope=openid profile email offline_access`
- `state=...`
- `code_challenge=...`
- `code_challenge_method=S256`

---

## ✅ Checklist للتحقق

### في Vercel Environment Variables:

- [ ] `VITE_AUTH0_DOMAIN` = `dev-0rlg3lescok8mwu0.us.auth0.com` (بدون `https://`)
- [ ] `VITE_AUTH0_CLIENT_ID` = `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- [ ] `VITE_AUTH0_AUDIENCE` = `https://api.ibex.app`
- [ ] Environment = **Production** ✅

### في Auth0 Dashboard:

- [ ] **Application:** `blog-with-comments`
- [ ] **Client ID:** `7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- [ ] **Allowed Callback URLs:** يحتوي على `https://blog-with-comments-rosy-one.vercel.app/callback`
- [ ] **Allowed Logout URLs:** يحتوي على `https://blog-with-comments-rosy-one.vercel.app`
- [ ] **Allowed Web Origins:** يحتوي على `https://blog-with-comments-rosy-one.vercel.app`
- [ ] **API:** موجود مع Identifier = `https://api.ibex.app`

---

## 🐛 المشاكل الشائعة

### المشكلة 1: `Invalid redirect_uri`

**السبب:** `redirect_uri` في الطلب لا يطابق Allowed Callback URLs

**التحقق:**
- في Network tab، تحقق من قيمة `redirect_uri` في الطلب
- في Auth0 Dashboard، تحقق من Allowed Callback URLs

**الحل:**
- أضف `redirect_uri` من الطلب إلى Allowed Callback URLs في Auth0

---

### المشكلة 2: `Invalid client`

**السبب:** `client_id` في الطلب لا يطابق Client ID في Auth0

**التحقق:**
- في Network tab، تحقق من قيمة `client_id` في الطلب
- في Auth0 Dashboard، تحقق من Client ID

**الحل:**
- تأكد من أن `VITE_AUTH0_CLIENT_ID` في Vercel يطابق Client ID في Auth0

---

### المشكلة 3: `Service not found`

**السبب:** `audience` في الطلب لا يطابق API Identifier

**التحقق:**
- في Network tab، تحقق من قيمة `audience` في الطلب
- في Auth0 Dashboard → APIs، تحقق من Identifier

**الحل:**
- تأكد من وجود API مع Identifier = `https://api.ibex.app`
- أو غيّر `VITE_AUTH0_AUDIENCE` لتطابق API Identifier الموجود

---

## 📝 ملخص سريع

**URL:** `https://dev-0rlg3lescok8mwu0.us.auth0.com/authorize`

**Parameters:**
- `response_type=code`
- `client_id=7Uuu5H2wBZ1nCetryZ3OlYsKvZDQE15I`
- `redirect_uri=https://blog-with-comments-rosy-one.vercel.app/callback`
- `audience=https://api.ibex.app`
- `scope=openid profile email offline_access`
- `state=<random>`
- `code_challenge=<pkce>`
- `code_challenge_method=S256`

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-20  
**Status**: ✅ Complete Request Details
