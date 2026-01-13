import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * Ledger Entries API (Statement)
 * 
 * Purpose: Retrieve historical ledger entries.
 * Scope: Read-only access to 'ledger_entries' table.
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
    const { businessId, customerId, limit = '20', offset = '0' } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    // Get internal user ID from users table
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    // Authorization & Scope Check
    let isMerchant = false;
    let targetCustomerId: string | undefined;

    // 1. Check if user is the merchant (owner)
    const merchantCheck = await query(
      `SELECT id FROM business_profiles WHERE id = $1 AND owner_user_id = $2`,
      [businessId, internalUserId]
    );
    if (merchantCheck.rows.length > 0) {
      isMerchant = true;
      if (customerId) targetCustomerId = customerId as string;
    } else {
      // 2. User is NOT merchant (must be customer)
      // STRICT RULE: Customers CANNOT pass customerId. We infer it.
      const selfCheck = await query(
        `SELECT id FROM customers WHERE business_id = $1 AND user_id = $2`,
        [businessId, internalUserId]
      );
      if (selfCheck.rows.length > 0) {
        targetCustomerId = selfCheck.rows[0].id;
      } else {
        return res.status(403).json({ error: 'Forbidden: No wallet found for this business' });
      }
    }

    // Query
    let sql = `
      SELECT 
        le.id, 
        le.amount, 
        le.currency, 
        le.entry_type, 
        le.status, 
        le.reference, 
        le.created_at, 
        le.finalizes_at,
        c.name as customer_name
      FROM ledger_entries le
      LEFT JOIN customers c ON le.customer_id = c.id
      WHERE le.business_id = $1
    `;
    const params: any[] = [businessId];

    if (targetCustomerId) {
      sql += ` AND le.customer_id = $2`;
      params.push(targetCustomerId);
    } else if (!isMerchant) {
        // Redundant safeguard
        return res.status(403).json({ error: 'Forbidden' });
    }

    sql += ` ORDER BY le.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('[LedgerEntries] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
