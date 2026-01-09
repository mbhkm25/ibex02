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
import { getAdminSecret } from '../config/adminConfig';

/**
 * Base API URL (would be from environment in production)
 */
const API_BASE_URL = '/api/admin/service-requests';

/**
 * Approve service request
 * 
 * POST /api/admin/service-requests/:id/approve
 */
export async function approveServiceRequest(
  requestId: string,
  payload: ApproveRequestPayload
): Promise<ServiceRequest> {
  // In production: Actual HTTP request
  // const response = await fetch(`${API_BASE_URL}/${requestId}/approve`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();

  // Mock implementation for MVP
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: requestId,
        userId: 'user-1',
        requestNumber: 'REQ-2024-001',
        status: 'approved',
        businessName: 'Test Business',
        contactInfo: '+966501234567',
        address: 'Test Address',
        managerPhone: '+966507654321',
        description: 'Test Description',
        businessType: 'both',
        businessModel: payload.selectedTemplateId ? 'commerce' : 'commerce', // Mock
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ServiceRequest);
    }, 500);
  });
}

/**
 * Reject service request
 * 
 * POST /api/admin/service-requests/:id/reject
 */
export async function rejectServiceRequest(
  requestId: string,
  payload: RejectRequestPayload
): Promise<ServiceRequest> {
  // In production: Actual HTTP request
  // const response = await fetch(`${API_BASE_URL}/${requestId}/reject`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // });
  // return response.json();

  // Mock implementation for MVP
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: requestId,
        userId: 'user-1',
        requestNumber: 'REQ-2024-001',
        status: 'rejected',
        businessName: 'Test Business',
        contactInfo: '+966501234567',
        address: 'Test Address',
        managerPhone: '+966507654321',
        description: 'Test Description',
        businessType: 'both',
        rejectionReason: payload.reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ServiceRequest);
    }, 500);
  });
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
  // Get admin secret
  // TODO: Replace ADMIN_SECRET with real authentication system
  const adminSecret = getAdminSecret();
  
  if (!adminSecret) {
    throw new Error(
      'Admin secret is not configured. ' +
      'Set VITE_ADMIN_SECRET environment variable.'
    );
  }
  
  // Call serverless function with admin secret
  const response = await fetch('/api/admin/activate-service-request', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-admin-secret': adminSecret, // MVP: Admin secret header
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
 */
export async function getServiceRequest(requestId: string): Promise<ServiceRequest> {
  // In production: Actual HTTP request
  // const response = await fetch(`${API_BASE_URL}/${requestId}`);
  // return response.json();

  // Mock implementation for MVP
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: requestId,
        userId: 'user-1',
        requestNumber: 'REQ-2024-001',
        status: 'approved',
        businessName: 'Test Business',
        contactInfo: '+966501234567',
        address: 'Test Address',
        managerPhone: '+966507654321',
        description: 'Test Description',
        businessType: 'both',
        businessModel: 'commerce',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as ServiceRequest);
    }, 300);
  });
}

/**
 * List service requests
 * 
 * GET /api/admin/service-requests
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
  // In production: Actual HTTP request with query params
  // const queryParams = new URLSearchParams(params as any);
  // const response = await fetch(`${API_BASE_URL}?${queryParams}`);
  // return response.json();

  // Mock implementation for MVP
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        requests: [],
        total: 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
      });
    }, 300);
  });
}

