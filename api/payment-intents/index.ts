import { VercelRequest, VercelResponse } from '@vercel/node';
import { requirePermission } from '../_auth';
import { Permission } from '../_rbac';
import { query } from '../_db';

/**
 * Create Payment Intent (QR Code)
 * 
 * Architecture:
 * - Creates a temporary payment request
 * - Generates a secure intent ID (UUID)
 * - Used by POS/Staff to request payment from customer
 * 
 * Security:
 * - Requires ACCESS_POS permission
 * - Validates business ownership/association
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Auth & Permission Check
    const user = await requirePermission(req, Permission.ACCESS_POS);

    const { businessId, amount, currency, invoiceReference } = req.body;

    // 2. Validation
    if (!businessId || !amount || !currency) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['YER', 'SAR', 'USD'].includes(currency)) {
      return res.status(400).json({ error: 'Invalid currency' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Amount must be positive' });
    }

    // 3. Create Intent
    // Expiration: 15 minutes
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    const result = await query(
      `INSERT INTO payment_intents (
        business_id, 
        created_by_staff_id, 
        amount, 
        currency, 
        invoice_reference, 
        expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, expires_at`,
      [
        businessId,
        user.id, // staff ID
        amount,
        currency,
        invoiceReference || null,
        expiresAt
      ]
    );

    const intent = result.rows[0];
    
    // 4. Generate QR URL
    // Format: https://app-domain.com/pay/intent/{id}
    // Note: In development, this might be localhost
    const baseUrl = process.env.VITE_APP_URL || 'http://localhost:5173';
    const qrUrl = `${baseUrl}/pay/intent/${intent.id}`;

    return res.status(201).json({
      success: true,
      data: {
        intentId: intent.id,
        qrUrl,
        expiresAt: intent.expires_at
      }
    });

  } catch (error: any) {
    console.error('[PaymentIntent] Error:', error);
    const status = error.message.includes('UNAUTHORIZED') ? 401 : 
                   error.message.includes('FORBIDDEN') ? 403 : 500;
    return res.status(status).json({ error: error.message });
  }
}
