# هيكل ملفات المصادقة (Authentication File Structure)

## 📁 الهيكل الحالي (Current Structure)

### Backend (API Layer)

```
api/
├── _auth.ts              # 🔐 JWT Verification Middleware (Shared)
└── auth/
    └── bootstrap.ts      # 👤 User Bootstrap Endpoint
```

#### `api/_auth.ts` (Middleware)
**الغرض:** ملف مساعد مشترك (shared utility) لجميع API endpoints
- ✅ JWT verification using Auth0 JWKS
- ✅ `requireAuth(req)` - التحقق من المصادقة
- ✅ `requireRole(req, role)` - التحقق من الدور
- ✅ `requirePermission(req, permission)` - التحقق من الصلاحية
- ✅ `AuthUser` interface definition

**لماذا `_auth.ts` وليس `auth.ts`؟**
- البادئة `_` تشير إلى أنه ملف مساعد (utility) وليس endpoint
- يُستورد في جميع API endpoints: `import { requireAuth } from '../_auth'`

#### `api/auth/bootstrap.ts` (Endpoint)
**الغرض:** API endpoint لإنشاء/مزامنة المستخدم في قاعدة البيانات
- ✅ `POST /api/auth/bootstrap` - يربط Auth0 user مع Neon DB user
- ✅ يُستدعى بعد تسجيل الدخول الناجح
- ✅ يضمن وجود user في جدول `users`

---

### Frontend (React Layer)

```
src/app/
├── contexts/
│   └── AuthContext.tsx   # 🔄 Auth State Management
└── components/
    └── auth/
        ├── LoginScreen.tsx
        ├── RegisterScreen.tsx
        ├── CallbackPage.tsx
        └── ProtectedRoute.tsx
```

#### `src/app/contexts/AuthContext.tsx`
**الغرض:** React Context لإدارة حالة المصادقة
- ✅ يستخدم `@auth0/auth0-react` SDK
- ✅ يوفر `useAuth()` hook
- ✅ يدير `user`, `isAuthenticated`, `isLoading`
- ✅ يستدعي `/api/auth/bootstrap` بعد تسجيل الدخول

**لماذا Context وليس Service؟**
- ✅ React Context = State Management (حالة)
- ✅ Service = Business Logic (منطق العمل)
- ✅ Auth0 SDK يتعامل مع كل شيء، Context فقط يغلفه

---

## ❌ الملفات المحذوفة (Deleted Files)

### `src/app/services/auth.ts` (محذوف)
**السبب:** تم استبداله بـ `@auth0/auth0-react` SDK

**ما كان يفعله:**
- ❌ إدارة tokens يدوياً في `sessionStorage`
- ❌ استدعاء Neon Auth endpoints مباشرة
- ❌ فك تشفير JWT يدوياً

**ما حل محله:**
- ✅ `@auth0/auth0-react` SDK يدير كل شيء تلقائياً
- ✅ `AuthContext.tsx` يستخدم SDK فقط

---

## 🔄 التدفق (Flow)

### 1. تسجيل الدخول (Login Flow)

```
User clicks "Login"
    ↓
LoginScreen.tsx → login()
    ↓
AuthContext.tsx → loginWithRedirect() (Auth0 SDK)
    ↓
Auth0 Dashboard (External)
    ↓
CallbackPage.tsx → /callback
    ↓
AuthContext.tsx → getAccessTokenSilently()
    ↓
AuthContext.tsx → POST /api/auth/bootstrap
    ↓
api/auth/bootstrap.ts → requireAuth() → api/_auth.ts
    ↓
Database: Create/Update user in `users` table
    ↓
Redirect to /dashboard
```

### 2. API Request Flow

```
Frontend Component
    ↓
useAuth() → getAccessToken()
    ↓
API Request with Authorization: Bearer <token>
    ↓
api/any-endpoint.ts → requireAuth(req)
    ↓
api/_auth.ts → verifyToken(token)
    ↓
Auth0 JWKS → Verify JWT signature
    ↓
Return AuthUser
    ↓
API Endpoint continues with authenticated user
```

---

## 📊 مقارنة الهيكل

### ❌ الهيكل القديم (Neon Auth - محذوف)

```
api/
├── auth/
│   ├── login.ts          # ❌ محذوف
│   └── register.ts       # ❌ محذوف
└── _auth.ts              # ✅ موجود (محدث لـ Auth0)

src/app/
├── services/
│   └── auth.ts           # ❌ محذوف
└── contexts/
    └── AuthContext.tsx   # ✅ موجود (محدث لـ Auth0)
```

### ✅ الهيكل الحالي (Auth0)

```
api/
├── _auth.ts              # ✅ JWT Verification (Auth0)
└── auth/
    └── bootstrap.ts      # ✅ User Sync Endpoint

src/app/
├── contexts/
│   └── AuthContext.tsx   # ✅ Auth0 SDK Wrapper
└── components/
    └── auth/
        ├── LoginScreen.tsx    # ✅ Auth0 Redirect
        ├── RegisterScreen.tsx # ✅ Auth0 Redirect
        └── CallbackPage.tsx   # ✅ Auth0 Callback Handler
```

---

## 🎯 لماذا هذا الهيكل؟

### 1. **Backend Separation**
- `_auth.ts` = Shared utility (يُستخدم في كل مكان)
- `auth/bootstrap.ts` = Specific endpoint (endpoint محدد)

### 2. **Frontend Simplification**
- `AuthContext.tsx` = State management فقط
- لا حاجة لـ `auth.ts` service لأن Auth0 SDK يتعامل مع كل شيء

### 3. **Security**
- ✅ JWT verification في backend فقط (`api/_auth.ts`)
- ✅ Frontend لا يثق في claims (يستخدم SDK فقط)
- ✅ Database = Source of truth

---

## 📝 ملاحظات مهمة

1. **`_auth.ts` ليس مكرر:**
   - هو ملف مساعد مشترك
   - البادئة `_` تشير إلى utility file
   - يُستورد في جميع API endpoints

2. **`auth/bootstrap.ts` ليس مكرر:**
   - هو endpoint محدد (`/api/auth/bootstrap`)
   - يختلف عن `_auth.ts` (middleware)

3. **`AuthContext.tsx` ليس مكرر:**
   - هو React Context فقط
   - لا يحتوي على business logic
   - يغلف Auth0 SDK فقط

---

## ✅ الخلاصة

**الهيكل الحالي صحيح ولا يوجد تكرار:**
- ✅ `api/_auth.ts` = Backend middleware (shared)
- ✅ `api/auth/bootstrap.ts` = Backend endpoint (specific)
- ✅ `src/app/contexts/AuthContext.tsx` = Frontend state (wrapper)

**الملفات المحذوفة:**
- ❌ `src/app/services/auth.ts` (استُبدل بـ Auth0 SDK)
- ❌ `api/auth/login.ts` (Auth0 يتعامل معه)
- ❌ `api/auth/register.ts` (Auth0 يتعامل معه)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-20  
**Status**: ✅ Current Structure
