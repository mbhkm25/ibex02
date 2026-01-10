/**
 * List User Service Requests - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for listing user's service requests
 * 
 * Endpoint: GET /api/service-requests
 * 
 * Responsibilities:
 * 1. Validate user authentication (TODO: implement)
 * 2. Query service_requests for current user
 * 3. Return user's requests only
 * 
 * Security:
 * - User-only (enforced by authentication)
 * - Users can only see their own requests
 * - SQL injection protection (parameterized queries)
 * 
 * TODO: Implement user authentication
 * TODO: Get userId from auth token/session
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

import { query } from './_db';

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

  try {
    // TODO: Get userId from authentication token
    // For now, return empty array until authentication is implemented
    const userId = req.headers?.['x-user-id'] as string | undefined;
    
    if (!userId) {
      // TODO: Return 401 when authentication is implemented
      // For now, return empty array
      return res.status(200).json({
        success: true,
        data: {
          requests: [],
          total: 0,
        }
      });
    }

    // Query user's service requests
    const result = await query(
      'SELECT * FROM service_requests WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: {
        requests: result.rows,
        total: result.rows.length,
      }
    });

  } catch (error: any) {
    console.error('List user service requests error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred while fetching service requests'
    });
  }
}

