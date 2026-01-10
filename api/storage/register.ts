/**
 * Register File Metadata - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for registering uploaded files
 * 
 * Endpoint: POST /api/storage/register
 * 
 * Core Principle:
 * - Files live in R2 (object storage)
 * - Metadata lives in Neon (database)
 * - Access is always mediated by serverless logic
 * 
 * Responsibilities:
 * 1. Validate JWT authentication
 * 2. Extract user_id from JWT
 * 3. Validate business ownership
 * 4. Insert file metadata into database
 * 5. Return file record
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies business ownership
 * - Validates input format
 * - Uses parameterized SQL
 * 
 * Guard Rails:
 * - Cannot register file without authentication
 * - Cannot register file for business user doesn't own
 * - All operations in SQL transaction
 */

import { requireAuth } from '../_auth';
import { query } from '../_db';

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

/**
 * Validate input payload
 */
function validateInput(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { object_key, bucket, mime_type, size, business_id } = body;

  if (!object_key) {
    return { isValid: false, error: 'object_key is required' };
  }

  if (!bucket) {
    return { isValid: false, error: 'bucket is required' };
  }

  if (!mime_type) {
    return { isValid: false, error: 'mime_type is required' };
  }

  if (!size || typeof size !== 'number') {
    return { isValid: false, error: 'size is required and must be a number' };
  }

  if (!business_id) {
    return { isValid: false, error: 'business_id is required' };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(business_id)) {
    return { isValid: false, error: 'business_id must be a valid UUID' };
  }

  return { isValid: true };
}

/**
 * Verify business ownership
 */
async function verifyBusinessOwnership(
  businessId: string,
  userId: string
): Promise<any> {
  const result = await query(
    `SELECT id, owner_id 
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
    let user;
    try {
      user = await requireAuth(req);
      console.log(`[Register File] Authenticated user: ${user.id}`);
    } catch (authError: any) {
      if (authError.message.includes('UNAUTHORIZED')) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.'
        });
      }
      throw authError;
    }

    // STEP 2: Validate input
    const validation = validateInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: validation.error
      });
    }

    const { object_key, bucket, mime_type, size, business_id, original_filename, metadata } = req.body;

    // STEP 3: Verify business ownership
    const business = await verifyBusinessOwnership(business_id, user.id);
    if (!business) {
      console.warn(`[Register File] User ${user.id} attempted to register file for business ${business_id} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this business. Cannot register file.'
      });
    }

    console.log(`[Register File] Business ownership verified: ${business_id} owned by ${user.id}`);

    // STEP 4: Insert file metadata
    const result = await query(
      `INSERT INTO files (
        owner_id,
        business_id,
        bucket,
        object_key,
        mime_type,
        size,
        original_filename,
        metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, owner_id, business_id, bucket, object_key, mime_type, size, original_filename, created_at`,
      [
        user.id,
        business_id,
        bucket,
        object_key,
        mime_type,
        size,
        original_filename || null,
        metadata || {},
      ]
    );

    if (result.rows.length === 0) {
      throw new Error('Failed to register file');
    }

    const fileRecord = result.rows[0];

    console.log(`[Register File] File registered: ${fileRecord.id} for business ${business_id}`);

    // STEP 5: Return success response
    return res.status(201).json({
      success: true,
      data: fileRecord
    });

  } catch (error: any) {
    console.error('[Register File] Error:', error);

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
      message: 'An unexpected error occurred while registering file'
    });
  }
}

