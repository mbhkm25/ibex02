/**
 * Update Business Logo - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for updating business logo
 * 
 * Endpoint: POST /api/business/update-logo
 * 
 * Core Principle:
 * - R2 stores bytes (logo image)
 * - Neon stores metadata (file reference)
 * - JWT enforces ownership
 * - UI only orchestrates
 * 
 * Responsibilities:
 * 1. Validate JWT authentication
 * 2. Extract user_id from JWT
 * 3. Validate business ownership
 * 4. Validate file ownership
 * 5. Update business_profiles.logo_file_id
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies business ownership (business.owner_id === user_id)
 * - Verifies file ownership (file.owner_id === user_id)
 * - Uses parameterized SQL
 * 
 * Guard Rails:
 * - Cannot update logo without authentication
 * - Cannot update logo for business user doesn't own
 * - Cannot use file user doesn't own
 * - All operations in SQL transaction
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

/**
 * Validate input payload
 */
function validateInput(body: any): { isValid: boolean; error?: string } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { business_id, file_id } = body;

  if (!business_id) {
    return { isValid: false, error: 'business_id is required' };
  }

  if (!file_id) {
    return { isValid: false, error: 'file_id is required' };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(business_id)) {
    return { isValid: false, error: 'business_id must be a valid UUID' };
  }

  if (!uuidRegex.test(file_id)) {
    return { isValid: false, error: 'file_id must be a valid UUID' };
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
    `SELECT id, owner_id, business_model, template_id, logo_file_id
     FROM business_profiles 
     WHERE id = $1 AND owner_id = $2`,
    [businessId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

/**
 * Verify file ownership and type
 */
async function verifyFileOwnership(
  fileId: string,
  userId: string
): Promise<any> {
  const result = await query(
    `SELECT id, owner_id, business_id, mime_type, object_key, bucket
     FROM files 
     WHERE id = $1 AND owner_id = $2`,
    [fileId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const file = result.rows[0];

  // Verify it's an image
  if (!file.mime_type.startsWith('image/')) {
    return null; // Not an image
  }

  return file;
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
      console.log(`[Update Logo] Authenticated user: ${user.id}`);
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

    const { business_id, file_id } = req.body;

    // STEP 3: Verify business ownership
    const business = await verifyBusinessOwnership(business_id, user.id);
    if (!business) {
      console.warn(`[Update Logo] User ${user.id} attempted to update logo for business ${business_id} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this business. Cannot update logo.'
      });
    }

    console.log(`[Update Logo] Business ownership verified: ${business_id} owned by ${user.id}`);

    // STEP 4: Verify file ownership and type
    const file = await verifyFileOwnership(file_id, user.id);
    if (!file) {
      console.warn(`[Update Logo] User ${user.id} attempted to use file ${file_id} they don't own or is not an image`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'File not found, not owned by you, or is not an image.'
      });
    }

    // Optional: Verify file belongs to the same business (extra security)
    if (file.business_id !== business_id) {
      console.warn(`[Update Logo] File ${file_id} belongs to different business ${file.business_id}, not ${business_id}`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'File does not belong to this business.'
      });
    }

    console.log(`[Update Logo] File ownership verified: ${file_id} owned by ${user.id}`);

    // STEP 5: Update business logo
    const result = await transaction(async (client) => {
      const updateResult = await client.query(
        `UPDATE business_profiles 
         SET logo_file_id = $1, updated_at = now()
         WHERE id = $2 AND owner_id = $3
         RETURNING id, owner_id, business_model, template_id, logo_file_id, updated_at`,
        [file_id, business_id, user.id]
      );

      if (updateResult.rows.length === 0) {
        throw new Error('Failed to update business logo');
      }

      return updateResult.rows[0];
    });

    console.log(`[Update Logo] Logo updated successfully: business ${business_id} now has logo ${file_id}`);

    // STEP 6: Return success response
    return res.status(200).json({
      success: true,
      data: {
        business_id: result.id,
        logo_file_id: result.logo_file_id,
        updated_at: result.updated_at,
      }
    });

  } catch (error: any) {
    console.error('[Update Logo] Error:', error);

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
      message: 'An unexpected error occurred while updating logo'
    });
  }
}

