/**
 * Protected Route Component
 * 
 * Architecture: Route guard for authentication and authorization (RBAC)
 * 
 * Usage:
 * ```tsx
 * <Route path="/admin" element={
 *   <ProtectedRoute requiredRole={UserRole.ADMIN}>
 *     <AdminDashboard />
 *   </ProtectedRoute>
 * } />
 * ```
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRBAC } from '../../hooks/useRBAC';
import { UserRole, Permission } from '../../config/rbac';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // Legacy: Deprecated in favor of requiredRole
  requiredRole?: UserRole;
  requiredPermission?: Permission;
}

export function ProtectedRoute({ 
  children, 
  requireAdmin = false,
  requiredRole,
  requiredPermission 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasPermission } = useRBAC();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">جاري التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  // 1. Authentication Check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Authorization Checks
  
  // Legacy Admin Check
  if (requireAdmin && !hasRole(UserRole.ADMIN)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Role Check
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Permission Check
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Access Granted
  return <>{children}</>;
}
