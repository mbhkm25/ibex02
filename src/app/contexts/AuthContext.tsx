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
          const response = await fetch('/api/auth/bootstrap', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          // Check if response is OK
          if (!response.ok) {
            const errorText = await response.text();
            console.error('Bootstrap failed:', response.status, errorText);
            // Try to parse as JSON, fallback to text
            try {
              const errorData = JSON.parse(errorText);
              console.error('Bootstrap error details:', errorData);
            } catch {
              console.error('Bootstrap error (non-JSON):', errorText);
            }
            return; // Don't update user if bootstrap fails
          }

          // Parse JSON response
          const data = await response.json();
          
          if (data.ok && data.user) {
            // Update user with Neon DB ID
            setUser(prev => prev ? { 
              ...prev, 
              id: data.user.id, // Use Neon UUID as primary ID
              auth0Id: prev.sub // Keep Auth0 ID reference
            } : null);
          } else {
            console.warn('Bootstrap response missing user data:', data);
          }
        } catch (err: any) {
          console.error('Failed to bootstrap user:', err);
          // Don't throw - allow user to continue even if bootstrap fails
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

  // Debug logging (only in development or if explicitly enabled)
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH0 === 'true') {
    console.log('🔍 Auth0 Configuration Debug:', {
      domain: auth0Domain ? `${auth0Domain.substring(0, 10)}...` : 'MISSING',
      clientId: auth0ClientId ? `${auth0ClientId.substring(0, 10)}...` : 'MISSING',
      audience: auth0Audience || 'MISSING',
      origin: window.location.origin,
      redirectUri: window.location.origin + "/callback",
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
    });
  }

  // Critical: Validate domain format (no https://, no trailing slash)
  if (auth0Domain && (auth0Domain.startsWith('https://') || auth0Domain.endsWith('/'))) {
    console.error('❌ VITE_AUTH0_DOMAIN must be domain only (e.g., dev-xxx.us.auth0.com), not URL');
    console.error('Current value:', auth0Domain);
  }

  if (!auth0Domain || !auth0ClientId || !auth0Audience) {
    const missing = [];
    if (!auth0Domain) missing.push('VITE_AUTH0_DOMAIN');
    if (!auth0ClientId) missing.push('VITE_AUTH0_CLIENT_ID');
    if (!auth0Audience) missing.push('VITE_AUTH0_AUDIENCE');
    
    console.error('❌ Missing Auth0 environment variables:', missing.join(', '));
    console.error('Current origin:', window.location.origin);
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
            <details style={{ marginTop: '20px', textAlign: 'left', maxWidth: '600px' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280' }}>Debug Info</summary>
              <pre style={{ background: '#f3f4f6', padding: '10px', borderRadius: '4px', fontSize: '12px', marginTop: '10px', overflow: 'auto' }}>
                {JSON.stringify({
                  origin: window.location.origin,
                  mode: import.meta.env.MODE,
                  prod: import.meta.env.PROD,
                  hasDomain: !!auth0Domain,
                  hasClientId: !!auth0ClientId,
                  hasAudience: !!auth0Audience,
                }, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      );
    }
  }

  // Critical: redirect_uri must match CallbackPage route
  const redirectUri = window.location.origin + "/callback";
  
  // Log redirect URI for debugging
  if (import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH0 === 'true') {
    console.log('🔗 Redirect URI:', redirectUri);
  }

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
