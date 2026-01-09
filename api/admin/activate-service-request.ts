/**
 * Activate Service Request - Serverless Function
 * 
 * Architecture: Vercel Serverless Function for business activation
 * 
 * Endpoint: POST /api/admin/activate-service-request
 * 
 * Core Principle:
 * - Users choose Business Model (intent)
 * - Backend decides Template (structure)
 * - System creates Business Instance (reality)
 * 
 * Responsibilities:
 * 1. Validate admin authentication (MVP: admin secret)
 * 2. Validate request exists and is approved
 * 3. Validate businessModel is present
 * 4. Resolve template deterministically
 * 5. Create BusinessProfile in transaction
 * 6. Create TemplateInstance in transaction
 * 7. Update ServiceRequest status → activated
 * 8. Return created BusinessProfile
 * 
 * Guard Rails:
 * - Cannot activate without admin secret
 * - Cannot activate without businessModel
 * - Cannot activate without template resolution
 * - Cannot activate twice
 * - All operations in SQL transaction
 * - Fail fast with clear error messages
 * 
 * Security (MVP):
 * - Admin-only (enforced by ADMIN_SECRET header)
 * - Input validation
 * - SQL injection protection (parameterized queries)
 * 
 * TODO: Replace ADMIN_SECRET with real authentication system
 * TODO: Replace header-based auth with role-based access control (RBAC)
 * TODO: Implement JWT tokens with proper expiration
 * TODO: Add session management
 * TODO: Implement proper admin role verification
 */

// Vercel Serverless Function handler
// Vercel automatically provides Request and Response types
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
import { query, transaction } from '../_db';

/**
 * Template mapping (deterministic)
 * 
 * Architecture Decision: Hardcoded mapping for MVP.
 * Each businessModel maps to exactly ONE template.
 * No scoring, no AI, no randomness.
 */
/**
 * Template mapping (deterministic)
 * Maps business_model to template ID from database
 */
const TEMPLATE_MAP: Record<string, string> = {
  commerce: 'COMMERCE_BASE',
  food: 'FOOD_BASE',
  services: 'SERVICES_BASE',
  rental: 'RENTAL_BASE',
};


/**
 * Validate admin secret from request header
 * 
 * MVP Security: Simple secret-based authentication
 * 
 * TODO: Replace with proper JWT token validation
 * TODO: Replace with role-based access control
 * 
 * @param req - Vercel request object
 * @returns true if secret is valid, false otherwise
 */
function validateAdminSecret(req: VercelRequest): boolean {
  const expectedSecret = process.env.ADMIN_SECRET;
  
  // If ADMIN_SECRET is not configured, reject all requests
  if (!expectedSecret) {
    console.error('[Security] ADMIN_SECRET environment variable is not set. All admin requests are rejected.');
    return false;
  }
  
  // Get secret from header
  const providedSecret = req.headers['x-admin-secret'];
  
  // Handle both string and array (Vercel may normalize headers)
  const secretValue = Array.isArray(providedSecret) 
    ? providedSecret[0] 
    : providedSecret;
  
  if (!secretValue) {
    console.warn('[Security] Admin activation attempt without x-admin-secret header');
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  // For MVP, simple comparison is acceptable
  // TODO: Use crypto.timingSafeEqual for production
  const isValid = secretValue === expectedSecret;
  
  if (!isValid) {
    console.warn('[Security] Admin activation attempt with invalid secret');
  }
  
  return isValid;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'Only POST method is supported'
    });
  }

  // STEP 2: Validate admin secret (CRITICAL - must be first check)
  // TODO: Replace ADMIN_SECRET with real authentication
  if (!validateAdminSecret(req)) {
    console.error('[Security] Unauthorized activation attempt blocked');
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Admin authentication required. Invalid or missing admin secret.'
    });
  }

  try {
    const { serviceRequestId } = req.body;

    // Validate input
    if (!serviceRequestId) {
      return res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: 'serviceRequestId is required'
      });
    }

    // Execute activation in transaction
    const result = await transaction(async (client) => {
      // Step 1: Fetch service request
      const requestResult = await client.query(
        `SELECT * FROM service_requests WHERE id = $1`,
        [serviceRequestId]
      );

      if (requestResult.rows.length === 0) {
        throw new Error('SERVICE_REQUEST_NOT_FOUND');
      }

      const serviceRequest = requestResult.rows[0];

      // Step 2: Validate prerequisites
      // Guard: Request must be approved
      if (serviceRequest.status !== 'approved') {
        throw new Error(`INVALID_STATUS: Request is ${serviceRequest.status}, must be 'approved'`);
      }

      // Guard: Request must not already be activated
      if (serviceRequest.status === 'activated') {
        throw new Error('ALREADY_ACTIVATED: Request is already activated');
      }

      // Guard: businessModel is required
      if (!serviceRequest.business_model) {
        throw new Error('MISSING_BUSINESS_MODEL: businessModel is required for activation');
      }

      // Step 3: Resolve template (deterministic)
      const templateId = TEMPLATE_MAP[serviceRequest.business_model];
      if (!templateId) {
        throw new Error(`INVALID_BUSINESS_MODEL: No template found for business model '${serviceRequest.business_model}'`);
      }

      // Step 4: Generate business profile ID
      const businessProfileId = crypto.randomUUID();

      // Step 5: Create BusinessProfile (minimal schema)
      const businessProfileResult = await client.query(
        `INSERT INTO business_profiles (
          id,
          service_request_id,
          business_model,
          template_id
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING *`,
        [
          businessProfileId,
          serviceRequest.id,
          serviceRequest.business_model,
          templateId,
        ]
      );

      const businessProfile = businessProfileResult.rows[0];

      // Step 6: Update ServiceRequest status → activated
      await client.query(
        `UPDATE service_requests 
         SET status = 'activated', 
             updated_at = $1 
         WHERE id = $2`,
        [
          new Date().toISOString(),
          serviceRequest.id,
        ]
      );

      return {
        businessProfile: {
          ...businessProfile,
        },
        templateId: templateId,
        activationDate: new Date().toISOString(),
      };
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Activation error:', error);

    // Handle known errors
    if (error.message === 'SERVICE_REQUEST_NOT_FOUND') {
      return res.status(404).json({
        error: 'SERVICE_REQUEST_NOT_FOUND',
        message: 'Service request not found'
      });
    }

    if (error.message.startsWith('INVALID_STATUS:')) {
      return res.status(400).json({
        error: 'INVALID_STATUS',
        message: error.message.replace('INVALID_STATUS: ', '')
      });
    }

    if (error.message === 'ALREADY_ACTIVATED') {
      return res.status(400).json({
        error: 'ALREADY_ACTIVATED',
        message: 'Service request is already activated'
      });
    }

    if (error.message === 'MISSING_BUSINESS_MODEL') {
      return res.status(400).json({
        error: 'MISSING_BUSINESS_MODEL',
        message: 'Business model is required for activation'
      });
    }

    if (error.message.startsWith('INVALID_BUSINESS_MODEL:')) {
      return res.status(400).json({
        error: 'INVALID_BUSINESS_MODEL',
        message: error.message.replace('INVALID_BUSINESS_MODEL: ', '')
      });
    }

    // Unknown error
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred during activation'
    });
  }
}

