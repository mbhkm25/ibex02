/**
 * Storage Service
 * 
 * Architecture: Frontend helper for file uploads to Cloudflare R2
 * 
 * Core Principle:
 * - Files live in R2 (object storage)
 * - Metadata lives in Neon (database)
 * - Access is always mediated by serverless logic
 * - No shortcuts
 * 
 * Flow:
 * 1. Request signed upload URL from serverless
 * 2. Upload file directly to R2 using signed URL
 * 3. Register file metadata in database
 * 
 * Security:
 * - No direct credentials in frontend
 * - All uploads require authentication
 * - File type and size validation
 */

import { getAuthHeader } from './auth';

export interface UploadFileOptions {
  file: File;
  businessId: string;
  originalFilename?: string;
  metadata?: Record<string, any>;
}

export interface UploadFileResult {
  id: string;
  objectKey: string;
  bucket: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

/**
 * Upload file to R2 and register metadata
 * 
 * @param options - Upload options (file, businessId, etc.)
 * @returns File metadata record
 * 
 * @example
 * ```typescript
 * const file = event.target.files[0];
 * const result = await uploadFile({
 *   file,
 *   businessId: '11111111-1111-1111-1111-111111111111'
 * });
 * ```
 */
export async function uploadFile(options: UploadFileOptions): Promise<UploadFileResult> {
  const { file, businessId, originalFilename, metadata } = options;

  // Validate file
  if (!file) {
    throw new Error('File is required');
  }

  // Validate file size (5MB max)
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) {
    throw new Error(`File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size (5MB)`);
  }

  // Validate MIME type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  const isAllowed = allowedTypes.includes(file.type) || file.type.startsWith('image/');
  if (!isAllowed) {
    throw new Error(`File type '${file.type}' is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  try {
    // STEP 1: Request signed upload URL
    const authHeaders = getAuthHeader();
    if (!authHeaders.Authorization) {
      throw new Error('Not authenticated. Please log in.');
    }

    const uploadUrlResponse = await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        action: 'upload-url',
        business_id: businessId,
        mime_type: file.type,
        file_size: file.size,
      }),
    });

    if (!uploadUrlResponse.ok) {
      const error = await uploadUrlResponse.json().catch(() => ({ message: 'Failed to get upload URL' }));
      
      if (uploadUrlResponse.status === 401) {
        throw new Error('انتهت جلسة تسجيل الدخول. يرجى تسجيل الدخول مرة أخرى.');
      }
      
      if (uploadUrlResponse.status === 403) {
        throw new Error('لا تملك هذا العمل. لا يمكن رفع الملف.');
      }
      
      throw new Error(error.message || 'فشل الحصول على رابط الرفع');
    }

    const uploadUrlData = await uploadUrlResponse.json();
    const { uploadUrl, objectKey, bucket } = uploadUrlData.data;

    // STEP 2: Upload file directly to R2 using signed URL
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error('فشل رفع الملف إلى التخزين');
    }

    // STEP 3: Register file metadata in database
    const registerResponse = await fetch('/api/storage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        action: 'register',
        object_key: objectKey,
        bucket: bucket,
        mime_type: file.type,
        size: file.size,
        business_id: businessId,
        original_filename: originalFilename || file.name,
        metadata: metadata || {},
      }),
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json().catch(() => ({ message: 'Failed to register file' }));
      throw new Error(error.message || 'فشل تسجيل بيانات الملف');
    }

    const registerData = await registerResponse.json();
    return registerData.data;

  } catch (error: any) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Get file download URL
 * 
 * Note: This would require a signed download URL endpoint
 * For now, files are accessed via serverless proxy
 * 
 * @param fileId - File ID from database
 * @returns Download URL
 */
export async function getFileUrl(fileId: string): Promise<string> {
  try {
    const authHeaders = getAuthHeader();
    if (!authHeaders.Authorization) {
      throw new Error('Not authenticated. Please log in.');
    }

    const response = await fetch(`/api/storage?action=download-url&file_id=${fileId}`, {
      method: 'GET',
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const data = await response.json();
    return data.data.downloadUrl;
  } catch (error: any) {
    console.error('Failed to get file URL:', error);
    throw error;
  }
}

