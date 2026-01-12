/**
 * JWT Authentication Middleware
 * 
 * Architecture: Auth0 JWT verification using JWKS
 * 
 * Core Principle:
 * - Auth0 = Identity Authority
 * - JWT = Proof of Identity
 * - API = Gatekeeper
 * - Database = Truth
 * 
 * Security:
 * - Verify JWT signature using JWKS
 * - Validate issuer (must match Auth0)
 * - Validate audience (must match API identifier)
 * - Validate expiration
 * - Extract user_id from 'sub' claim
 * - Never trust client-side claims
 */

import jwt from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'dev-0rlg3lescok8mwu0.us.auth0.com';
const AUTH0_ISSUER = process.env.AUTH0_ISSUER || `https://${AUTH0_DOMAIN}/`;
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://api.ibex.app';
const JWKS_URI = `https://${AUTH0_DOMAIN}/.well-known/jwks.json`;

/**
 * JWKS Client for fetching public keys
 */
const client = jwksClient({
  jwksUri: JWKS_URI,
  cache: true,
  cacheMaxAge: 10 * 60 * 60 * 1000, // 10 hours
  rateLimit: true,
  jwksRequestsPerMinute: 5,
});

/**
 * Get signing key from JWKS
 */
function getKey(header: any, callback: (err: Error | null, key?: string) => void): void {
  client.getSigningKey(header.kid, (err: Error | null, key: SigningKey | undefined) => {
    if (err) {
      callback(err);
      return;
    }
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Decoded JWT payload
 */
export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  roles?: string[];
  claims: Record<string, any>;
}

/**
 * Verify JWT token and extract user information
 * 
 * @param token - JWT access token from Authorization header
 * @returns Decoded user information
 * @throws Error if token is invalid, expired, or issuer/audience mismatch
 */
export async function verifyToken(token: string): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: AUTH0_ISSUER,
        audience: AUTH0_AUDIENCE,
        algorithms: ['RS256'],
      },
      (err, decoded: any) => {
        if (err) {
          reject(new Error(`JWT verification failed: ${err.message}`));
          return;
        }

        if (!decoded) {
          reject(new Error('JWT verification returned no payload'));
          return;
        }

        // Extract user ID from 'sub' claim
        const userId = decoded.sub;
        if (!userId) {
          reject(new Error('JWT missing user ID in sub claim'));
          return;
        }

        // Extract roles
        // Look for roles in namespaced claim first, then standard scope/claim
        const namespace = 'https://api.ibex.app/roles';
        const roles = decoded[namespace] || decoded['roles'] || [];

        const user: AuthUser = {
          id: userId,
          email: decoded.email, // Note: Needs custom Action in Auth0 to add email to Access Token
          phone: decoded.phone,
          roles: Array.isArray(roles) ? roles : [roles],
          claims: decoded,
        };

        resolve(user);
      }
    );
  });
}

/**
 * Extract JWT token from Authorization header
 */
export function extractToken(authHeader: string | string[] | undefined): string | null {
  if (!authHeader) return null;
  
  const header = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!header) return null;

  const parts = header.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Require authentication middleware
 */
export async function requireAuth(req: any): Promise<AuthUser> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  const token = extractToken(authHeader);

  if (!token) {
    throw new Error('UNAUTHORIZED: Missing Authorization header');
  }

  try {
    const user = await verifyToken(token);
    return user;
  } catch (error: any) {
    throw new Error(`UNAUTHORIZED: ${error.message}`);
  }
}

/**
 * Require admin role middleware
 */
export async function requireAdmin(req: any): Promise<AuthUser> {
  const user = await requireAuth(req);

  if (!user.roles || !user.roles.includes('admin')) {
    throw new Error('FORBIDDEN: Admin role required');
  }

  return user;
}
