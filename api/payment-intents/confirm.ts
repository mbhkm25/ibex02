import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../_auth';
import { transaction } from '../_db';

// Configuration
const FINALIZATION_WINDOW_HOURS = 24;

/**
 * Confirm Payment Intent (Customer Action)
 *
 * Architecture:
 * - Customer scans QR and calls this endpoint
 * - Converts "Intent" -> "Ledger Entry"
 * - Atomic transaction ensures no double-spending
 * 
 * V3 Fixes:
 * - Removed redundant 'type' column (unified entry_type)
 * - Enforced Idempotency (UNIQUE payment_intent_id)
 * - Enforced Consent (CHECK customer_confirmed_at)
 * - Configurable Finalization Window
 * - Standardized Audit Action ('customer_confirmed')
 * 
 * Security:
 * - Requires Authentication
 * - Validates Intent status
 * - Validates Business Isolation
 * - Idempotent (safe to retry, handles race conditions via DB constraints)
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
    const { intentId, businessId: expectedBusinessId } = req.body;

    if (!intentId) {
      return res.status(400).json({ error: 'Missing intentId' });
    }

    // 2. Execute Transaction
    const result = await transaction(async (client) => {
      // A. Lock and Get Intent
      const intentResult = await client.query(
        `SELECT * FROM payment_intents WHERE id = $1 FOR UPDATE`,
        [intentId]
      );

      if (intentResult.rows.length === 0) {
        throw new Error('INTENT_NOT_FOUND');
      }

      const intent = intentResult.rows[0];

      // B. Security: Business Isolation Check
      if (expectedBusinessId && intent.business_id !== expectedBusinessId) {
        console.warn(`[Security] Business mismatch: Intent ${intent.business_id} vs Expected ${expectedBusinessId}`);
        throw new Error('BUSINESS_MISMATCH');
      }

      // C. Validate Intent State
      if (intent.status !== 'created') {
        throw new Error(`INTENT_INVALID_STATUS: ${intent.status}`);
      }

      if (new Date() > new Date(intent.expires_at)) {
        await client.query(
          `UPDATE payment_intents SET status = 'expired' WHERE id = $1`,
          [intentId]
        );
        throw new Error('INTENT_EXPIRED');
      }

      // D. Get/Create Customer Profile
      let customerId: string;
      const customerResult = await client.query(
        `SELECT id FROM customers WHERE user_id = $1 AND business_id = $2`,
        [user.id, intent.business_id]
      );

      if (customerResult.rows.length > 0) {
        customerId = customerResult.rows[0].id;
      } else {
        const newCustomer = await client.query(
          `INSERT INTO customers (business_id, user_id, name, phone, email)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            intent.business_id,
            user.id,
            user.claims.name || 'Customer',
            user.phone || 'Unknown',
            user.email
          ]
        );
        customerId = newCustomer.rows[0].id;
      }

      // E. Create Ledger Entry (V3)
      // - entry_type: payment (Credit to Customer)
      // - amount: POSITIVE (+) because it increases customer's balance/equity
      // - Later, 'debt' entries will be NEGATIVE (-)
      // - status: pending (finalizes in 24h)
      const ledgerResult = await client.query(
        `INSERT INTO ledger_entries (
          business_id,
          customer_id,
          payment_intent_id,
          amount,
          currency,
          status,
          entry_type,
          finalizes_at,
          merchant_confirmed_at,
          customer_confirmed_at,
          reference
        ) VALUES (
          $1, $2, $3, $4, $5, 
          'pending', 
          'payment',
          NOW() + INTERVAL '${FINALIZATION_WINDOW_HOURS} hours',
          $7, -- Merchant confirmed at creation
          NOW(), -- Customer confirms NOW (Critical)
          $6
        )
        RETURNING id, created_at, status, finalizes_at`,
        [
          intent.business_id,
          customerId,
          intent.id,
          intent.amount,
          intent.currency,
          intent.invoice_reference,
          intent.created_at
        ]
      );

      const ledgerEntry = ledgerResult.rows[0];

      // F. Update Intent Status
      await client.query(
        `UPDATE payment_intents SET status = 'used', updated_at = NOW() WHERE id = $1`,
        [intentId]
      );

      // G. Audit Trail (Ledger Event)
      // Using standard action name 'customer_confirmed'
      await client.query(
        `INSERT INTO ledger_events (
          ledger_entry_id,
          actor_user_id,
          action,
          metadata
        ) VALUES ($1, $2, 'customer_confirmed', $3)`,
        [
          ledgerEntry.id,
          user.id,
          JSON.stringify({ 
            intent_id: intentId, 
            amount: intent.amount,
            currency: intent.currency,
            ip: req.headers['x-forwarded-for']
          })
        ]
      );

      return ledgerEntry;
    });

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[PaymentConfirm] Error:', error);
    
    // Handle Database Constraints (Idempotency)
    if (error.code === '23505') { // Unique violation
        if (error.constraint === 'uq_ledger_payment_intent') {
            return res.status(409).json({ error: 'Payment already processed (Idempotent)' });
        }
    }

    if (error.message === 'BUSINESS_MISMATCH') {
        return res.status(403).json({ error: 'Security Alert: Business mismatch detected' });
    }
    if (error.message === 'INTENT_NOT_FOUND') {
      return res.status(404).json({ error: 'Payment request not found' });
    }
    if (error.message === 'INTENT_EXPIRED') {
      return res.status(410).json({ error: 'Payment request expired' });
    }
    if (error.message.startsWith('INTENT_INVALID_STATUS')) {
      return res.status(409).json({ error: 'Payment request already processed or cancelled' });
    }

    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
