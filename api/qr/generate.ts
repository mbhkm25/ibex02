/**
 * Generate QR Code - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for QR code generation
 * 
 * Endpoint: POST /api/qr/generate
 * 
 * Core Principle:
 * - Data API = Read
 * - Serverless = Decide & Write
 * - DB = Authority
 * - QR generation is a privileged operation
 * 
 * Responsibilities:
 * 1. Validate JWT authentication
 * 2. Extract user_id from JWT
 * 3. Verify business exists and user owns it
 * 4. Validate input (entity_type, entity_id, business_id)
 * 5. Insert QR code into database
 * 6. Return QR code ID and URL
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies business ownership (business.owner_id === user_id)
 * - Uses parameterized SQL (SQL injection protection)
 * - No batch inserts allowed
 * - No frontend ID trust
 * 
 * Guard Rails:
 * - Cannot generate QR without authentication
 * - Cannot generate QR for business user doesn't own
 * - Cannot generate QR with invalid entity_type
 * - All operations in SQL transaction
 * - Fail fast with clear error messages
 */

import { requireAuth } from '../_auth';
import { query, transaction } from '../_db';

// Vercel Serverless Function handler
type VercelRequest = {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[]>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
};

// Valid entity types
const VALID_ENTITY_TYPES = ['business', 'product', 'service', 'payment', 'customer'];

// Get app domain from environment (default to localhost for dev)
const APP_DOMAIN = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:5173';

/**
 * Validate input payload
 */
function validateInput(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { entity_type, entity_id, business_id } = body;

  if (!entity_type) {
    return { isValid: false, error: 'entity_type is required' };
  }

  if (!VALID_ENTITY_TYPES.includes(entity_type)) {
    return { 
      isValid: false, 
      error: `entity_type must be one of: ${VALID_ENTITY_TYPES.join(', ')}` 
    };
  }

  if (!entity_id) {
    return { isValid: false, error: 'entity_id is required' };
  }

  // Validate UUID format (basic check)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(entity_id)) {
    return { isValid: false, error: 'entity_id must be a valid UUID' };
  }

  if (!business_id) {
    return { isValid: false, error: 'business_id is required' };
  }

  if (!uuidRegex.test(business_id)) {
    return { isValid: false, error: 'business_id must be a valid UUID' };
  }

  return { isValid: true };
}

/**
 * Verify business ownership
 * 
 * @param businessId - Business ID to verify
 * @param userId - User ID from JWT
 * @returns Business record if user owns it, null otherwise
 */
async function verifyBusinessOwnership(
  businessId: string,
  userId: string
): Promise<any> {
  const result = await query(
    `SELECT id, owner_id, business_model, template_id 
     FROM business_profiles 
     WHERE id = $1 AND owner_id = $2`,
    [businessId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST method is supported'
    });
  }

  try {
    // STEP 1: Validate authentication
    const user = await requireAuth(req);
    console.log(`[QR Generate] Authenticated user: ${user.id}`);

    // STEP 2: Validate input
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: validation.error
      });
    }

    const { entity_type, entity_id, business_id } = req.body;

    // STEP 3: Verify business ownership
    const business = await verifyBusinessOwnership(business_id, user.id);
    if (!business) {
      console.warn(`[QR Generate] User ${user.id} attempted to generate QR for business ${business_id} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this business. Cannot generate QR code.'
      });
    }

    console.log(`[QR Generate] Business ownership verified: ${business_id} owned by ${user.id}`);

    // STEP 4: Check if QR code already exists for this entity
    const existingQr = await query(
      `SELECT id FROM qr_codes 
       WHERE entity_type = $1 
       AND entity_id = $2 
       AND business_id = $3 
       AND is_active = true`,
      [entity_type, entity_id, business_id]
    );

    if (existingQr.rows.length > 0) {
      const existingQrId = existingQr.rows[0].id;
      return res.status(200).json({
        success: true,
        data: {
          qr_id: existingQrId,
          qr_url: `${APP_DOMAIN}/q/${existingQrId}`,
          message: 'QR code already exists for this entity'
        }
      });
    }

    // STEP 5: Generate QR code (insert into database)
    const result = await transaction(async (client) => {
      // Insert QR code
      const insertResult = await client.query(
        `INSERT INTO qr_codes (
          entity_type,
          entity_id,
          business_id,
          is_active
        ) VALUES ($1, $2, $3, $4)
        RETURNING id, entity_type, entity_id, business_id, created_at`,
        [entity_type, entity_id, business_id, true]
      );

      if (insertResult.rows.length === 0) {
        throw new Error('Failed to create QR code');
      }

      return insertResult.rows[0];
    });

    const qrId = result.id;
    const qrUrl = `${APP_DOMAIN}/q/${qrId}`;

    console.log(`[QR Generate] QR code created: ${qrId} for entity ${entity_type}:${entity_id} in business ${business_id}`);

    // STEP 6: Return success response
    return res.status(201).json({
      success: true,
      data: {
        qr_id: qrId,
        qr_url: qrUrl,
        entity_type,
        entity_id,
        business_id,
        created_at: result.created_at
      }
    });

  } catch (error: any) {
    console.error('[QR Generate] Error:', error);

    // Handle authentication errors
    if (error.message.includes('UNAUTHORIZED') || error.message.includes('Not authenticated')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.'
      });
    }

    // Handle forbidden errors
    if (error.message.includes('FORBIDDEN')) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: error.message
      });
    }

    // Handle validation errors
    if (error.message.includes('VALIDATION_ERROR')) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.message
      });
    }

    // Unknown error
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred while generating QR code'
    });
  }
}

