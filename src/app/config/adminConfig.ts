/**
 * Admin Configuration (MVP)
 * 
 * ⚠️ TEMPORARY MVP SECURITY ⚠️
 * 
 * This is a simple admin secret for MVP protection.
 * This is NOT production-grade authentication.
 * 
 * TODO: Replace ADMIN_SECRET with real authentication system
 * TODO: Replace header-based auth with role-based access control (RBAC)
 * TODO: Implement JWT tokens with proper expiration
 * TODO: Add session management
 * TODO: Implement proper admin role verification
 * 
 * Architecture Decision:
 * - For MVP, we use a simple secret stored in environment variable
 * - Frontend reads from Vite env: import.meta.env.VITE_ADMIN_SECRET
 * - Backend reads from server env: process.env.ADMIN_SECRET
 * - This allows controlled access without full auth system
 * 
 * Security Note:
 * - This secret should be:
 *   - Long and random (minimum 32 characters)
 *   - Stored in environment variables only
 *   - Never committed to version control
 *   - Rotated periodically
 *   - Different for each environment (dev/staging/prod)
 */

/**
 * Get admin secret from environment variable
 * 
 * In development: Set VITE_ADMIN_SECRET in .env.local
 * In production: Set VITE_ADMIN_SECRET in Vercel environment variables
 * 
 * TODO: Replace with proper authentication token retrieval
 */
export function getAdminSecret(): string {
  // Read from Vite environment variable
  const secret = import.meta.env.VITE_ADMIN_SECRET;
  
  if (!secret) {
    // In development, warn but don't fail (allows testing)
    if (import.meta.env.DEV) {
      console.warn(
        '[AdminConfig] VITE_ADMIN_SECRET not set. ' +
        'Admin API calls will fail. ' +
        'Set VITE_ADMIN_SECRET in .env.local for development.'
      );
      return '';
    }
    
    // In production, this is a critical error
    throw new Error(
      'VITE_ADMIN_SECRET is not configured. ' +
      'Admin operations are disabled for security.'
    );
  }
  
  return secret;
}

/**
 * Check if admin secret is configured
 */
export function isAdminSecretConfigured(): boolean {
  return !!import.meta.env.VITE_ADMIN_SECRET;
}

