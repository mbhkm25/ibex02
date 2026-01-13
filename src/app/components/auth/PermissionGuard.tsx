import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';
import { Permission, UserRole } from '../../config/rbac';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render content based on RBAC.
 * 
 * Usage:
 * <PermissionGuard requiredPermission={Permission.MANAGE_USERS}>
 *   <DeleteUserButton />
 * </PermissionGuard>
 */
export function PermissionGuard({ 
  children, 
  requiredPermission, 
  requiredRole, 
  fallback = null 
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = useRBAC();

  // 1. Check Role Requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <>{fallback}</>;
  }

  // 2. Check Permission Requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <>{fallback}</>;
  }

  // 3. Access Granted
  return <>{children}</>;
}
