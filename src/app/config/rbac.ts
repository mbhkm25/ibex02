/**
 * Role-Based Access Control (RBAC) Configuration
 * 
 * ⚠️ IMPORTANT: This file MUST match docs/RBAC_CONTRACT.md
 * Any changes here MUST be reflected in the contract first.
 * 
 * Central source of truth for Roles and Permissions.
 * Auth0 provides the ROLE, but the Application defines what that Role CAN DO.
 */

// 1. Define Roles (Must match Auth0 Roles AND RBAC_CONTRACT.md)
export enum UserRole {
  ADMIN = 'admin',
  MERCHANT = 'merchant', // business_owner in contract
  MANAGER = 'manager',   // staff (high privileges) in contract
  CASHIER = 'cashier',   // staff (limited) in contract
  CUSTOMER = 'user',     // user in contract
}

// 2. Define Permissions (Granular Capabilities)
export enum Permission {
  // Admin Scopes
  VIEW_ADMIN_DASHBOARD = 'view:admin_dashboard',
  MANAGE_USERS = 'manage:users',
  APPROVE_REQUESTS = 'approve:requests',

  // Business Management
  CREATE_STORE = 'create:store',
  MANAGE_STORE = 'manage:store',
  VIEW_STORE_ANALYTICS = 'view:store_analytics',
  
  // Products & Inventory
  MANAGE_PRODUCTS = 'manage:products',
  MANAGE_OFFERS = 'manage:offers',

  // Operations
  ACCESS_POS = 'access:pos',
  PROCESS_REFUNDS = 'process:refunds',

  // Customer Scopes
  VIEW_WALLET = 'view:wallet',
  MAKE_PAYMENTS = 'make:payments',
}

// 3. Role -> Permissions Mapping
// This allows scalability. Adding a "Supervisor" role later is just adding a line here.
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
    Permission.CREATE_STORE, // Customers can request to become merchants
  ],
};
