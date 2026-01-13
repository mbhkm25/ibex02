# RBAC Implementation Guide

## ✅ ما تم إنجازه

### 1. العقد (Contract)
- ✅ `docs/RBAC_CONTRACT.md` - المصدر الوحيد للحقيقة

### 2. Frontend RBAC
- ✅ `src/app/config/rbac.ts` - تعريف الأدوار والصلاحيات
- ✅ `src/app/hooks/useRBAC.ts` - Hook للتحقق من الصلاحيات
- ✅ `src/app/components/auth/PermissionGuard.tsx` - مكون لإخفاء/إظهار العناصر
- ✅ `src/app/components/auth/ProtectedRoute.tsx` - حماية المسارات

### 3. Backend RBAC
- ✅ `api/_rbac.ts` - تعريف الأدوار والصلاحيات (مطابق للعقد)
- ✅ `api/_auth.ts` - دوال التحقق: `requirePermission`, `requireRole`

---

## 📖 كيفية الاستخدام

### Frontend

#### 1. حماية Route
```tsx
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './config/rbac';

<Route path="/admin" element={
  <ProtectedRoute requiredRole={UserRole.ADMIN}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

#### 2. إخفاء/إظهار عنصر
```tsx
import { PermissionGuard } from './components/auth/PermissionGuard';
import { Permission } from './config/rbac';

<PermissionGuard requiredPermission={Permission.MANAGE_USERS}>
  <DeleteUserButton />
</PermissionGuard>
```

#### 3. التحقق في Component
```tsx
import { useRBAC } from './hooks/useRBAC';
import { Permission } from './config/rbac';

function MyComponent() {
  const { hasPermission, hasRole } = useRBAC();
  
  if (hasPermission(Permission.MANAGE_STORE)) {
    // Show store management UI
  }
}
```

### Backend

#### 1. حماية API Endpoint
```ts
import { requirePermission } from './_auth';
import { Permission } from './_rbac';

export default async function handler(req, res) {
  // Check permission
  await requirePermission(req, Permission.MANAGE_USERS);
  
  // Your logic here
}
```

#### 2. التحقق من Role
```ts
import { requireRole } from './_auth';
import { UserRole } from './_rbac';

export default async function handler(req, res) {
  await requireRole(req, UserRole.ADMIN);
  // ...
}
```

---

## ⚠️ قواعد إلزامية

1. **لا تستخدم `if(user.roles?.includes('admin'))` مباشرة**
   - استخدم `hasRole(UserRole.ADMIN)` أو `hasPermission(Permission.VIEW_ADMIN_DASHBOARD)`

2. **لا تضيف صلاحيات جديدة دون تعديل `RBAC_CONTRACT.md` أولاً**

3. **Backend ≠ Frontend**
   - Frontend RBAC للـ UX فقط
   - Backend RBAC هو الحماية الحقيقية
   - **يجب** التحقق في Backend دائماً

4. **في حال التعارض: العقد يتغلب**

---

## 🔄 إضافة Role جديد

1. **عدّل `docs/RBAC_CONTRACT.md`** أولاً
2. **عدّل `src/app/config/rbac.ts`** (Frontend)
3. **عدّل `api/_rbac.ts`** (Backend)
4. **تأكد من التطابق** بين الثلاثة

---

**Last Updated:** 2024-01-20
