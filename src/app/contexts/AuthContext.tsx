import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
  roles?: string[];
  email_verified?: boolean;
  sub?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => void;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (isAuthenticated && auth0User) {
        // Map Auth0 user to our AuthUser structure
        // Assuming roles are added to the token or user profile via namespace
        const namespace = 'https://api.ibex.app/roles'; // Or generic 'roles' if added directly
        const roles = (auth0User[namespace] as string[]) || (auth0User['roles'] as string[]) || [];
        
        setUser({
            id: auth0User.sub || '',
            email: auth0User.email,
            name: auth0User.name,
            picture: auth0User.picture,
            roles: roles,
            email_verified: auth0User.email_verified,
            sub: auth0User.sub,
            ...auth0User
        });
    } else {
        setUser(null);
    }
  }, [isAuthenticated, auth0User]);

  const login = async () => {
    await loginWithRedirect();
  };

  const register = async () => {
    await loginWithRedirect({ 
        authorizationParams: {
            screen_hint: 'signup',
        }
    });
  };

  const logout = () => {
    auth0Logout({ 
        logoutParams: {
            returnTo: window.location.origin 
        }
    });
  };

  const getAccessToken = async () => {
    return await getAccessTokenSilently();
  };

  // Check admin role
  const isAdmin = user?.roles?.includes('admin') || false;

  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
      );
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin,
    isLoading,
    login,
    register,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
