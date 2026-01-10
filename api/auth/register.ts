/**
 * User Registration - Serverless Function
 * 
 * Architecture: Proxy to Neon Auth for user registration
 * 
 * Endpoint: POST /api/auth/register
 * 
 * Responsibilities:
 * 1. Validate input (email, password, phone)
 * 2. Call Neon Auth signup endpoint
 * 3. Return JWT tokens
 * 4. Handle errors gracefully
 */

type VercelRequest = {
  method?: string;
  body?: any;
  headers?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
};

const NEON_AUTH_BASE = process.env.NEON_AUTH_BASE || 'https://ep-flat-hall-a7h51kjz.neonauth.ap-southeast-2.aws.neon.tech/neondb/auth';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only POST method is supported'
    });
  }

  try {
    const { email, password, phone, fullName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required'
      });
    }

    // Call Neon Auth signup endpoint
    // Neon Auth uses OIDC-compatible endpoints
    // Based on Neon Auth documentation, the correct endpoint is /signupEmailPassword
    // But we'll also try /signup and /register as fallbacks
    
    let authResponse: Response | null = null;
    let authData: any = null;
    let lastError: any = null;
    const triedEndpoints: string[] = [];

    // Prepare request body according to Neon Auth format
    const requestBody: any = {
      email,
      password,
    };
    
    // Add optional fields if provided
    if (phone) {
      requestBody.phone = phone;
    }
    if (fullName) {
      requestBody.name = fullName;
      // Some Neon Auth implementations also accept full_name
      requestBody.full_name = fullName;
    }

    // Try /signupEmailPassword first (most common for Neon Auth)
    const endpoints = [
      '/signupEmailPassword',
      '/signup',
      '/register',
      '/v1/signup',
      '/v1/register',
    ];

    for (const endpoint of endpoints) {
      try {
        const url = `${NEON_AUTH_BASE}${endpoint}`;
        triedEndpoints.push(url);
        
        console.log(`[Register] Trying endpoint: ${url}`);
        
        authResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const responseText = await authResponse.text();
        console.log(`[Register] Response status: ${authResponse.status}`);
        console.log(`[Register] Response body: ${responseText.substring(0, 200)}`);

        if (authResponse.ok) {
          try {
            authData = JSON.parse(responseText);
            console.log(`[Register] Success with endpoint: ${endpoint}`);
            break; // Success, exit loop
          } catch (parseError) {
            console.error(`[Register] Failed to parse response from ${endpoint}:`, parseError);
            lastError = { message: 'Invalid JSON response', endpoint };
            continue;
          }
        } else {
          try {
            lastError = JSON.parse(responseText);
            console.error(`[Register] Error from ${endpoint}:`, lastError);
          } catch {
            lastError = { message: responseText || 'Registration failed', endpoint };
          }
        }
      } catch (error: any) {
        console.error(`[Register] Network error for ${endpoint}:`, error);
        lastError = { message: error.message || 'Network error', endpoint };
      }
    }

    // If all attempts failed
    if (!authResponse || !authResponse.ok || !authData) {
      console.error('[Register] All endpoints failed');
      console.error('[Register] Last error:', lastError);
      console.error('[Register] Tried endpoints:', triedEndpoints);
      
      // Return detailed error for debugging
      return res.status(authResponse?.status || 500).json({
        error: 'REGISTRATION_FAILED',
        message: lastError?.message || lastError?.error || 'فشل إنشاء الحساب. يرجى التحقق من إعدادات Neon Auth.',
        details: {
          triedEndpoints,
          lastError: lastError?.message || lastError?.error,
          statusCode: authResponse?.status,
        }
      });
    }

    // Neon Auth returns tokens in different formats
    // Handle both possible response formats
    const tokens = {
      accessToken: authData.access_token || authData.token || authData.session?.access_token || authData.data?.access_token,
      refreshToken: authData.refresh_token || authData.session?.refresh_token || authData.data?.refresh_token,
      expiresAt: authData.expires_at || (authData.expires_in ? Date.now() + (authData.expires_in * 1000) : Date.now() + 3600000),
      user: authData.user || authData.session?.user || authData.data?.user,
    };

    if (!tokens.accessToken) {
      console.error('[Register] No access token in response:', authData);
      return res.status(500).json({
        error: 'INVALID_RESPONSE',
        message: 'لم يتم استلام رمز الوصول من خدمة المصادقة'
      });
    }

    return res.status(200).json({
      success: true,
      data: tokens
    });

  } catch (error: any) {
    console.error('[Register] Error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى.'
    });
  }
}

