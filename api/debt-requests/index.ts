import { VercelRequest, VercelResponse } from '@vercel/node';
import { requirePermission, requireAuth } from '../_auth';
import { Permission } from '../_rbac';
import { query } from '../_db';

/**
 * Debt Requests API
 * 
 * Purpose: Manage debt creation lifecycle.
 * Security: Merchant/Manager access for creation.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST: Create Debt Request
  if (req.method === 'POST') {
    return handleCreate(req, res);
  }

  // GET: List Debt Requests
  if (req.method === 'GET') {
    return handleList(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function handleCreate(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requirePermission(req, Permission.MANAGE_STORE);
    const { businessId, customerId, amount, currency, notes, dueDate } = req.body;

    if (!businessId || !customerId || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get internal user ID from users table
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database. Please complete registration.' });
    }
    const internalUserId = userResult.rows[0].id;

    // Verify Ownership
    const merchantCheck = await query(
      `SELECT id FROM business_profiles WHERE id = $1 AND owner_user_id = $2`,
      [businessId, internalUserId]
    );
    if (merchantCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: Not your business' });
    }

    // Get Credit Limit Snapshot
    const customer = await query(
      `SELECT credit_limit FROM customers WHERE id = $1 AND business_id = $2`,
      [customerId, businessId]
    );
    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    const snapshotLimit = customer.rows[0].credit_limit || 0;

    // Create Request
    const result = await query(
      `INSERT INTO debt_requests (
        business_id, 
        customer_id, 
        created_by_staff_id,
        amount, 
        currency, 
        credit_limit_snapshot,
        due_date,
        notes,
        status,
        merchant_confirmed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'requested', NOW())
      RETURNING *`,
      [
        businessId,
        customerId,
        internalUserId,
        amount,
        currency,
        snapshotLimit,
        dueDate || null,
        notes || null
      ]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });

  } catch (error: any) {
    console.error('[CreateDebt] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 
                   error.message.includes('FORBIDDEN') ? 403 : 500;
    return res.status(status).json({ error: error.message });
  }
}

async function handleList(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireAuth(req);
    const { businessId, customerId, status } = req.query;

    // Get internal user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    if (!businessId) {
      return res.status(400).json({ error: 'businessId is required' });
    }

    // Check if user is merchant (owner)
    const merchantCheck = await query(
      `SELECT id FROM business_profiles WHERE id = $1 AND owner_user_id = $2`,
      [businessId, internalUserId]
    );
    const isMerchant = merchantCheck.rows.length > 0;

    let sql = `SELECT dr.*, c.name as customer_name, c.phone as customer_phone
               FROM debt_requests dr
               JOIN customers c ON dr.customer_id = c.id
               WHERE dr.business_id = $1`;
    const params: any[] = [businessId];
    let paramIndex = 2;

    if (isMerchant) {
      // Merchant can filter by customerId and status
      if (customerId) {
        sql += ` AND dr.customer_id = $${paramIndex}`;
        params.push(customerId);
        paramIndex++;
      }
    } else {
      // Customer can only see their own requests
      const customerCheck = await query(
        `SELECT id FROM customers WHERE business_id = $1 AND user_id = $2`,
        [businessId, internalUserId]
      );
      if (customerCheck.rows.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      const selfCustomerId = customerCheck.rows[0].id;
      sql += ` AND dr.customer_id = $${paramIndex}`;
      params.push(selfCustomerId);
      paramIndex++;
    }

    // Filter by status if provided
    if (status) {
      sql += ` AND dr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    sql += ` ORDER BY dr.created_at DESC`;

    const result = await query(sql, params);

    return res.status(200).json({
      success: true,
      data: result.rows
    });

  } catch (error: any) {
    console.error('[ListDebtRequests] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
