import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * Ledger Summary All Businesses API
 * 
 * Purpose: Calculate total balance across ALL businesses for a customer.
 * Source of Truth: ledger_entries table (status = 'finalized' OR 'completed')
 * 
 * Architecture:
 * - Read-only
 * - Calculated on-the-fly (No balance tables)
 * - Customer-only access (infers customerId from user)
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

    // Get internal user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    // Get all customer profiles for this user across all businesses
    const customersResult = await query(
      `SELECT id, business_id FROM customers WHERE user_id = $1`,
      [internalUserId]
    );

    if (customersResult.rows.length === 0) {
      // User has no wallets with any business yet
      return res.status(200).json({
        success: true,
        data: [],
        total: 0
      });
    }

    const customerIds = customersResult.rows.map((row: any) => row.id);

    // Build Query: SUM(amount) GROUP BY currency for all customer wallets
    // Filter: status IN ('finalized', 'completed')
    const sql = `
      SELECT 
        currency, 
        SUM(amount) as balance,
        COUNT(*) as transaction_count
      FROM ledger_entries
      WHERE customer_id = ANY($1::uuid[])
      AND status IN ('finalized', 'completed')
      GROUP BY currency
    `;

    const result = await query(sql, [customerIds]);

    // Format response
    const balances = result.rows.map(row => ({
      currency: row.currency,
      balance: parseFloat(row.balance), // Postgres returns numeric as string
      count: parseInt(row.transaction_count)
    }));

    // Calculate total (assuming same currency or primary currency)
    // For now, sum all balances (user should handle multi-currency in UI)
    const total = balances.reduce((sum, b) => sum + b.balance, 0);

    return res.status(200).json({
      success: true,
      data: balances,
      total: total
    });

  } catch (error: any) {
    console.error('[LedgerSummaryAll] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
