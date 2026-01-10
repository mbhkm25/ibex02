/**
 * Generate Signed Upload URL - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for R2 signed upload URLs
 * 
 * Endpoint: POST /api/storage/upload-url
 * 
 * Core Principle:
 * - Files live in R2 (object storage)
 * - Metadata lives in Neon (database)
 * - Access is always mediated by serverless logic
 * - No shortcuts
 * 
 * Responsibilities:
 * 1. Validate JWT authentication
 * 2. Extract user_id from JWT
 * 3. Validate business ownership
 * 4. Validate file type and size
 * 5. Generate signed PUT URL for R2
 * 6. Return upload URL and object key
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies business ownership (business.owner_id === user_id)
 * - Validates MIME type (image/*, application/pdf)
 * - Validates file size (max 5MB)
 * - Uses signed URLs (no direct credentials)
 * 
 * Guard Rails:
 * - Cannot generate upload URL without authentication
 * - Cannot generate upload URL for business user doesn't own
 * - Cannot upload invalid file types
 * - Cannot upload files larger than 5MB
 */

import { requireAuth } from '../_auth';
import { query } from '../_db';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

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

// R2 Configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'assets';
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// S3 Client for R2 (R2 is S3-compatible)
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
      throw new Error('R2 credentials not configured');
    }

    s3Client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }

  return s3Client;
}

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

/**
 * Validate input payload
 */
function validateInput(body: any): { isValid: boolean; error?: string; mimeType?: string; fileSize?: number } {
  if (!body) {
    return { isValid: false, error: 'Request body is required' };
  }

  const { mime_type, file_size, business_id } = body;

  if (!mime_type) {
    return { isValid: false, error: 'mime_type is required' };
  }

  // Validate MIME type
  const isAllowed = ALLOWED_MIME_TYPES.includes(mime_type) || 
                    mime_type.startsWith('image/');
  
  if (!isAllowed) {
    return { 
      isValid: false, 
      error: `MIME type '${mime_type}' is not allowed. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}` 
    };
  }

  if (!file_size) {
    return { isValid: false, error: 'file_size is required' };
  }

  // Validate file size
  if (file_size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size (${(file_size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (5MB)` 
    };
  }

  if (!business_id) {
    return { isValid: false, error: 'business_id is required' };
  }

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(business_id)) {
    return { isValid: false, error: 'business_id must be a valid UUID' };
  }

  return { isValid: true, mimeType: mime_type, fileSize: file_size };
}

/**
 * Verify business ownership
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

/**
 * Generate object key for R2
 */
function generateObjectKey(businessId: string, mimeType: string): string {
  const uuid = randomUUID();
  const extension = mimeType.split('/')[1] || 'bin';
  return `business/${businessId}/${uuid}.${extension}`;
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
      console.log(`[Upload URL] Authenticated user: ${user.id}`);
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

    const { business_id, mime_type, file_size } = req.body;

    // STEP 3: Verify business ownership
    const business = await verifyBusinessOwnership(business_id, user.id);
    if (!business) {
      console.warn(`[Upload URL] User ${user.id} attempted to upload for business ${business_id} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'You do not own this business. Cannot generate upload URL.'
      });
    }

    console.log(`[Upload URL] Business ownership verified: ${business_id} owned by ${user.id}`);

    // STEP 4: Generate object key
    const objectKey = generateObjectKey(business_id, mime_type);

    // STEP 5: Generate signed PUT URL
    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: objectKey,
      ContentType: mime_type,
      ContentLength: file_size,
    });

    // Generate signed URL (valid for 5 minutes)
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    console.log(`[Upload URL] Generated signed URL for ${objectKey}`);

    // STEP 6: Return success response
    return res.status(200).json({
      success: true,
      data: {
        uploadUrl: uploadUrl,
        objectKey: objectKey,
        bucket: R2_BUCKET_NAME,
        expiresIn: 300, // 5 minutes
      }
    });

  } catch (error: any) {
    console.error('[Upload URL] Error:', error);

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

    // Handle R2 configuration errors
    if (error.message.includes('R2 credentials')) {
      return res.status(500).json({
        error: 'CONFIGURATION_ERROR',
        message: 'Storage service is not configured'
      });
    }

    // Unknown error
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred while generating upload URL'
    });
  }
}

