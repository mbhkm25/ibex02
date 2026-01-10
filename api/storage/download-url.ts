/**
 * Generate Signed Download URL - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for R2 signed download URLs
 * 
 * Endpoint: GET /api/storage/download-url?file_id=uuid
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
 * 3. Verify file ownership
 * 4. Generate signed GET URL for R2
 * 5. Return download URL
 * 
 * Security:
 * - Requires valid JWT token
 * - Verifies file ownership (file.owner_id === user_id)
 * - Uses signed URLs (short-lived, 5 minutes)
 * - No direct file URLs stored
 */

import { requireAuth } from '../_auth';
import { query } from '../_db';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Vercel Serverless Function handler
type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string | string[] | undefined>;
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

/**
 * Verify file ownership
 */
async function verifyFileOwnership(
  fileId: string,
  userId: string
): Promise<any> {
  const result = await query(
    `SELECT id, owner_id, business_id, object_key, bucket, mime_type
     FROM files 
     WHERE id = $1 AND owner_id = $2`,
    [fileId, userId]
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
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET method is supported'
    });
  }

  try {
    // STEP 1: Validate authentication
    let user;
    try {
      user = await requireAuth(req);
      console.log(`[Download URL] Authenticated user: ${user.id}`);
    } catch (authError: any) {
      if (authError.message.includes('UNAUTHORIZED')) {
        return res.status(401).json({
          error: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.'
        });
      }
      throw authError;
    }

    // STEP 2: Get file_id from query
    const fileId = req.query?.file_id;
    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'file_id query parameter is required'
      });
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(fileId)) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'file_id must be a valid UUID'
      });
    }

    // STEP 3: Verify file ownership
    const file = await verifyFileOwnership(fileId, user.id);
    if (!file) {
      console.warn(`[Download URL] User ${user.id} attempted to access file ${fileId} they don't own`);
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'File not found or you do not have access to this file.'
      });
    }

    console.log(`[Download URL] File ownership verified: ${fileId} owned by ${user.id}`);

    // STEP 4: Generate signed GET URL
    const s3Client = getS3Client();
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: file.object_key,
    });

    // Generate signed URL (valid for 5 minutes)
    const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    console.log(`[Download URL] Generated signed URL for ${file.object_key}`);

    // STEP 5: Return success response
    return res.status(200).json({
      success: true,
      data: {
        downloadUrl: downloadUrl,
        objectKey: file.object_key,
        bucket: file.bucket,
        mimeType: file.mime_type,
        expiresIn: 300, // 5 minutes
      }
    });

  } catch (error: any) {
    console.error('[Download URL] Error:', error);

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
      message: 'An unexpected error occurred while generating download URL'
    });
  }
}

