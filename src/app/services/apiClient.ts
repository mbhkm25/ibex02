/**
 * API Client (BFF)
 * 
 * Architecture:
 * - All requests go to our Vercel Serverless Functions (/api/*)
 * - No direct DB access
 * - Auth0 Token attached automatically
 */

export async function apiFetch<T = any>(
  endpoint: string, 
  token: string, 
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
