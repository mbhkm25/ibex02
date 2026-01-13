import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * List Customers API
 * 
 * Purpose: List customers for a specific business.
 * RBAC: Merchant only.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await requireAuth(req);
    const { businessId, limit = '20', offset = '0' } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    // Get internal user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    // Verify Ownership
    const merchantCheck = await query(
      `SELECT id FROM business_profiles WHERE id = $1 AND owner_user_id = $2`,
      [businessId, internalUserId]
    );

    if (merchantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You do not own this business' });
    }

    // Query Customers + Balance (Optional: JOIN later if performance allows, for now separate calls preferred by frontend architecture, but basic info is here)
    // We list customers registered with this business
    const result = await query(
      `SELECT id, name, phone, email, status, category, created_at
       FROM customers
       WHERE business_id = $1
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [businessId, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('[ListCustomers] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
