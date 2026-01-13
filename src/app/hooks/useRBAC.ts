import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../config/rbac';

/**
 * Hook for Role-Based Access Control logic
 * Decouples components from Auth0 structure.
 */
export function useRBAC() {
  const { user } = useAuth();

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((role: UserRole | string): boolean => {
    if (!user || !user.roles) return false;
    return user.roles.includes(role);
  }, [user]);

  /**
   * Check if user has a specific permission
   * This is preferred over hasRole for granular control.
   */
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user || !user.roles) return false;

    // Check all user roles for the required permission
    return user.roles.some((roleName) => {
      // Cast string role from Auth0 to our Enum
      // Note: Auth0 roles might be strings, we match them to our config
      const mappedRole = Object.values(UserRole).find(r => r === roleName);
      if (!mappedRole) return false;

      const permissions = ROLE_PERMISSIONS[mappedRole];
      return permissions?.includes(permission);
    });
  }, [user]);

  return { hasRole, hasPermission };
}
