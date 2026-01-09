/**
 * Auth Context Provider
 * 
 * Architecture: React Context for authentication state management
 * 
 * Responsibilities:
 * - Store authenticated user
 * - Provide login/logout functions
 * - Expose isAuthenticated, isAdmin
 * - Handle token refresh
 * - Auto-logout on token expiration
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  login as authLogin, 
  register as authRegister, 
  logout as authLogout,
  getCurrentUser,
  isAuthenticated as checkIsAuthenticated,
  isAdmin as checkIsAdmin,
  refreshAccessToken,
  AuthUser,
  AuthTokens
} from '../services/auth';
import { toast } from 'sonner';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (checkIsAuthenticated()) {
          const currentUser = getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authLogout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Check token expiration periodically
  useEffect(() => {
    if (!checkIsAuthenticated()) {
      setUser(null);
      return;
    }

    const interval = setInterval(() => {
      if (!checkIsAuthenticated()) {
        setUser(null);
        authLogout();
        toast.info('انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.');
        navigate('/login');
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await authLogin(email, password);
      const currentUser = getCurrentUser();
      setUser(currentUser);
      toast.success('تم تسجيل الدخول بنجاح');
      
      // Redirect based on role
      if (checkIsAdmin()) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'فشل تسجيل الدخول. يرجى التحقق من البيانات.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (email: string, password: string, phone?: string) => {
    try {
      setIsLoading(true);
      await authRegister(email, password, phone);
      const currentUser = getCurrentUser();
      setUser(currentUser);
      toast.success('تم إنشاء الحساب بنجاح');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/login');
  }, [navigate]);

  const refreshToken = useCallback(async () => {
    try {
      await refreshAccessToken();
      const currentUser = getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated: checkIsAuthenticated() && user !== null,
    isAdmin: checkIsAdmin(),
    isLoading,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 * 
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

