/**
 * List Service Requests - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for listing service requests
 * 
 * Endpoint: GET /api/admin/service-requests
 * 
 * Responsibilities:
 * 1. Validate admin authentication (MVP: admin secret)
 * 2. Query service_requests from database
 * 3. Support filtering by status
 * 4. Return paginated results
 * 
 * Security:
 * - Admin-only (enforced by ADMIN_SECRET header)
 * - Input validation
 * - SQL injection protection (parameterized queries)
 * 
 * TODO: Replace ADMIN_SECRET with real authentication system
 */

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

import { query } from '../_db';

/**
 * Validate admin secret from request header
 */
function validateAdminSecret(req: VercelRequest): boolean {
  const expectedSecret = process.env.ADMIN_SECRET;
  
  if (!expectedSecret) {
    console.error('[Security] ADMIN_SECRET environment variable is not set.');
    return false;
  }
  
  const providedSecret = req.headers?.['x-admin-secret'];
  const secretValue = Array.isArray(providedSecret) 
    ? providedSecret[0] 
    : providedSecret;
  
  if (!secretValue) {
    console.warn('[Security] Admin request without x-admin-secret header');
    return false;
  }
  
  return secretValue === expectedSecret;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only GET method is supported'
    });
  }

  // Validate admin secret
  if (!validateAdminSecret(req)) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Admin authentication required. Invalid or missing admin secret.'
    });
  }

  try {
    // Get query parameters
    const status = req.query?.status as string | undefined;
    const page = parseInt(req.query?.page as string || '1', 10);
    const pageSize = Math.min(parseInt(req.query?.pageSize as string || '20', 10), 100);
    const offset = (page - 1) * pageSize;

    // Build query
    let queryText = 'SELECT * FROM service_requests';
    const params: any[] = [];
    
    if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
    }
    
    queryText += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(pageSize, offset);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM service_requests';
    const countParams: any[] = [];
    
    if (status) {
      countQuery += ' WHERE status = $1';
      countParams.push(status);
    }

    // Execute queries
    const [requestsResult, countResult] = await Promise.all([
      query(queryText, params),
      query(countQuery, countParams)
    ]);

    const total = parseInt(countResult.rows[0].total, 10);

    // Format response
    return res.status(200).json({
      success: true,
      data: {
        requests: requestsResult.rows,
        total,
        page,
        pageSize,
      }
    });

  } catch (error: any) {
    console.error('List service requests error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred while fetching service requests'
    });
  }
}

