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
      const errorText = await response.text();
      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText || `API Error: ${response.status}` };
      }
      throw new Error(errorData.error || errorData.message || `API Error: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Handle different response structures
    // Some APIs return { success: true, data: ... }
    // Others return data directly
    if (responseData.success !== undefined) {
      // If response has success field, return the whole object
      return responseData;
    }
    
    // Otherwise return data directly
    return responseData;
  } catch (error) {
    throw error;
  }
}
