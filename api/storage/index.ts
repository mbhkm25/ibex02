/**
 * Storage API - Unified Serverless Function
 * 
 * Architecture: Single endpoint for all storage operations
 * 
 * Endpoint: POST /api/storage
 * 
 * Operations:
 * - action: 'upload-url' - Generate signed upload URL
 * - action: 'register' - Register file metadata
 * - action: 'download-url' - Generate signed download URL
 * 
 * This reduces the number of serverless functions to stay within Vercel Hobby plan limit (12 functions)
 */

import { requireAuth } from '../_auth';
import { query } from '../_db';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

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

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

async function verifyBusinessOwnership(businessId: string, userId: string): Promise<any> {
  const result = await query(
    `SELECT id, owner_id FROM business_profiles WHERE id = $1 AND owner_id = $2`,
    [businessId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

async function verifyFileOwnership(fileId: string, userId: string): Promise<any> {
  const result = await query(
    `SELECT id, owner_id, business_id, object_key, bucket, mime_type FROM files WHERE id = $1 AND owner_id = $2`,
    [fileId, userId]
  );
  return result.rows.length > 0 ? result.rows[0] : null;
}

function generateObjectKey(businessId: string, mimeType: string): string {
  const uuid = randomUUID();
  const extension = mimeType.split('/')[1] || 'bin';
  return `business/${businessId}/${uuid}.${extension}`;
}

// Handle upload-url action
async function handleUploadUrl(req: VercelRequest, user: any): Promise<any> {
  const { business_id, mime_type, file_size } = req.body;

  if (!mime_type || !file_size || !business_id) {
    throw new Error('VALIDATION_ERROR: mime_type, file_size, and business_id are required');
  }

  if (!ALLOWED_MIME_TYPES.includes(mime_type) && !mime_type.startsWith('image/')) {
    throw new Error(`VALIDATION_ERROR: MIME type '${mime_type}' is not allowed`);
  }

  if (file_size > MAX_FILE_SIZE) {
    throw new Error(`VALIDATION_ERROR: File size exceeds maximum (5MB)`);
  }

  const business = await verifyBusinessOwnership(business_id, user.id);
  if (!business) {
    throw new Error('FORBIDDEN: You do not own this business');
  }

  const objectKey = generateObjectKey(business_id, mime_type);
  const s3Client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: objectKey,
    ContentType: mime_type,
    ContentLength: file_size,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return {
    uploadUrl,
    objectKey,
    bucket: R2_BUCKET_NAME,
    expiresIn: 300,
  };
}

// Handle register action
async function handleRegister(req: VercelRequest, user: any): Promise<any> {
  const { object_key, bucket, mime_type, size, business_id } = req.body;

  if (!object_key || !bucket || !mime_type || !size || !business_id) {
    throw new Error('VALIDATION_ERROR: All fields are required');
  }

  const business = await verifyBusinessOwnership(business_id, user.id);
  if (!business) {
    throw new Error('FORBIDDEN: You do not own this business');
  }

  const fileId = randomUUID();
  const result = await query(
    `INSERT INTO files (id, owner_id, business_id, bucket, object_key, mime_type, size)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, owner_id, business_id, bucket, object_key, mime_type, size, created_at`,
    [fileId, user.id, business_id, bucket, object_key, mime_type, size]
  );

  return result.rows[0];
}

// Handle download-url action
async function handleDownloadUrl(req: VercelRequest, user: any): Promise<any> {
  const fileId = req.query?.file_id as string;

  if (!fileId) {
    throw new Error('VALIDATION_ERROR: file_id is required');
  }

  const file = await verifyFileOwnership(fileId, user.id);
  if (!file) {
    throw new Error('FORBIDDEN: File not found or you do not own it');
  }

  const s3Client = getS3Client();
  const command = new GetObjectCommand({
    Bucket: file.bucket,
    Key: file.object_key,
  });

  const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

  return {
    downloadUrl,
    fileId: file.id,
    expiresIn: 300,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST and GET methods are supported'
    });
  }

  try {
    const user = await requireAuth(req);
    // For GET requests, action comes from query; for POST, from body
    const action = req.method === 'GET' 
      ? (req.query?.action as string)
      : (req.body?.action || req.query?.action as string);

    if (!action) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'action parameter is required'
      });
    }

    let result: any;

    switch (action) {
      case 'upload-url':
        result = await handleUploadUrl(req, user);
        break;
      case 'register':
        result = await handleRegister(req, user);
        break;
      case 'download-url':
        result = await handleDownloadUrl(req, user);
        break;
      default:
        return res.status(400).json({
          error: 'INVALID_ACTION',
          message: `Unknown action: ${action}. Supported actions: upload-url, register, download-url`
        });
    }

    return res.status(200).json({
      success: true,
      data: result
    });

  } catch (error: any) {
    console.error('[Storage] Error:', error);

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

