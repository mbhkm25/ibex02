import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * Bootstrap User Endpoint
 * 
 * Purpose: Ensure Auth0 user exists in local database
 * Architecture: Called once after login to sync Auth0 identity with Neon DB
 * 
 * Logic:
 * 1. Authenticate user via JWT
 * 2. Check if user exists in 'users' table by auth0_sub
 * 3. If not, insert new user
 * 4. Return user data
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // 1. Authenticate user
    const authUser = await requireAuth(req);

    // 2. Check if user exists
    const { rows } = await query('SELECT * FROM users WHERE auth0_sub = $1', [authUser.id]);
    
    let user = rows[0];

    // 3. If not exists, insert
    if (!user) {
      console.log(`Bootstrapping new user: ${authUser.id}`);
      
      const insertResult = await query(
        `INSERT INTO users (auth0_sub, email, name, picture) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [
          authUser.id, 
          authUser.email || null, 
          authUser.claims.name || authUser.email || 'User', 
          authUser.picture || authUser.claims.picture || null
        ]
      );
      
      user = insertResult.rows[0];
    } else {
        // Optional: Update user info if changed (e.g. name/picture)
        // For MVP, we skip this to minimize DB writes on every login
    }

    // 4. Return user data
    res.status(200).json({ ok: true, user });

  } catch (error: any) {
    console.error('Bootstrap error:', error);
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : 500;
    const errorMessage = error.message || 'Internal Server Error';
    
    // Ensure we always return valid JSON
    return res.status(status).json({ 
      ok: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
