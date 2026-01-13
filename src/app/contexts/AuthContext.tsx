import React, { createContext, useContext, useEffect, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';

export interface AuthUser {
  id: string; // Neon UUID
  auth0Id?: string; // Auth0 sub
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

/**
 * Inner Auth Provider - Uses Auth0 hooks
 * Must be inside Auth0Provider
 */
function AuthProviderInner({ children }: { children: React.ReactNode }) {
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
    const initAuth = async () => {
      if (isAuthenticated && auth0User) {
        // Map Auth0 user to our AuthUser structure
        const namespace = 'https://api.ibex.app/roles';
        const roles = (auth0User[namespace] as string[]) || (auth0User['roles'] as string[]) || [];
        
        const newUser = {
          id: auth0User.sub || '',
          email: auth0User.email,
          name: auth0User.name,
          picture: auth0User.picture,
          roles: roles,
          email_verified: auth0User.email_verified,
          sub: auth0User.sub,
          ...auth0User
        };
        
        setUser(newUser);

        // Call Bootstrap Endpoint to sync user with Neon DB
        try {
          const token = await getAccessTokenSilently();
          await fetch('/api/auth/bootstrap', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
          .then(res => res.json())
          .then(data => {
            if (data.ok && data.user) {
              // Update user with Neon DB ID
              setUser(prev => prev ? { 
                ...prev, 
                id: data.user.id, // Use Neon UUID as primary ID
                auth0Id: prev.sub // Keep Auth0 ID reference
              } : null);
            }
          });
        } catch (err) {
          console.error('Failed to bootstrap user:', err);
        }
      } else {
        setUser(null);
      }
    };

    initAuth();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

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

/**
 * Outer Auth Provider - Wraps Auth0Provider
 * This is the main entry point for authentication
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Validate environment variables
  const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const auth0Audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  // Critical: Validate domain format (no https://, no trailing slash)
  if (auth0Domain && (auth0Domain.startsWith('https://') || auth0Domain.endsWith('/'))) {
    console.error('❌ VITE_AUTH0_DOMAIN must be domain only (e.g., dev-xxx.us.auth0.com), not URL');
  }

  if (!auth0Domain || !auth0ClientId || !auth0Audience) {
    const missing = [];
    if (!auth0Domain) missing.push('VITE_AUTH0_DOMAIN');
    if (!auth0ClientId) missing.push('VITE_AUTH0_CLIENT_ID');
    if (!auth0Audience) missing.push('VITE_AUTH0_AUDIENCE');
    
    console.error('❌ Missing Auth0 environment variables:', missing.join(', '));
    console.error('Please set these variables in Vercel or .env.local');
    
    // Show error message in production
    if (import.meta.env.PROD) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', textAlign: 'center', padding: '20px' }}>
          <div>
            <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>Configuration Error</h1>
            <p style={{ color: '#6b7280', marginBottom: '8px' }}>Missing Auth0 environment variables:</p>
            <p style={{ color: '#374151', fontFamily: 'monospace', background: '#f3f4f6', padding: '8px', borderRadius: '4px' }}>
              {missing.join(', ')}
            </p>
            <p style={{ color: '#6b7280', marginTop: '16px', fontSize: '14px' }}>
              Please configure these in Vercel Dashboard → Settings → Environment Variables
            </p>
          </div>
        </div>
      );
    }
  }

  // Critical: redirect_uri must match CallbackPage route
  const redirectUri = window.location.origin + "/callback";

  return (
    <Auth0Provider
      domain={auth0Domain || ""}
      clientId={auth0ClientId || ""}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: auth0Audience || "",
      }}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </Auth0Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
