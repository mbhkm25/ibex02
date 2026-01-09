/**
 * Admin Configuration
 * 
 * ⚠️ DEPRECATED: This file is kept for backward compatibility only ⚠️
 * 
 * The system now uses Neon Auth with JWT tokens for authentication.
 * Admin access is determined by the 'admin' role in the JWT token.
 * 
 * Migration Status:
 * - ✅ Frontend: Uses JWT from auth service
 * - ✅ Backend: Verifies JWT using Neon Auth JWKS
 * - ⚠️ Legacy: Admin secret still supported for backward compatibility
 * 
 * TODO: Remove this file once all clients are migrated to JWT
 * TODO: Remove ADMIN_SECRET environment variable
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

