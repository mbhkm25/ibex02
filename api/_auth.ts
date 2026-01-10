/**
 * JWT Authentication Middleware
 * 
 * Architecture: Neon Auth JWT verification using JWKS
 * 
 * Core Principle:
 * - Neon Auth = Identity Authority
 * - JWT = Proof of Identity
 * - API = Gatekeeper
 * - Database = Truth
 * 
 * Security:
 * - Verify JWT signature using JWKS
 * - Validate issuer (must match Neon Auth)
 * - Validate expiration
 * - Extract user_id from 'sub' claim
 * - Never trust client-side claims
 */

import jwt from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';

const NEON_AUTH_ISSUER = process.env.NEON_AUTH_ISSUER || 'https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth';
const JWKS_URI = process.env.NEON_AUTH_JWKS_URL || `${NEON_AUTH_ISSUER}/.well-known/jwks.json`;

/**
 * JWKS Client for fetching public keys
 * 
 * Architecture Decision: Cache JWKS keys for performance.
 * Keys are cached for 10 hours (default) and rotated automatically.
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
 * @throws Error if token is invalid, expired, or issuer mismatch
 */
export async function verifyToken(token: string): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      getKey,
      {
        issuer: NEON_AUTH_ISSUER,
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

        // Extract user ID from 'sub' claim (standard OIDC)
        const userId = decoded.sub || decoded.user_id;
        if (!userId) {
          reject(new Error('JWT missing user ID in sub claim'));
          return;
        }

        // Extract roles (may be array or single value)
        const roles = decoded.roles || (decoded.role ? [decoded.role] : []);

        const user: AuthUser = {
          id: userId,
          email: decoded.email,
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
 * 
 * @param authHeader - Authorization header value (e.g., "Bearer <token>")
 * @returns JWT token or null
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
 * 
 * Validates JWT and attaches req.user
 * 
 * Usage:
 * ```typescript
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const user = await requireAuth(req);
 *   // user.id, user.email, user.roles available
 * }
 * ```
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
 * 
 * Validates JWT and checks for admin role
 * 
 * Usage:
 * ```typescript
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const user = await requireAdmin(req);
 *   // user is guaranteed to have admin role
 * }
 * ```
 */
export async function requireAdmin(req: any): Promise<AuthUser> {
  const user = await requireAuth(req);

  if (!user.roles || !user.roles.includes('admin')) {
    throw new Error('FORBIDDEN: Admin role required');
  }

  return user;
}

