/**
 * Remove Product Image - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for removing product images
 * 
 * Endpoint: DELETE /api/products/remove-image
 * 
 * Core Principle:
 * - R2 stores bytes (image files)
 * - Neon stores relations (product_images table)
 * - JWT enforces ownership
 * - UI orchestrates only
 * 
 * Responsibilities:
 * 1. Validate JWT authentication
 * 2. Extract user_id from JWT
 * 3. Validate product ownership (via business)
 * 4. Remove row from product_images
 * 5. File remains in R2 (not deleted)
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies product ownership (product.business.owner_id === user_id)
 * - Uses parameterized SQL
 * 
 * Guard Rails:
 * - Cannot remove image without authentication
 * - Cannot remove image for product user doesn't own
 * - File is not deleted (only relation removed)
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

  const { image_id } = body;

  if (!image_id) {
    return { isValid: false, error: 'image_id is required' };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(image_id)) {
    return { isValid: false, error: 'image_id must be a valid UUID' };
  }

  return { isValid: true };
}

/**
 * Verify product image ownership (via product and business)
 */
async function verifyImageOwnership(
  imageId: string,
  userId: string
): Promise<any> {
  const result = await query(
    `SELECT pi.id, pi.product_id, pi.file_id, p.business_id, bp.owner_id
     FROM product_images pi
     INNER JOIN products p ON pi.product_id = p.id
     INNER JOIN business_profiles bp ON p.business_id = bp.id
     WHERE pi.id = $1 AND bp.owner_id = $2`,
    [imageId, userId]
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
  // Only allow DELETE
  if (req.method !== 'DELETE') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only DELETE method is supported'
    });
  }

  try {
    // STEP 1: Validate authentication
    let user;
    try {
      user = await requireAuth(req);
      console.log(`[Remove Product Image] Authenticated user: ${user.id}`);
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

    const { image_id } = req.body;

    // STEP 3: Verify image ownership
    const image = await verifyImageOwnership(image_id, user.id);
    if (!image) {
      console.warn(`[Remove Product Image] User ${user.id} attempted to remove image ${image_id} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this product image. Cannot remove.'
      });
    }

    console.log(`[Remove Product Image] Image ownership verified: ${image_id} owned by ${user.id}`);

    // STEP 4: Remove product image (file remains in R2)
    const result = await query(
      `DELETE FROM product_images 
       WHERE id = $1
       RETURNING id, product_id, file_id`,
      [image_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'NOT_FOUND',
        message: 'Product image not found'
      });
    }

    console.log(`[Remove Product Image] Image removed successfully: ${image_id} (file ${image.file_id} remains in R2)`);

    // STEP 5: Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: result.rows[0].id,
        product_id: result.rows[0].product_id,
        file_id: result.rows[0].file_id,
        message: 'Image removed successfully. File remains in storage.'
      }
    });

  } catch (error: any) {
    console.error('[Remove Product Image] Error:', error);

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
      message: 'An unexpected error occurred while removing product image'
    });
  }
}

