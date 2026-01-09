/**
 * Service Request System - Type Definitions
 * Based on Architecture Document v1.0
 */

// ============================================================================
// ServiceRequest Types
// ============================================================================

export type ServiceRequestStatus = 
  | 'draft' 
  | 'submitted' 
  | 'reviewed' 
  | 'approved' 
  | 'rejected' 
  | 'activated';

export type BusinessType = 'products' | 'services' | 'both';

/**
 * Business Model Types
 * 
 * Product Principle: Users choose HOW they work, not WHAT template they want.
 * The system uses businessModel to determine structure, pricing, and features.
 * 
 * Architecture Decision: businessModel is the primary decision axis for the system.
 * Backend uses this to filter templates, apply pricing, and control features.
 */
export type BusinessModel = 'commerce' | 'food' | 'services' | 'rental';

export interface ServiceRequest {
  // Identity
  id: string;
  userId: string;
  requestNumber: string;
  
  // Status & Lifecycle
  status: ServiceRequestStatus;
  submittedAt?: Date | string;
  reviewedAt?: Date | string;
  reviewedBy?: string;
  approvedAt?: Date | string;
  approvedBy?: string;
  activatedAt?: Date | string;
  rejectionReason?: string;
  
  // Business Information
  businessName: string;
  contactInfo: string;
  address: string;
  logoUrl?: string;
  logoKey?: string;
  
  // Manager Information
  managerPhone: string;
  email?: string;
  passwordHash?: string; // Only on backend
  
  // Business Details
  description: string;
  businessType: BusinessType; // Legacy field, kept for backward compatibility
  businessModel?: BusinessModel; // Primary decision axis: How the business works
  
  // Template Matching
  suggestedTemplateIds?: string[];
  selectedTemplateId?: string;
  templateMatchScores?: TemplateMatchScore[];
  
  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
  version?: number;
  
  // Relations
  businessProfileId?: string;
}

export interface TemplateMatchScore {
  templateId: string;
  score: number;
  reasons: string[];
}

// ============================================================================
// BusinessProfile Types
// ============================================================================

export type BusinessProfileStatus = 'active' | 'suspended' | 'closed';

export type Currency = 'SAR' | 'YER' | 'USD';

export interface BusinessProfile {
  // Identity
  id: string;
  serviceRequestId: string;
  userId: string;
  businessNumber: string;
  
  // Basic Information
  name: string;
  slug: string;
  contactInfo: string;
  address: string;
  logoUrl?: string;
  
  // Manager Information
  managerPhone: string;
  email?: string;
  
  // Business Details
  description: string;
  businessType: BusinessType; // Legacy, kept for backward compatibility
  businessModel?: BusinessModel; // Primary: How the business works
  category?: string;
  tags?: string[];
  
  // Template Instance
  templateInstanceId: string;
  
  // Status
  status: BusinessProfileStatus;
  activatedAt: Date | string;
  suspendedAt?: Date | string;
  closedAt?: Date | string;
  
  // Metrics (computed, cached)
  customersCount: number;
  ordersCount: number;
  totalBalance: number;
  revenue?: number;
  growth?: number;
  
  // Settings
  settings: BusinessSettings;
  
  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BusinessSettings {
  allowCreditPurchases: boolean;
  defaultCurrency: Currency;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// ============================================================================
// Template Types
// ============================================================================

export interface Template {
  // Identity
  id: string;
  name: string;
  slug: string;
  version: string;
  
  // Classification
  category: string;
  businessTypes: BusinessType[];
  tags: string[];
  
  // Matching Rules
  matchingRules: TemplateMatchingRules;
  
  // Template Configuration
  configuration: TemplateConfiguration;
  
  // Pricing (future)
  pricing?: TemplatePricing;
  
  // Metadata
  isActive: boolean;
  isDefault: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  createdBy?: string;
}

export interface TemplateMatchingRules {
  keywords: string[];
  businessTypes: BusinessType[];
  requiredFields?: string[];
  weight: number; // 0-100
}

export interface TemplateConfiguration {
  features: {
    customerManagement: boolean;
    orderManagement: boolean;
    inventoryManagement: boolean;
    paymentProcessing: boolean;
    reporting: boolean;
    [key: string]: boolean;
  };
  defaultSettings: {
    allowCreditPurchases: boolean;
    defaultCurrency: Currency;
    paymentMethods: string[];
    [key: string]: any;
  };
  uiConfig: {
    defaultSections: string[];
    defaultPermissions: string[];
    workflows?: Workflow[];
  };
}

export interface TemplatePricing {
  setupFee?: number;
  monthlyFee?: number;
  transactionFee?: number;
  currency: Currency;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
}

// ============================================================================
// TemplateInstance Types
// ============================================================================

export type TemplateInstanceStatus = 'active' | 'suspended' | 'migrated';

export interface TemplateInstance {
  // Identity
  id: string;
  templateId: string;
  businessProfileId: string;
  
  // Configuration (customized from template)
  configuration: {
    features: Record<string, boolean>;
    settings: Record<string, any>;
    uiConfig: Record<string, any>;
  };
  
  // Customizations
  customizations: {
    sections: string[];
    permissions: string[];
    workflows?: Workflow[];
  };
  
  // Status
  status: TemplateInstanceStatus;
  
  // Metadata
  createdAt: Date | string;
  updatedAt: Date | string;
  migratedFrom?: string;
}

// ============================================================================
// Form Data Types (Frontend)
// ============================================================================

export interface ServiceRequestFormData {
  businessName: string;
  contactInfo: string;
  address: string;
  logo: File | null;
  managerPhone: string;
  email: string;
  password: string;
  description: string;
  businessType: BusinessType; // Legacy, kept for compatibility
  businessModel: BusinessModel | null; // Primary: How the business works
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ServiceRequestListResponse {
  requests: ServiceRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ServiceRequestDetailResponse {
  request: ServiceRequest;
  suggestedTemplates?: Template[];
  businessProfile?: BusinessProfile;
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
}

export interface TemplateMatchResponse {
  matches: TemplateMatchScore[];
  topMatch?: Template;
}

// ============================================================================
// Admin Action Types
// ============================================================================

export interface ApproveRequestPayload {
  requestId: string;
  selectedTemplateId?: string;
  notes?: string;
}

export interface RejectRequestPayload {
  requestId: string;
  reason: string;
  notes?: string;
}

export interface ActivateBusinessPayload {
  requestId: string;
  templateId: string;
  customizations?: Partial<TemplateInstance['customizations']>;
}

