/**
 * Add Product Image - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for adding product images
 * 
 * Endpoint: POST /api/products/add-image
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
 * 4. Validate file ownership
 * 5. Insert into product_images
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies product ownership (product.business.owner_id === user_id)
 * - Verifies file ownership (file.owner_id === user_id)
 * - Verifies file is an image
 * - Uses parameterized SQL
 * 
 * Guard Rails:
 * - Cannot add image without authentication
 * - Cannot add image for product user doesn't own
 * - Cannot use file user doesn't own
 * - Cannot use non-image files
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

  const { product_id, file_id } = body;

  if (!product_id) {
    return { isValid: false, error: 'product_id is required' };
  }

  if (!file_id) {
    return { isValid: false, error: 'file_id is required' };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(product_id)) {
    return { isValid: false, error: 'product_id must be a valid UUID' };
  }

  if (!uuidRegex.test(file_id)) {
    return { isValid: false, error: 'file_id must be a valid UUID' };
  }

  return { isValid: true };
}

/**
 * Verify product ownership (via business)
 */
async function verifyProductOwnership(
  productId: string,
  userId: string
): Promise<any> {
  const result = await query(
    `SELECT p.id, p.business_id, bp.owner_id, bp.business_model
     FROM products p
     INNER JOIN business_profiles bp ON p.business_id = bp.id
     WHERE p.id = $1 AND bp.owner_id = $2`,
    [productId, userId]
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

/**
 * Get next sort order for product images
 */
async function getNextSortOrder(productId: string): Promise<number> {
  const result = await query(
    `SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order
     FROM product_images
     WHERE product_id = $1`,
    [productId]
  );

  return result.rows[0]?.next_order || 0;
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
      console.log(`[Add Product Image] Authenticated user: ${user.id}`);
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

    const { product_id, file_id } = req.body;

    // STEP 3: Verify product ownership
    const product = await verifyProductOwnership(product_id, user.id);
    if (!product) {
      console.warn(`[Add Product Image] User ${user.id} attempted to add image to product ${product_id} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this product. Cannot add image.'
      });
    }

    console.log(`[Add Product Image] Product ownership verified: ${product_id} owned by ${user.id}`);

    // STEP 4: Verify file ownership and type
    const file = await verifyFileOwnership(file_id, user.id);
    if (!file) {
      console.warn(`[Add Product Image] User ${user.id} attempted to use file ${file_id} they don't own or is not an image`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'File not found, not owned by you, or is not an image.'
      });
    }

    // Optional: Verify file belongs to the same business (extra security)
    if (file.business_id !== product.business_id) {
      console.warn(`[Add Product Image] File ${file_id} belongs to different business ${file.business_id}, not ${product.business_id}`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'File does not belong to the same business as the product.'
      });
    }

    console.log(`[Add Product Image] File ownership verified: ${file_id} owned by ${user.id}`);

    // STEP 5: Get next sort order
    const sortOrder = await getNextSortOrder(product_id);

    // STEP 6: Insert product image
    const result = await transaction(async (client) => {
      // Check if image already exists for this product
      const existing = await client.query(
        `SELECT id FROM product_images 
         WHERE product_id = $1 AND file_id = $2`,
        [product_id, file_id]
      );

      if (existing.rows.length > 0) {
        // Image already exists, return existing
        return existing.rows[0];
      }

      const insertResult = await client.query(
        `INSERT INTO product_images (product_id, file_id, sort_order)
         VALUES ($1, $2, $3)
         RETURNING id, product_id, file_id, sort_order, created_at`,
        [product_id, file_id, sortOrder]
      );

      return insertResult.rows[0];
    });

    console.log(`[Add Product Image] Image added successfully: product ${product_id} now has image ${file_id}`);

    // STEP 7: Return success response
    return res.status(201).json({
      success: true,
      data: {
        id: result.id,
        product_id: result.product_id,
        file_id: result.file_id,
        sort_order: result.sort_order,
        created_at: result.created_at,
      }
    });

  } catch (error: any) {
    console.error('[Add Product Image] Error:', error);

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
      message: 'An unexpected error occurred while adding product image'
    });
  }
}

