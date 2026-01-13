/**
 * Backend RBAC Configuration
 * 
 * ⚠️ MUST match docs/RBAC_CONTRACT.md and src/app/config/rbac.ts
 * 
 * This is the backend enforcement layer.
 * Frontend RBAC is for UX only, this is the REAL gatekeeper.
 */

// Permissions (Must match frontend)
export enum Permission {
  VIEW_ADMIN_DASHBOARD = 'view:admin_dashboard',
  MANAGE_USERS = 'manage:users',
  APPROVE_REQUESTS = 'approve:requests',
  CREATE_STORE = 'create:store',
  MANAGE_STORE = 'manage:store',
  VIEW_STORE_ANALYTICS = 'view:store_analytics',
  MANAGE_PRODUCTS = 'manage:products',
  MANAGE_OFFERS = 'manage:offers',
  ACCESS_POS = 'access:pos',
  PROCESS_REFUNDS = 'process:refunds',
  VIEW_WALLET = 'view:wallet',
  MAKE_PAYMENTS = 'make:payments',
}

// Roles (Must match frontend)
export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  CUSTOMER = 'user',
}

// Role -> Permissions Mapping (Must match frontend)
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_ADMIN_DASHBOARD,
    Permission.MANAGE_USERS,
    Permission.APPROVE_REQUESTS,
    Permission.VIEW_STORE_ANALYTICS,
  ],
  [UserRole.MERCHANT]: [
    Permission.CREATE_STORE,
    Permission.MANAGE_STORE,
    Permission.VIEW_STORE_ANALYTICS,
    Permission.MANAGE_PRODUCTS,
    Permission.MANAGE_OFFERS,
    Permission.ACCESS_POS,
    Permission.VIEW_WALLET,
  ],
  [UserRole.MANAGER]: [
    Permission.MANAGE_STORE,
    Permission.MANAGE_PRODUCTS,
    Permission.MANAGE_OFFERS,
    Permission.ACCESS_POS,
    Permission.PROCESS_REFUNDS,
  ],
  [UserRole.CASHIER]: [
    Permission.ACCESS_POS,
  ],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_WALLET,
    Permission.MAKE_PAYMENTS,
    Permission.CREATE_STORE, // For requesting, needs admin approval
  ],
};

/**
 * Check if user has a specific role
 */
export function hasRole(userRoles: string[], role: UserRole | string): boolean {
  return userRoles.includes(role);
}

/**
 * Check if user has a specific permission
 * This is the main authorization function.
 */
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  if (!userRoles || userRoles.length === 0) return false;

  // Check all user roles for the required permission
  return userRoles.some((roleName) => {
    // Map string role to enum
    const mappedRole = Object.values(UserRole).find(r => r === roleName);
    if (!mappedRole) return false;

    const permissions = ROLE_PERMISSIONS[mappedRole];
    return permissions?.includes(permission);
  });
}
