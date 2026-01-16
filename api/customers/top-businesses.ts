import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { query } from '../_db';

/**
 * Top Businesses by Usage API
 * 
 * Purpose: Get top 3 businesses for a customer based on:
 * 1. Number of transactions (most used)
 * 2. Total balance (highest balance)
 * 3. Most recent activity
 * 
 * Returns: List of businesses with balance and transaction count
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

    // Get all customer profiles for this user
    const customersResult = await query(
      `SELECT c.id as customer_id, c.business_id, bp.name as business_name, bp.logo_file_id
       FROM customers c
       JOIN business_profiles bp ON c.business_id = bp.id
       WHERE c.user_id = $1`,
      [internalUserId]
    );

    if (customersResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // For each customer, get balance and transaction count
    const businessesWithStats = await Promise.all(
      customersResult.rows.map(async (row: any) => {
        // Get balance summary
        const balanceResult = await query(
          `SELECT 
            currency,
            SUM(amount) as balance,
            COUNT(*) as transaction_count,
            MAX(created_at) as last_transaction_at
           FROM ledger_entries
           WHERE customer_id = $1
           AND status IN ('finalized', 'completed')
           GROUP BY currency`,
          [row.customer_id]
        );

        // Calculate total balance (sum all currencies, assuming same currency for simplicity)
        const totalBalance = balanceResult.rows.reduce((sum: number, r: any) => {
          return sum + parseFloat(r.balance || '0');
        }, 0);

        // Get total transaction count
        const totalTransactions = balanceResult.rows.reduce((sum: number, r: any) => {
          return sum + parseInt(r.transaction_count || '0');
        }, 0);

        // Get last transaction date
        const lastTransaction = balanceResult.rows
          .map((r: any) => r.last_transaction_at)
          .filter(Boolean)
          .sort()
          .reverse()[0];

        return {
          business_id: row.business_id,
          business_name: row.business_name,
          logo_file_id: row.logo_file_id,
          balance: totalBalance,
          transaction_count: totalTransactions,
          last_transaction_at: lastTransaction || null,
          customer_id: row.customer_id
        };
      })
    );

    // Sort by: 1. Transaction count (most used), 2. Last transaction (most recent), 3. Balance
    businessesWithStats.sort((a, b) => {
      // Primary: Transaction count
      if (b.transaction_count !== a.transaction_count) {
        return b.transaction_count - a.transaction_count;
      }
      // Secondary: Last transaction date
      if (a.last_transaction_at && b.last_transaction_at) {
        return new Date(b.last_transaction_at).getTime() - new Date(a.last_transaction_at).getTime();
      }
      if (a.last_transaction_at) return -1;
      if (b.last_transaction_at) return 1;
      // Tertiary: Balance
      return Math.abs(b.balance) - Math.abs(a.balance);
    });

    // Return top 3
    const top3 = businessesWithStats.slice(0, 3);

    return res.status(200).json({
      success: true,
      data: top3
    });

  } catch (error: any) {
    console.error('[TopBusinesses] Error:', error);
    const status = error.message?.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
