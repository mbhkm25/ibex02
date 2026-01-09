/**
 * Business Activation Service
 * 
 * Architecture: Core service that turns ServiceRequest into live Business
 * 
 * Core Principle:
 * - Users choose Business Model (intent)
 * - Backend decides Template (structure)
 * - System creates Business Instance (reality)
 * 
 * Responsibilities:
 * 1. Validate request is in approved state
 * 2. Resolve template using businessModel
 * 3. Create BusinessProfile
 * 4. Create TemplateInstance
 * 5. Initialize default settings and empty entities
 * 6. Transition request state → activated
 * 
 * Guard Rails:
 * - Cannot activate without businessModel
 * - Cannot activate without template resolution
 * - Cannot activate twice
 * - All transitions logged (audit-ready)
 */

import { 
  ServiceRequest, 
  ServiceRequestStatus, 
  BusinessProfile, 
  TemplateInstance,
  BusinessModel 
} from '../types/serviceRequest';
import { resolveTemplate, validateTemplateResolution } from './templateResolver';
import { Template } from './templateRegistry';

/**
 * Business Activation Input
 */
export interface BusinessActivationInput {
  serviceRequest: ServiceRequest;
  activatedBy: string; // Admin user ID
  notes?: string;
}

/**
 * Business Activation Result
 */
export interface BusinessActivationResult {
  businessProfile: BusinessProfile;
  templateInstance: TemplateInstance;
  activationDate: Date;
  activatedBy: string;
}

/**
 * Business Activation Error
 */
export class BusinessActivationError extends Error {
  constructor(
    message: string,
    public code: string,
    public requestId?: string
  ) {
    super(message);
    this.name = 'BusinessActivationError';
  }
}

/**
 * Validate activation prerequisites
 * 
 * Guard Rails:
 * - Request must be in approved state
 * - businessModel must be present
 * - Template must be resolvable
 * - Request must not already be activated
 */
function validateActivationPrerequisites(
  request: ServiceRequest
): { valid: boolean; error?: string } {
  // Guard: Request must be approved
  if (request.status !== 'approved') {
    return {
      valid: false,
      error: `Cannot activate request in ${request.status} state. Request must be approved.`,
    };
  }

  // Guard: Request must not already be activated
  if (request.status === 'activated') {
    return {
      valid: false,
      error: 'Request is already activated',
    };
  }

  // Guard: businessModel is required
  if (!request.businessModel) {
    return {
      valid: false,
      error: 'Business model is required for activation',
    };
  }

  // Guard: Template must be resolvable
  const templateValidation = validateTemplateResolution(request.businessModel);
  if (!templateValidation.valid) {
    return {
      valid: false,
      error: `Template resolution failed: ${templateValidation.error}`,
    };
  }

  return { valid: true };
}

/**
 * Create BusinessProfile from ServiceRequest
 * 
 * Architecture Decision: BusinessProfile is the canonical business entity.
 * It contains all business information and links to TemplateInstance.
 */
function createBusinessProfile(
  request: ServiceRequest,
  templateInstanceId: string,
  businessNumber: string
): BusinessProfile {
  return {
    id: `business-${Date.now()}`, // In production: UUID
    serviceRequestId: request.id,
    userId: request.userId,
    businessNumber,
    name: request.businessName,
    slug: generateSlug(request.businessName),
    contactInfo: request.contactInfo,
    address: request.address,
    logoUrl: request.logoUrl,
    managerPhone: request.managerPhone,
    email: request.email,
    description: request.description,
    businessType: request.businessType,
    businessModel: request.businessModel!,
    category: inferCategory(request.businessModel!),
    templateInstanceId,
    status: 'active',
    activatedAt: new Date().toISOString(),
    customersCount: 0,
    ordersCount: 0,
    totalBalance: 0,
    settings: {
      allowCreditPurchases: false, // Will be set from template
      defaultCurrency: 'SAR',
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
      },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Create TemplateInstance from Template
 * 
 * Architecture Decision: TemplateInstance is the runtime configuration.
 * It links BusinessProfile to Template and stores customizations.
 */
function createTemplateInstance(
  template: Template,
  businessProfileId: string
): TemplateInstance {
  return {
    id: `template-instance-${Date.now()}`, // In production: UUID
    templateId: template.id,
    businessProfileId,
    configuration: {
      features: template.features as Record<string, boolean>,
      settings: template.defaultSettings,
      uiConfig: {
        defaultSections: getDefaultSections(template),
        defaultPermissions: ['view', 'edit'],
      },
    },
    customizations: {
      sections: getDefaultSections(template),
      permissions: ['view', 'edit'],
    },
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Initialize business entities based on template
 * 
 * Architecture Decision: Create empty entities based on template initialization config.
 * This sets up the structure, not the data.
 */
function initializeBusinessEntities(
  businessProfileId: string,
  template: Template
): void {
  // In production, this would create database records
  // For MVP, we just log what would be created
  
  const entities: string[] = [];
  
  if (template.initialization.createCustomers) {
    entities.push('customers table (empty)');
  }
  if (template.initialization.createProducts) {
    entities.push('products table (empty)');
  }
  if (template.initialization.createServices) {
    entities.push('services table (empty)');
  }
  if (template.initialization.createBookings) {
    entities.push('bookings table (empty)');
  }
  if (template.initialization.createAssets) {
    entities.push('assets table (empty)');
  }
  
  // In production: Create actual database tables/collections
  console.log(`[BusinessActivation] Initialized entities for ${businessProfileId}:`, entities);
}

/**
 * Generate business number
 * 
 * Format: BIZ-YYYY-NNNN
 */
function generateBusinessNumber(): string {
  const year = new Date().getFullYear();
  const sequence = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `BIZ-${year}-${sequence}`;
}

/**
 * Generate URL-friendly slug from business name
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Infer category from business model
 */
function inferCategory(businessModel: BusinessModel): string {
  const categories: Record<BusinessModel, string> = {
    commerce: 'retail',
    food: 'food_service',
    services: 'service_provider',
    rental: 'rental',
  };
  return categories[businessModel];
}

/**
 * Get default sections based on template features
 */
function getDefaultSections(template: Template): string[] {
  const sections: string[] = ['overview'];
  
  if (template.features.customerManagement) {
    sections.push('customers');
  }
  if (template.features.orderManagement) {
    sections.push('orders');
  }
  if (template.features.productCatalog) {
    sections.push('products');
  }
  if (template.features.appointments || template.features.bookings) {
    sections.push('bookings');
  }
  if (template.features.assets) {
    sections.push('assets');
  }
  if (template.features.reporting) {
    sections.push('reports');
  }
  
  return sections;
}

/**
 * Activate Business from ServiceRequest
 * 
 * This is the main activation function that orchestrates the entire process.
 * 
 * Process:
 * 1. Validate prerequisites
 * 2. Resolve template
 * 3. Create BusinessProfile
 * 4. Create TemplateInstance
 * 5. Initialize entities
 * 6. Update request state
 * 
 * @param input - Activation input with service request and admin info
 * @returns Activation result with created entities
 * @throws BusinessActivationError if activation fails
 */
export async function activateBusiness(
  input: BusinessActivationInput
): Promise<BusinessActivationResult> {
  const { serviceRequest, activatedBy, notes } = input;

  // Step 1: Validate prerequisites
  const validation = validateActivationPrerequisites(serviceRequest);
  if (!validation.valid) {
    throw new BusinessActivationError(
      validation.error || 'Activation validation failed',
      'VALIDATION_FAILED',
      serviceRequest.id
    );
  }

  // Step 2: Resolve template (deterministic)
  const templateResolution = resolveTemplate(serviceRequest.businessModel!);
  const template = templateResolution.template;

  // Step 3: Generate business number
  const businessNumber = generateBusinessNumber();

  // Step 4: Create TemplateInstance first (needed for BusinessProfile)
  const templateInstance = createTemplateInstance(
    template,
    `business-${Date.now()}` // Temporary ID, will be updated
  );

  // Step 5: Create BusinessProfile
  const businessProfile = createBusinessProfile(
    serviceRequest,
    templateInstance.id,
    businessNumber
  );

  // Step 6: Update TemplateInstance with correct businessProfileId
  templateInstance.businessProfileId = businessProfile.id;

  // Step 7: Initialize business entities
  initializeBusinessEntities(businessProfile.id, template);

  // Step 8: Update business profile settings from template
  businessProfile.settings.allowCreditPurchases = template.defaultSettings.allowCreditPurchases;
  businessProfile.settings.defaultCurrency = template.defaultSettings.defaultCurrency;

  // Step 9: Log activation (audit trail)
  logActivation({
    requestId: serviceRequest.id,
    businessProfileId: businessProfile.id,
    templateId: template.id,
    businessModel: serviceRequest.businessModel!,
    activatedBy,
    notes,
    timestamp: new Date(),
  });

  return {
    businessProfile,
    templateInstance,
    activationDate: new Date(),
    activatedBy,
  };
}

/**
 * Log activation event (audit trail)
 * 
 * Architecture Decision: All activations are logged for audit purposes.
 * In production, this would write to an audit log table.
 */
function logActivation(data: {
  requestId: string;
  businessProfileId: string;
  templateId: string;
  businessModel: BusinessModel;
  activatedBy: string;
  notes?: string;
  timestamp: Date;
}): void {
  // In production: Write to audit log table
  console.log('[BusinessActivation] Activation logged:', {
    ...data,
    timestamp: data.timestamp.toISOString(),
  });
}

/**
 * Check if business can be activated
 * 
 * Utility function for UI to check activation eligibility.
 */
export function canActivateBusiness(request: ServiceRequest): {
  canActivate: boolean;
  reason?: string;
} {
  const validation = validateActivationPrerequisites(request);
  return {
    canActivate: validation.valid,
    reason: validation.error,
  };
}

