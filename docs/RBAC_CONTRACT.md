# RBAC Contract – IBEX

**⚠️ هذا الملف هو المصدر الوحيد للحقيقة (Single Source of Truth) للأدوار والصلاحيات.**

**القواعد الإلزامية:**
- ❌ **يمنع** إنشاء أي role أو permission خارج هذا العقد
- ✅ **يجب** ربط أي route أو component بـ `useRBAC`
- ❌ **يمنع** استخدام `if(user.role === ...)` مباشرة
- ✅ **يجب** تعديل هذا الملف أولاً قبل إضافة صلاحيات جديدة
- 🔐 **في حال التعارض:** العقد يتغلب على أي منطق آخر

---

## Roles

### admin
**Identifier:** `admin`  
**Description:** إدارة النظام الكاملة  
**Source:** Auth0 Role

### business_owner
**Identifier:** `merchant` (في الكود)  
**Description:** مالك عمل تجاري  
**Source:** Auth0 Role (يتم تعيينه عند تفعيل العمل)

### staff
**Identifier:** `manager` أو `cashier` (حسب الصلاحيات)  
**Description:** موظف مرتبط بعمل تجاري  
**Source:** Auth0 Role (يتم تعيينه من قبل business_owner)

### user
**Identifier:** `user`  
**Description:** عميل نهائي (End Consumer)  
**Source:** Auth0 Role (افتراضي لجميع المستخدمين)

---

## Role Responsibilities

### admin
- ✅ Full system access
- ✅ User management (`manage:users`)
- ✅ Approve service requests (`approve:requests`)
- ✅ Financial oversight
- ✅ System settings
- ✅ View all analytics (`view:store_analytics`)

**Routes:**
- `/admin/*` (جميع المسارات)

**Permissions:**
- `view:admin_dashboard`
- `manage:users`
- `approve:requests`
- `view:store_analytics`

---

### business_owner (merchant)
- ✅ Own business only (يستطيع إدارة أعماله فقط)
- ✅ Wallet access (read/write) (`view:wallet`)
- ✅ Staff management (إدارة الموظفين)
- ✅ Reports (`view:store_analytics`)
- ✅ Product management (`manage:products`)
- ✅ Offers management (`manage:offers`)
- ✅ POS access (`access:pos`)

**Routes:**
- `/business/*` (جميع مسارات الأعمال)

**Permissions:**
- `create:store`
- `manage:store`
- `view:store_analytics`
- `manage:products`
- `manage:offers`
- `access:pos`
- `view:wallet`

---

### staff
**Sub-roles:**
- **manager:** صلاحيات عالية (إدارة + POS)
- **cashier:** صلاحيات محدودة (POS فقط)

#### manager
- ✅ Store management (`manage:store`)
- ✅ Product management (`manage:products`)
- ✅ Offers management (`manage:offers`)
- ✅ POS operations (`access:pos`)
- ✅ Process refunds (`process:refunds`)
- ❌ No settings access
- ❌ Cannot create new stores

**Permissions:**
- `manage:store`
- `manage:products`
- `manage:offers`
- `access:pos`
- `process:refunds`

#### cashier
- ✅ POS operations only (`access:pos`)
- ❌ No product management
- ❌ No settings access
- ❌ No refunds

**Permissions:**
- `access:pos`

**Routes:**
- `/cashier/:storeId`

---

### user
- ✅ Wallet (read-only) (`view:wallet`)
- ✅ Make payments (`make:payments`)
- ✅ Orders (view own orders)
- ✅ Profile management
- ✅ Request to become merchant (`create:store` - للطلب فقط)

**Permissions:**
- `view:wallet`
- `make:payments`
- `create:store` (للطلب فقط، يحتاج موافقة admin)

**Routes:**
- `/dashboard`
- `/wallet/:storeId`
- `/explore`
- `/subscriptions`
- `/scan/*`

---

## Permissions Reference

| Permission | Description | Roles |
|------------|-------------|-------|
| `view:admin_dashboard` | Access admin panel | admin |
| `manage:users` | Create/edit/delete users | admin |
| `approve:requests` | Approve service requests | admin |
| `create:store` | Request new business | user, merchant |
| `manage:store` | Full store management | merchant, manager |
| `view:store_analytics` | View business reports | admin, merchant |
| `manage:products` | CRUD products | merchant, manager |
| `manage:offers` | CRUD offers | merchant, manager |
| `access:pos` | Use POS system | merchant, manager, cashier |
| `process:refunds` | Process refunds | merchant, manager |
| `view:wallet` | View wallet balance | merchant, user |
| `make:payments` | Make payments | user |

---

## Implementation Rules

### Frontend
1. **Always use `useRBAC` hook:**
   ```tsx
   const { hasPermission, hasRole } = useRBAC();
   if (hasPermission(Permission.MANAGE_STORE)) { ... }
   ```

2. **Never use direct role checks:**
   ```tsx
   // ❌ WRONG
   if (user.roles?.includes('admin')) { ... }
   
   // ✅ CORRECT
   if (hasRole(UserRole.ADMIN)) { ... }
   ```

3. **Use `PermissionGuard` for conditional rendering:**
   ```tsx
   <PermissionGuard requiredPermission={Permission.MANAGE_USERS}>
     <DeleteButton />
   </PermissionGuard>
   ```

4. **Use `ProtectedRoute` for route protection:**
   ```tsx
   <Route path="/admin" element={
     <ProtectedRoute requiredRole={UserRole.ADMIN}>
       <AdminDashboard />
     </ProtectedRoute>
   } />
   ```

### Backend
1. **Always verify in `api/_auth.ts`:**
   ```ts
   const user = await requireAuth(req);
   if (!hasPermission(user, Permission.MANAGE_USERS)) {
     throw new Error('FORBIDDEN');
   }
   ```

2. **Never trust frontend claims:**
   - Always re-verify roles from JWT token
   - Never accept role/permission from request body

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2024-01-20 | Initial contract | System |

---

**Last Updated:** 2024-01-20  
**Version:** 1.0
