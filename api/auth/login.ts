/**
 * User Login - Serverless Function
 * 
 * Architecture: Proxy to Neon Auth for user login
 * 
 * Endpoint: POST /api/auth/login
 * 
 * Responsibilities:
 * 1. Validate input (email, password)
 * 2. Call Neon Auth login endpoint
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'Email and password are required'
      });
    }

    // Call Neon Auth login endpoint
    // Neon Auth typically uses /token or /signInWithPassword
    const authResponse = await fetch(`${NEON_AUTH_BASE}/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        grant_type: 'password',
      }),
    });

    if (!authResponse.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(`${NEON_AUTH_BASE}/signInWithPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!altResponse.ok) {
        const errorData = await altResponse.json().catch(() => ({ message: 'Login failed' }));
        console.error('[Login] Neon Auth error:', errorData);
        
        return res.status(altResponse.status).json({
          error: 'LOGIN_FAILED',
          message: errorData.message || errorData.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        });
      }

      const altData = await altResponse.json();
      const tokens = {
        accessToken: altData.access_token || altData.token || altData.session?.access_token,
        refreshToken: altData.refresh_token || altData.session?.refresh_token,
        expiresAt: altData.expires_at || (altData.expires_in ? Date.now() + (altData.expires_in * 1000) : Date.now() + 3600000),
        user: altData.user || altData.session?.user,
      };

      return res.status(200).json({
        success: true,
        data: tokens
      });
    }

    const authData = await authResponse.json();

    // Handle OAuth2 token response format
    const tokens = {
      accessToken: authData.access_token || authData.token,
      refreshToken: authData.refresh_token,
      expiresAt: authData.expires_at || (authData.expires_in ? Date.now() + (authData.expires_in * 1000) : Date.now() + 3600000),
      user: authData.user,
    };

    if (!tokens.accessToken) {
      console.error('[Login] No access token in response:', authData);
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
    console.error('[Login] Error:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.'
    });
  }
}

