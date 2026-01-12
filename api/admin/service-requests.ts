import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_auth';
import { query } from '../_db';

/**
 * Admin: List Service Requests
 * 
 * Architecture: BFF Pattern
 * - Authenticates admin
 * - Returns all requests
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
    // 1. Auth & Admin Check
    await requireAdmin(req);

    // 2. Parse Query Params
    const status = req.query.status as string;
    
    let queryText = `
      SELECT id, status, business_model, business_name, description, rejection_reason, user_id, created_at, updated_at 
      FROM service_requests 
    `;
    const params: any[] = [];

    if (status) {
      queryText += ` WHERE status = $1`;
      params.push(status);
    }

    queryText += ` ORDER BY created_at DESC`;

    // 3. Execute Query
    const result = await query(queryText, params);

    // 4. Return Data
    return res.status(200).json(result.rows);

  } catch (error: any) {
    console.error('API Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 
                   error.message.includes('FORBIDDEN') ? 403 : 500;
    return res.status(status).json({ error: error.message });
  }
}
