import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../_auth';
import { transaction, query } from '../../_db';

// Configuration
const FINALIZATION_WINDOW_HOURS = 24;

/**
 * Confirm Debt Request (Customer Action)
 *
 * Workflow:
 * 1. Customer reviews debt request
 * 2. Customer confirms (approves) the debt
 * 3. Create ledger entry with entry_type='debt' and amount=-ABS(amount)
 * 4. Update debt_request status to 'approved'
 * 5. Record audit event
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
    const { businessId: expectedBusinessId } = req.body;

    if (!debtRequestId || typeof debtRequestId !== 'string') {
      return res.status(400).json({ error: 'Missing debt request ID' });
    }

    // Get internal user ID
    const userResult = await query('SELECT id FROM users WHERE auth0_sub = $1', [user.id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in database' });
    }
    const internalUserId = userResult.rows[0].id;

    // 2. Execute Transaction
    const result = await transaction(async (client) => {
      // A. Lock and Get Debt Request
      const debtResult = await client.query(
        `SELECT dr.*, c.user_id as customer_user_id
         FROM debt_requests dr
         JOIN customers c ON dr.customer_id = c.id
         WHERE dr.id = $1 FOR UPDATE`,
        [debtRequestId]
      );

      if (debtResult.rows.length === 0) {
        throw new Error('DEBT_REQUEST_NOT_FOUND');
      }

      const debtRequest = debtResult.rows[0];

      // B. Security: Business Isolation Check
      if (expectedBusinessId && debtRequest.business_id !== expectedBusinessId) {
        throw new Error('BUSINESS_MISMATCH');
      }

      // C. Validate Debt Request State
      if (debtRequest.status !== 'requested') {
        throw new Error(`DEBT_REQUEST_INVALID_STATUS: ${debtRequest.status}`);
      }

      // D. Verify Customer Ownership
      if (debtRequest.customer_user_id !== internalUserId) {
        throw new Error('FORBIDDEN: Not your debt request');
      }

      // E. Create Ledger Entry
      // Policy: Debt is NEGATIVE amount (debit from customer's balance)
      // amount = -ABS(debtRequest.amount) to ensure it's negative
      const ledgerResult = await client.query(
        `INSERT INTO ledger_entries (
          business_id,
          customer_id,
          amount,
          currency,
          status,
          entry_type,
          finalizes_at,
          merchant_confirmed_at,
          customer_confirmed_at,
          reference
        ) VALUES (
          $1, $2, $3, $4, 
          'pending', 
          'debt',
          NOW() + INTERVAL '${FINALIZATION_WINDOW_HOURS} hours',
          $5, -- Merchant confirmed at creation (from debt_request.created_at)
          NOW(), -- Customer confirms NOW
          $6
        )
        RETURNING id, created_at, status, finalizes_at`,
        [
          debtRequest.business_id,
          debtRequest.customer_id,
          -Math.abs(Number(debtRequest.amount)), // Negative for debt
          debtRequest.currency,
          debtRequest.merchant_confirmed_at,
          `Debt Request: ${debtRequest.notes || 'No notes'}`
        ]
      );

      const ledgerEntry = ledgerResult.rows[0];

      // F. Update Debt Request Status
      await client.query(
        `UPDATE debt_requests 
         SET status = 'approved', 
             customer_confirmed_at = NOW(),
             updated_at = NOW() 
         WHERE id = $1`,
        [debtRequestId]
      );

      // G. Audit Trail (Ledger Event)
      await client.query(
        `INSERT INTO ledger_events (
          ledger_entry_id,
          actor_user_id,
          action,
          metadata
        ) VALUES ($1, $2, 'customer_confirmed_debt', $3)`,
        [
          ledgerEntry.id,
          internalUserId,
          JSON.stringify({ 
            debt_request_id: debtRequestId, 
            amount: debtRequest.amount,
            currency: debtRequest.currency,
            ip: req.headers['x-forwarded-for']
          })
        ]
      );

      return {
        ledgerEntry,
        debtRequest: {
          ...debtRequest,
          status: 'approved',
          customer_confirmed_at: new Date()
        }
      };
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[DebtConfirm] Error:', error);
    
    if (error.message === 'BUSINESS_MISMATCH') {
      return res.status(403).json({ error: 'Security Alert: Business mismatch detected' });
    }
    if (error.message === 'DEBT_REQUEST_NOT_FOUND') {
      return res.status(404).json({ error: 'Debt request not found' });
    }
    if (error.message.startsWith('DEBT_REQUEST_INVALID_STATUS')) {
      return res.status(409).json({ error: 'Debt request already processed or cancelled' });
    }
    if (error.message.includes('FORBIDDEN')) {
      return res.status(403).json({ error: error.message });
    }

    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
