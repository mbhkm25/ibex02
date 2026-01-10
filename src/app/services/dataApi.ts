/**
 * Neon Data API Client
 * 
 * Architecture: Reusable client for Neon Data API (REST)
 * 
 * Core Principle:
 * - Data API = Read
 * - Serverless = Decide
 * - UI = Reflect
 * 
 * Security:
 * - Always attaches JWT token from auth service
 * - Handles 401 (unauthorized) → logout
 * - Handles 403 (forbidden) → error
 * - Handles empty responses → empty state
 * 
 * Endpoint: https://ep-flat-hall-a7h51kjz.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1
 */

import { getAccessToken, logout } from './auth';

const DATA_API_BASE = 'https://ep-flat-hall-a7h51kjz.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1';

export interface DataApiOptions {
  select?: string;
  filter?: Record<string, any>;
  order?: string;
  limit?: number;
  offset?: number;
}

export interface DataApiResponse<T> {
  data: T[];
  error?: {
    message: string;
    code?: string;
  };
}

/**
 * Get authorization headers with JWT token
 * 
 * Note: Neon Data API REST requires:
 * - Authorization: Bearer <JWT> for RLS authentication
 * - apikey: Project API key (optional if using JWT for RLS)
 * 
 * For RLS to work, we need the JWT in Authorization header.
 * The apikey is typically the project's anon key, but for RLS
 * we use the JWT token for both.
 */
function getAuthHeaders(): Record<string, string> {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'apikey': token, // Use JWT as apikey for RLS (Neon will validate via Authorization header)
    'Prefer': 'return=representation', // Return data in response
  };
}

/**
 * Build query string from options
 */
function buildQueryString(options: DataApiOptions): string {
  const params = new URLSearchParams();

  if (options.select) {
    params.append('select', options.select);
  }

  if (options.filter) {
    Object.entries(options.filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, `eq.${value}`);
      }
    });
  }

  if (options.order) {
    params.append('order', options.order);
  }

  if (options.limit) {
    params.append('limit', options.limit.toString());
  }

  if (options.offset) {
    params.append('offset', options.offset.toString());
  }

  return params.toString();
}

/**
 * Handle API errors
 */
function handleError(response: Response): never {
  if (response.status === 401) {
    // Unauthorized - logout user
    logout();
    window.location.href = '/login';
    throw new Error('Session expired. Please log in again.');
  }

  if (response.status === 403) {
    // Forbidden - user doesn't have permission
    throw new Error('You do not have permission to access this resource.');
  }

  // Other errors
  throw new Error(`API request failed: ${response.status} ${response.statusText}`);
}

/**
 * Query data from Neon Data API
 * 
 * @param table - Table name (e.g., 'service_requests')
 * @param options - Query options (select, filter, order, limit, offset)
 * @returns Array of data rows
 * 
 * @example
 * ```typescript
 * const requests = await queryData('service_requests', {
 *   select: 'id,status,business_model,business_name,created_at',
 *   order: 'created_at.desc',
 *   limit: 10
 * });
 * ```
 */
export async function queryData<T = any>(
  table: string,
  options: DataApiOptions = {}
): Promise<T[]> {
  try {
    const headers = getAuthHeaders();
    const queryString = buildQueryString(options);
    const url = `${DATA_API_BASE}/${table}${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      handleError(response);
    }

    const data = await response.json();
    
    // Neon Data API returns array directly
    return Array.isArray(data) ? data : [];
  } catch (error: any) {
    // Re-throw auth errors
    if (error.message.includes('Not authenticated') || error.message.includes('Session expired')) {
      throw error;
    }

    console.error(`Data API query error (${table}):`, error);
    throw new Error(`Failed to fetch data from ${table}: ${error.message}`);
  }
}

/**
 * Get a single row by ID
 * 
 * @param table - Table name
 * @param id - Row ID (UUID)
 * @param select - Columns to select (default: '*')
 * @returns Single row or null if not found
 * 
 * @example
 * ```typescript
 * const request = await getById('service_requests', '123e4567-e89b-12d3-a456-426614174000');
 * ```
 */
export async function getById<T = any>(
  table: string,
  id: string,
  select: string = '*'
): Promise<T | null> {
  try {
    const headers = getAuthHeaders();
    const url = `${DATA_API_BASE}/${table}?id=eq.${id}&select=${select}`;

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      handleError(response);
    }

    const data = await response.json();
    
    // Return first row or null
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error: any) {
    if (error.message.includes('Not authenticated') || error.message.includes('Session expired')) {
      throw error;
    }

    console.error(`Data API getById error (${table}, ${id}):`, error);
    throw new Error(`Failed to fetch ${table} with id ${id}: ${error.message}`);
  }
}

/**
 * Count rows in a table
 * 
 * @param table - Table name
 * @param filter - Optional filter conditions
 * @returns Count of rows
 * 
 * @example
 * ```typescript
 * const count = await countRows('service_requests', { status: 'approved' });
 * ```
 */
export async function countRows(
  table: string,
  filter?: Record<string, any>
): Promise<number> {
  try {
    const headers = getAuthHeaders();
    const queryString = filter ? buildQueryString({ filter }) : '';
    const url = `${DATA_API_BASE}/${table}${queryString ? `?${queryString}` : ''}`;

    // Use HEAD request with Prefer: count=exact header
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        ...headers,
        'Prefer': 'count=exact',
      },
    });

    if (!response.ok) {
      handleError(response);
    }

    // Get count from Content-Range header
    const contentRange = response.headers.get('Content-Range');
    if (contentRange) {
      const match = contentRange.match(/\/(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    }

    return 0;
  } catch (error: any) {
    if (error.message.includes('Not authenticated') || error.message.includes('Session expired')) {
      throw error;
    }

    console.error(`Data API countRows error (${table}):`, error);
    return 0;
  }
}

