import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../_auth';
import { query } from '../../_db';

/**
 * Reject Debt Request (Customer Action)
 *
 * Workflow:
 * 1. Customer reviews debt request
 * 2. Customer rejects the debt
 * 3. Update debt_request status to 'rejected' with rejection_reason
 * 4. Record audit event (optional, can be logged in debt_requests table)
 *
 * Security:
 * - Requires Authentication (Customer only)
 * - Validates debt request status
 * - Validates Business Isolation
 * - Idempotent (safe to retry)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Auth Check (Customer)
    const user = await requireAuth(req);
    const { id: debtRequestId } = req.query;
    const { businessId: expectedBusinessId, rejectionReason } = req.body;

    if (!debtRequestId || typeof debtRequestId !== 'string') {
      return res.status(400).json({ error: 'Missing debt request ID' });
    }

    // Get internal user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    // 2. Get and Validate Debt Request
    const debtResult = await query(
      `SELECT dr.*, c.user_id as customer_user_id
       FROM debt_requests dr
       JOIN customers c ON dr.customer_id = c.id
       WHERE dr.id = $1`,
      [debtRequestId]
    );

    if (debtResult.rows.length === 0) {
      return res.status(404).json({ error: 'Debt request not found' });
    }

    const debtRequest = debtResult.rows[0];

    // B. Security: Business Isolation Check
    if (expectedBusinessId && debtRequest.business_id !== expectedBusinessId) {
      return res.status(403).json({ error: 'Security Alert: Business mismatch detected' });
    }

    // C. Validate Debt Request State
    if (debtRequest.status !== 'requested') {
      return res.status(409).json({ 
        error: `Debt request already processed. Current status: ${debtRequest.status}` 
      });
    }

    // D. Verify Customer Ownership
    if (debtRequest.customer_user_id !== internalUserId) {
      return res.status(403).json({ error: 'FORBIDDEN: Not your debt request' });
    }

    // E. Update Debt Request Status
    const updateResult = await query(
      `UPDATE debt_requests 
       SET status = 'rejected', 
           rejection_reason = $1,
           updated_at = NOW() 
       WHERE id = $2
       RETURNING *`,
      [rejectionReason || 'Rejected by customer', debtRequestId]
    );

    return res.status(200).json({
      success: true,
      data: updateResult.rows[0]
    });

  } catch (error: any) {
    console.error('[DebtReject] Error:', error);
    
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
