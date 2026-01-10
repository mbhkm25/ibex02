/**
 * Products API - Unified Serverless Function
 * 
 * Architecture: Single endpoint for all product image operations
 * 
 * Endpoint: POST /api/products (for add-image)
 * Endpoint: DELETE /api/products (for remove-image)
 * 
 * Operations:
 * - action: 'add-image' - Add product image
 * - action: 'remove-image' - Remove product image
 * 
 * This reduces the number of serverless functions to stay within Vercel Hobby plan limit (12 functions)
 */

import { requireAuth } from '../_auth';
import { query } from '../_db';

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

async function verifyProductOwnership(productId: string, userId: string): Promise<any> {
  // Check if product exists and belongs to a business owned by user
  const result = await query(
    `SELECT p.id, p.business_id, bp.owner_id
     FROM products p
     INNER JOIN business_profiles bp ON p.business_id = bp.id
     WHERE p.id = $1 AND bp.owner_id = $2`,
    [productId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function verifyFileOwnership(fileId: string, userId: string): Promise<any> {
  const result = await query(
    `SELECT id, owner_id, mime_type FROM files WHERE id = $1 AND owner_id = $2`,
    [fileId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

// Handle add-image action
async function handleAddImage(req: VercelRequest, user: any): Promise<any> {
  const { product_id, file_id } = req.body;

  if (!product_id || !file_id) {
    throw new Error('VALIDATION_ERROR: product_id and file_id are required');
  }

  const product = await verifyProductOwnership(product_id, user.id);
  if (!product) {
    throw new Error('FORBIDDEN: Product not found or you do not own it');
  }

  const file = await verifyFileOwnership(file_id, user.id);
  if (!file) {
    throw new Error('FORBIDDEN: File not found or you do not own it');
  }

  if (!file.mime_type.startsWith('image/')) {
    throw new Error('VALIDATION_ERROR: File must be an image');
  }

  // Get current max sort_order
  const maxOrderResult = await query(
    `SELECT COALESCE(MAX(sort_order), 0) as max_order FROM product_images WHERE product_id = $1`,
    [product_id]
  );
  const nextSortOrder = (maxOrderResult.rows[0]?.max_order || 0) + 1;

  const imageId = require('crypto').randomUUID();
  const result = await query(
    `INSERT INTO product_images (id, product_id, file_id, sort_order)
     VALUES ($1, $2, $3, $4)
     RETURNING id, product_id, file_id, sort_order, created_at`,
    [imageId, product_id, file_id, nextSortOrder]
  );

  return result.rows[0];
}

// Handle remove-image action
async function handleRemoveImage(req: VercelRequest, user: any): Promise<any> {
  const imageId = req.query?.image_id as string || req.body?.image_id;

  if (!imageId) {
    throw new Error('VALIDATION_ERROR: image_id is required');
  }

  // Get image with product ownership check
  const imageResult = await query(
    `SELECT pi.id, pi.product_id, p.business_id, bp.owner_id
     FROM product_images pi
     INNER JOIN products p ON pi.product_id = p.id
     INNER JOIN business_profiles bp ON p.business_id = bp.id
     WHERE pi.id = $1 AND bp.owner_id = $2`,
    [imageId, user.id]
  );

  if (imageResult.rows.length === 0) {
    throw new Error('FORBIDDEN: Image not found or you do not own it');
  }

  await query(
    `DELETE FROM product_images WHERE id = $1`,
    [imageId]
  );

  return { success: true, imageId };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const user = await requireAuth(req);
    const action = req.body?.action || req.query?.action as string;

    if (!action) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'action parameter is required'
      });
    }

    let result: any;

    switch (action) {
      case 'add-image':
        if (req.method !== 'POST') {
          return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'POST required for add-image' });
        }
        result = await handleAddImage(req, user);
        break;
      case 'remove-image':
        if (req.method !== 'DELETE' && req.method !== 'POST') {
          return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'DELETE or POST required for remove-image' });
        }
        result = await handleRemoveImage(req, user);
        break;
      default:
        return res.status(400).json({
          error: 'INVALID_ACTION',
          message: `Unknown action: ${action}. Supported actions: add-image, remove-image`
        });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[Products] Error:', error);

    if (error.message.includes('UNAUTHORIZED')) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    if (error.message.includes('FORBIDDEN')) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: error.message.replace('FORBIDDEN: ', '')
      });
    }

    if (error.message.includes('VALIDATION_ERROR')) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: error.message.replace('VALIDATION_ERROR: ', '')
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    });
  }
}

