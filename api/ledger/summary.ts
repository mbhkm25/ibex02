import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * Ledger Summary API
 * 
 * Purpose: Calculate balances from immutable ledger entries.
 * Source of Truth: ledger_entries table (status = 'finalized' OR 'completed')
 * 
 * Architecture:
 * - Read-only
 * - Calculated on-the-fly (No balance tables)
 * - Scope-based access control (Strict)
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
    const { businessId, customerId } = req.query;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    // Get internal user ID from users table
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    // 1. Check if user is the merchant (owner)
    const merchantCheck = await query(
      `SELECT id FROM business_profiles WHERE id = $1 AND owner_user_id = $2`,
      [businessId, internalUserId]
    );
    const isMerchant = merchantCheck.rows.length > 0;

    let targetCustomerId: string | null = null;

    if (isMerchant) {
      // Merchant Logic:
      // Can query specific customer OR all customers (if customerId is null)
      if (customerId) {
        targetCustomerId = customerId as string;
      }
    } else {
      // Customer Logic (Strict):
      // - CANNOT pass customerId (ignored if passed)
      // - Must infer customerId from internalUserId
      
      const selfCheck = await query(
        `SELECT id FROM customers WHERE business_id = $1 AND user_id = $2`,
        [businessId, internalUserId]
      );
      
      if (selfCheck.rows.length > 0) {
        targetCustomerId = selfCheck.rows[0].id;
      } else {
        // User has no wallet with this business yet
        // Return 0 balance directly without querying ledger
        return res.status(200).json({
          success: true,
          data: []
        });
      }
    }

    // Build Query
    // Logic: SUM(amount) GROUP BY currency
    // Filter: status IN ('finalized', 'completed')
    
    let sql = `
      SELECT 
        currency, 
        SUM(amount) as balance,
        COUNT(*) as transaction_count
      FROM ledger_entries
      WHERE business_id = $1
      AND status IN ('finalized', 'completed')
    `;
    
    const params: any[] = [businessId];

    if (targetCustomerId) {
      sql += ` AND customer_id = $2`;
      params.push(targetCustomerId);
    }

    sql += ` GROUP BY currency`;

    const result = await query(sql, params);

    // Format response
    const balances = result.rows.map(row => ({
      currency: row.currency,
      balance: parseFloat(row.balance), // Postgres returns numeric as string
      count: parseInt(row.transaction_count)
    }));

    return res.status(200).json({
      success: true,
      data: balances
    });

  } catch (error: any) {
    console.error('[LedgerSummary] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
