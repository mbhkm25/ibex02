import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from './_auth';
import { query } from './_db';

/**
 * List User Service Requests - Serverless Function
 * 
 * Architecture: BFF Pattern
 * - Authenticates user via Auth0
 * - Queries Database directly
 * - Returns filtered results
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Authentication
    const user = await requireAuth(req);

    // 2. Query Database
    // Note: We use auth0_sub (user.id) directly or link it to users table
    // Assuming service_requests has user_id which matches auth0_sub or we join with users table
    // If service_requests.user_id is UUID from users table, we need to look it up first.
    // Based on previous steps, we sync users.
    
    // First, get internal user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
        // User not synced yet? Return empty
        return res.status(200).json([]);
    }
    const internalUserId = userResult.rows[0].id;

    const result = await query(
      `SELECT id, status, business_model, business_name, description, rejection_reason, created_at, updated_at 
       FROM service_requests 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [internalUserId]
    );

    // 3. Return Data
    return res.status(200).json(result.rows);

  } catch (error: any) {
    console.error('API Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
