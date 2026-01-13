import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * Get Business Profile (Public Info)
 * 
 * Purpose: Retrieve basic business information for display.
 * Security: Public read (any authenticated user can view business name/logo)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAuth(req); // Require authentication but allow any user
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const result = await query(
      `SELECT 
        id,
        name,
        logo_file_id,
        description,
        status
       FROM business_profiles
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Business not found' });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('[GetBusiness] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
