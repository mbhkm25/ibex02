/**
 * Neon Auth Integration Service
 * 
 * Architecture: OIDC-compatible authentication using Neon Auth
 * 
 * Core Principle:
 * - Neon Auth = Identity Authority
 * - JWT = Proof of Identity
 * - Frontend = Token Storage
 * - Backend = Token Verification
 * 
 * Security:
 * - Tokens stored in memory (sessionStorage for persistence)
 * - Never store passwords
 * - Never trust client-side claims
 * - Always verify JWT on backend
 */

const NEON_AUTH_ISSUER = 'https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth';
const NEON_AUTH_BASE = NEON_AUTH_ISSUER;

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  roles?: string[];
  claims?: Record<string, any>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Get stored access token
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('neon_auth_access_token');
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('neon_auth_refresh_token');
}

/**
 * Store authentication tokens
 */
function storeTokens(tokens: AuthTokens): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('neon_auth_access_token', tokens.accessToken);
  if (tokens.refreshToken) {
    sessionStorage.setItem('neon_auth_refresh_token', tokens.refreshToken);
  }
  sessionStorage.setItem('neon_auth_expires_at', tokens.expiresAt.toString());
}

/**
 * Clear stored tokens
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('neon_auth_access_token');
  sessionStorage.removeItem('neon_auth_refresh_token');
  sessionStorage.removeItem('neon_auth_expires_at');
  sessionStorage.removeItem('neon_auth_user');
}

/**
 * Decode JWT payload (without verification)
 * Used for client-side display only, never trust for security
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get current user from stored token
 * NOTE: This is for UI display only. Backend must verify JWT.
 */
export function getCurrentUser(): AuthUser | null {
  const token = getAccessToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded) return null;

  // Extract user info from JWT claims
  const user: AuthUser = {
    id: decoded.sub || decoded.user_id || '',
    email: decoded.email,
    phone: decoded.phone,
    roles: decoded.roles || decoded.role ? [decoded.role] : [],
    claims: decoded,
  };

  return user;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  const expiresAt = sessionStorage.getItem('neon_auth_expires_at');
  if (!expiresAt) return false;

  const expires = parseInt(expiresAt, 10);
  if (Date.now() >= expires) {
    clearTokens();
    return false;
  }

  return true;
}

/**
 * Check if user has admin role
 * NOTE: This is for UI display only. Backend must verify role.
 */
export function isAdmin(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.roles?.includes('admin') || false;
}

/**
 * Register new user with Neon Auth
 * 
 * TODO: Replace with real Neon Auth endpoint when available
 * For now, using mock registration for development
 */
export async function register(email: string, password: string, phone?: string): Promise<AuthTokens> {
  // TODO: Replace with real Neon Auth endpoint
  // For MVP, using mock registration
  // In production, this should call Neon Auth registration endpoints
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock registration for development
  const userId = `user_${Date.now()}`;
  const roles = ['customer'];
  const mockToken = generateMockJWT(userId, email, roles);

  // Try to call real endpoint (will fail gracefully)
  try {
    const response = await fetch(`${NEON_AUTH_BASE}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        phone,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const tokens: AuthTokens = {
        accessToken: data.access_token || data.token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      };
      storeTokens(tokens);
      return tokens;
    }
  } catch (error) {
    // Fall through to mock registration
  }

  const tokens: AuthTokens = {
    accessToken: mockToken,
    refreshToken: `refresh_${userId}`,
    expiresAt: Date.now() + (3600 * 1000), // 1 hour
  };

  storeTokens(tokens);
  return tokens;
}

/**
 * Login with Neon Auth
 * 
 * TODO: Replace with real Neon Auth endpoint when available
 * For now, using mock authentication for development
 */
export async function login(email: string, password: string): Promise<AuthTokens> {
  // TODO: Replace with real Neon Auth endpoint
  // For MVP, using mock authentication
  // In production, this should call Neon Auth OAuth/OIDC endpoints
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Mock authentication for development
  // Admin user: admin@example.com / admin123
  // Regular user: user@example.com / user123
  let mockToken: string;
  let userId: string;
  let roles: string[];

  if (email === 'admin@example.com' && password === 'admin123') {
    userId = 'admin_user_id_123';
    roles = ['admin'];
    mockToken = generateMockJWT(userId, email, roles);
  } else if (email === 'user@example.com' && password === 'user123') {
    userId = 'user_id_456';
    roles = ['customer'];
    mockToken = generateMockJWT(userId, email, roles);
  } else {
    // Try to call real endpoint (will fail gracefully)
    try {
      const response = await fetch(`${NEON_AUTH_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const tokens: AuthTokens = {
          accessToken: data.access_token || data.token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        };
        storeTokens(tokens);
        return tokens;
      }
    } catch (error) {
      // Fall through to error
    }

    throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
  }

  const tokens: AuthTokens = {
    accessToken: mockToken,
    refreshToken: `refresh_${userId}`,
    expiresAt: Date.now() + (3600 * 1000), // 1 hour
  };

  storeTokens(tokens);
  return tokens;
}

/**
 * Generate mock JWT for development
 * Format: header.payload.signature (base64 encoded)
 */
function generateMockJWT(userId: string, email: string, roles: string[]): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    sub: userId,
    email: email,
    roles: roles,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    iss: NEON_AUTH_ISSUER,
    aud: 'any'
  };

  // Base64 encode (without actual signature for mock)
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signature = 'mock_signature_for_development_only';

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Logout (clear tokens)
 */
export function logout(): void {
  clearTokens();
}

/**
 * Refresh access token
 * 
 * TODO: Replace with real Neon Auth refresh endpoint when available
 */
export async function refreshAccessToken(): Promise<AuthTokens> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Try to call real endpoint first
  try {
    const response = await fetch(`${NEON_AUTH_BASE}/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const tokens: AuthTokens = {
        accessToken: data.access_token || data.token,
        refreshToken: data.refresh_token || refreshToken,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
      };
      storeTokens(tokens);
      return tokens;
    }
  } catch (error) {
    // Fall through to mock refresh
  }

  // Mock refresh: decode current token and generate new one
  const currentToken = getAccessToken();
  if (!currentToken) {
    clearTokens();
    throw new Error('No access token available');
  }

  const decoded = decodeJWT(currentToken);
  if (!decoded) {
    clearTokens();
    throw new Error('Invalid token');
  }

  // Generate new token with extended expiration
  const newToken = generateMockJWT(decoded.sub, decoded.email, decoded.roles || []);
  
  const tokens: AuthTokens = {
    accessToken: newToken,
    refreshToken: refreshToken,
    expiresAt: Date.now() + (3600 * 1000), // 1 hour
  };

  storeTokens(tokens);
  return tokens;
}

/**
 * Get authorization header for API requests
 */
export function getAuthHeader(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    return {};
  }
  return {
    'Authorization': `Bearer ${token}`,
  };
}

