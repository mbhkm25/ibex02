/**
 * Test Database Connection - Serverless Function
 * 
 * Endpoint: GET /api/test-db
 * 
 * Purpose: Verify database connection is working
 */

import { query } from './_db';

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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Test 1: Check if DATABASE_URL is set
    const hasDbUrl = !!process.env.DATABASE_URL;
    
    // Test 2: Try to query database
    let dbConnected = false;
    let tableCount = 0;
    let errorMessage = '';

    if (hasDbUrl) {
      try {
        const result = await query(
          `SELECT COUNT(*) as count 
           FROM information_schema.tables 
           WHERE table_schema = 'public'`
        );
        dbConnected = true;
        tableCount = parseInt(result.rows[0]?.count || '0', 10);
      } catch (error: any) {
        dbConnected = false;
        errorMessage = error.message || 'Unknown database error';
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        hasDatabaseUrl: hasDbUrl,
        databaseConnected: dbConnected,
        tableCount,
        error: errorMessage || null,
        environment: process.env.NODE_ENV || 'development',
      },
      message: dbConnected 
        ? 'Database connection successful!' 
        : hasDbUrl 
          ? `Database connection failed: ${errorMessage}`
          : 'DATABASE_URL environment variable is not set',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
    });
  }
}

