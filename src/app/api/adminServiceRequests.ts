/**
 * Admin Service Requests API Client
 * 
 * Architecture: Frontend API client for admin service request operations
 * 
 * This file contains the API client functions that would call the backend.
 * In production, these would make actual HTTP requests.
 * For MVP, they're structured to show the expected API contract.
 */

import { 
  ServiceRequest, 
  ApproveRequestPayload, 
  RejectRequestPayload,
  ActivateBusinessPayload 
} from '../types/serviceRequest';
import { activateBusiness, canActivateBusiness } from '../services/businessActivationService';
import { getAuthHeader, isAdmin } from '../services/auth';

/**
 * Base API URL (would be from environment in production)
 */
const API_BASE_URL = '/api/admin/service-requests';

/**
 * Approve service request
 * 
 * POST /api/admin/service-requests/:id/approve
 * 
 * TODO: Implement this endpoint in serverless function
 */
export async function approveServiceRequest(
  requestId: string,
  payload: ApproveRequestPayload
): Promise<ServiceRequest> {
  // TODO: Implement actual API endpoint
  throw new Error('approveServiceRequest API endpoint not yet implemented.');
}

/**
 * Reject service request
 * 
 * POST /api/admin/service-requests/:id/reject
 * 
 * TODO: Implement this endpoint in serverless function
 */
export async function rejectServiceRequest(
  requestId: string,
  payload: RejectRequestPayload
): Promise<ServiceRequest> {
  // TODO: Implement actual API endpoint
  throw new Error('rejectServiceRequest API endpoint not yet implemented.');
}

/**
 * Activate business from approved service request
 * 
 * POST /api/admin/activate-service-request
 * 
 * Architecture Decision: This endpoint calls the serverless function.
 * All business logic runs server-side.
 * 
 * Rules:
 * - Admin-only (enforced by backend via ADMIN_SECRET)
 * - Idempotent (safe to retry)
 * - Fails if request not approved
 * - Returns created BusinessProfile
 * 
 * Security (MVP):
 * - Sends admin secret in x-admin-secret header
 * - Secret is read from environment variable (VITE_ADMIN_SECRET)
 * 
 * TODO: Replace ADMIN_SECRET with real authentication system
 * TODO: Replace header-based auth with JWT tokens
 * TODO: Implement proper session management
 */
export async function activateBusinessFromRequest(
  requestId: string,
  payload?: ActivateBusinessPayload
): Promise<{
  businessProfile: any; // BusinessProfile type
  templateInstance: any; // TemplateInstance type
  activationDate: string;
}> {
  // Check if user is authenticated and has admin role
  if (!isAdmin()) {
    throw new Error('Admin role required to activate businesses');
  }
  
  // Get JWT token from auth service
  const authHeaders = getAuthHeader();
  if (!authHeaders.Authorization) {
    throw new Error('Not authenticated. Please log in.');
  }
  
  // Call serverless function with JWT token
  const response = await fetch('/api/admin/activate-service-request', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      ...authHeaders, // Send JWT token in Authorization header
    },
    body: JSON.stringify({ 
      serviceRequestId: requestId,
      ...payload 
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Activation failed' }));
    throw new Error(error.message || `Activation failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get service request by ID
 * 
 * GET /api/admin/service-requests/:id
 * 
 * TODO: Implement this endpoint in serverless function
 */
export async function getServiceRequest(requestId: string): Promise<ServiceRequest> {
  // TODO: Implement actual API endpoint
  throw new Error('getServiceRequest API endpoint not yet implemented. Service requests must be fetched via listServiceRequests.');
}

/**
 * List service requests
 * 
 * GET /api/admin/service-requests
 * 
 * Architecture: Calls serverless function to fetch from database
 */
export async function listServiceRequests(params?: {
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  requests: ServiceRequest[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const adminSecret = getAdminSecret();
  
  if (!adminSecret) {
    throw new Error('Admin secret is not configured.');
  }

  // Build query string
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());

  const response = await fetch(`/api/admin/service-requests?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Failed to fetch service requests' }));
    throw new Error(error.message || `Failed to fetch service requests: ${response.statusText}`);
  }

  const result = await response.json();
  return result.data;
}

