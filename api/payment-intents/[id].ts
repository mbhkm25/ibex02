import { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../../_auth';
import { query } from '../../_db';

/**
 * Get Payment Intent Details
 * 
 * Purpose: Retrieve intent details for confirmation screen.
 * Security: Read-only, no sensitive data exposed.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await requireAuth(req);
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    const result = await query(
      `SELECT 
        pi.id, 
        pi.amount, 
        pi.currency, 
        pi.status, 
        pi.invoice_reference, 
        pi.expires_at,
        pi.business_id,
        bp.name as business_name,
        bp.logo_file_id
       FROM payment_intents pi
       JOIN business_profiles bp ON pi.business_id = bp.id
       WHERE pi.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    const intent = result.rows[0];

    // Validation
    if (intent.status !== 'created') {
      return res.status(400).json({ error: `Payment request is ${intent.status}` });
    }

    if (new Date() > new Date(intent.expires_at)) {
      return res.status(410).json({ error: 'Payment request expired' });
    }

    // Return safe data
    return res.status(200).json({
      success: true,
      data: intent
    });

  } catch (error: any) {
    console.error('[GetPaymentIntent] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 500;
    return res.status(status).json({ error: error.message });
  }
}
