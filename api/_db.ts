/**
 * Database Connection Utility
 * 
 * Architecture: Neon PostgreSQL connection for Vercel Serverless Functions
 * 
 * Security:
 * - Connection string from environment variable (DATABASE_URL)
 * - SSL enabled (Neon requirement)
 * - Connection pooling for serverless
 * 
 * Usage:
 * import { query } from '../_db';
 * const result = await query('SELECT * FROM service_requests WHERE id = $1', [id]);
 */

import pg from 'pg';

const { Pool } = pg;

/**
 * Database connection pool
 * 
 * Architecture Decision: Use connection pooling for serverless functions.
 * Pool reuses connections across function invocations, reducing latency.
 * 
 * Neon Requirements:
 * - SSL must be enabled
 * - Connection string format: postgresql://user:pass@host/db?sslmode=require
 */
let pool: pg.Pool | null = null;

/**
 * Get or create database connection pool
 * 
 * Architecture Decision: Lazy initialization.
 * Pool is created on first use, not at module load time.
 * This prevents connection attempts during cold starts.
 */
function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for Neon
      },
      // Serverless-optimized pool settings
      max: 1, // Serverless functions should use minimal connections
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Handle pool errors
    pool.on('error', (err) => {
      console.error('Unexpected database pool error:', err);
    });
  }

  return pool;
}

/**
 * Execute a SQL query
 * 
 * Architecture Decision: Simple query helper.
 * For complex transactions, use getClient() and manage transactions manually.
 * 
 * @param text - SQL query with parameterized placeholders ($1, $2, etc.)
 * @param params - Array of parameter values
 * @returns Query result
 */
export async function query<T extends pg.QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<pg.QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    
    // Log slow queries (optional, for debugging)
    if (duration > 1000) {
      console.warn(`Slow query (${duration}ms):`, text.substring(0, 100));
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get a database client for transactions
 * 
 * Architecture Decision: Expose client for transaction management.
 * Use this when you need to execute multiple queries in a transaction.
 * 
 * IMPORTANT: Always release the client when done!
 * 
 * @returns Database client
 */
export async function getClient(): Promise<pg.PoolClient> {
  const pool = getPool();
  return await pool.connect();
}

/**
 * Execute a transaction
 * 
 * Architecture Decision: Transaction helper for atomic operations.
 * Automatically handles BEGIN, COMMIT, and ROLLBACK.
 * 
 * @param callback - Function that receives a client and performs queries
 * @returns Result from callback
 */
export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 * 
 * Architecture Decision: Graceful shutdown.
 * Call this in cleanup handlers if needed.
 * For serverless, Vercel handles cleanup automatically.
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

