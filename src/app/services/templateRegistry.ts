/**
 * Template Registry
 * 
 * Architecture: Canonical template definitions for each business model
 * 
 * Core Principle: ONE template per business model (MVP)
 * - No scoring, no AI, no randomness
 * - Opinionated defaults only
 * - Deterministic mapping
 * 
 * Mental Model:
 * BusinessModel = Intent
 * Template = Structure
 * BusinessProfile = Reality
 * 
 * The system's job: Turn intent into reality safely.
 */

import { BusinessModel } from '../types/serviceRequest';

/**
 * Template Feature Flags
 * 
 * Each template defines which features are enabled.
 * Features are business logic capabilities, not UI themes.
 */
export interface TemplateFeatures {
  // Core Features (all templates)
  customerManagement: boolean;
  orderManagement: boolean;
  paymentProcessing: boolean;
  reporting: boolean;
  
  // Commerce-specific
  productCatalog?: boolean;
  inventory?: boolean;
  suppliers?: boolean;
  creditDebtLedger?: boolean;
  
  // Food-specific
  menuManagement?: boolean;
  tables?: boolean; // Optional flag for dine-in
  fastCheckout?: boolean;
  dailyReports?: boolean;
  
  // Services-specific
  appointments?: boolean;
  bookings?: boolean;
  subscriptions?: boolean; // Flag for recurring services
  staffSchedules?: boolean; // Future-ready
  
  // Rental-specific
  assets?: boolean;
  timeBasedAvailability?: boolean;
  contracts?: boolean;
  deposits?: boolean;
  occupancyReports?: boolean;
}

/**
 * Template Configuration
 * 
 * Defines the structure and capabilities for a business model.
 * This is business logic, not visual design.
 */
export interface Template {
  id: string;
  name: string;
  businessModel: BusinessModel;
  version: string;
  features: TemplateFeatures;
  defaultSettings: {
    allowCreditPurchases: boolean;
    defaultCurrency: 'SAR' | 'YER' | 'USD';
    paymentMethods: string[];
    [key: string]: any;
  };
  initialization: {
    // What entities to create on activation
    createCustomers: boolean;
    createProducts: boolean;
    createServices: boolean;
    createBookings: boolean;
    createAssets: boolean;
  };
}

/**
 * COMMERCE_BASE Template
 * 
 * For businesses that sell products:
 * - Stores, groceries, supermarkets, pharmacies, wholesale, retail
 */
export const COMMERCE_BASE: Template = {
  id: 'commerce-base-v1',
  name: 'Commerce Base Template',
  businessModel: 'commerce',
  version: '1.0.0',
  features: {
    customerManagement: true,
    orderManagement: true,
    paymentProcessing: true,
    reporting: true,
    productCatalog: true,
    inventory: true,
    suppliers: true,
    creditDebtLedger: true,
  },
  defaultSettings: {
    allowCreditPurchases: true,
    defaultCurrency: 'SAR',
    paymentMethods: ['cash', 'card', 'credit'],
  },
  initialization: {
    createCustomers: true,
    createProducts: true,
    createServices: false,
    createBookings: false,
    createAssets: false,
  },
};

/**
 * FOOD_BASE Template
 * 
 * For businesses that serve food:
 * - Restaurants, cafes, kitchens, fast food
 */
export const FOOD_BASE: Template = {
  id: 'food-base-v1',
  name: 'Food Base Template',
  businessModel: 'food',
  version: '1.0.0',
  features: {
    customerManagement: true,
    orderManagement: true,
    paymentProcessing: true,
    reporting: true,
    menuManagement: true,
    tables: true, // Optional flag, can be disabled
    fastCheckout: true,
    dailyReports: true,
  },
  defaultSettings: {
    allowCreditPurchases: false, // Food typically cash/card only
    defaultCurrency: 'SAR',
    paymentMethods: ['cash', 'card'],
  },
  initialization: {
    createCustomers: true,
    createProducts: true, // Menu items are products
    createServices: false,
    createBookings: true, // Table reservations
    createAssets: false,
  },
};

/**
 * SERVICES_BASE Template
 * 
 * For businesses that provide services:
 * - Service centers, clinics, training, gyms
 */
export const SERVICES_BASE: Template = {
  id: 'services-base-v1',
  name: 'Services Base Template',
  businessModel: 'services',
  version: '1.0.0',
  features: {
    customerManagement: true,
    orderManagement: true, // Service orders
    paymentProcessing: true,
    reporting: true,
    appointments: true,
    bookings: true,
    subscriptions: true, // Flag for recurring services
    staffSchedules: false, // Future-ready, not in MVP
  },
  defaultSettings: {
    allowCreditPurchases: true,
    defaultCurrency: 'SAR',
    paymentMethods: ['cash', 'card', 'credit'],
  },
  initialization: {
    createCustomers: true,
    createProducts: false,
    createServices: true,
    createBookings: true,
    createAssets: false,
  },
};

/**
 * RENTAL_BASE Template
 * 
 * For businesses that rent assets:
 * - Apartments, chalets, halls, units, rentals
 */
export const RENTAL_BASE: Template = {
  id: 'rental-base-v1',
  name: 'Rental Base Template',
  businessModel: 'rental',
  version: '1.0.0',
  features: {
    customerManagement: true,
    orderManagement: true, // Rental orders
    paymentProcessing: true,
    reporting: true,
    assets: true,
    timeBasedAvailability: true,
    contracts: true,
    deposits: true,
    occupancyReports: true,
  },
  defaultSettings: {
    allowCreditPurchases: false, // Rentals typically upfront
    defaultCurrency: 'SAR',
    paymentMethods: ['cash', 'card', 'bank_transfer'],
  },
  initialization: {
    createCustomers: true,
    createProducts: false,
    createServices: false,
    createBookings: true, // Rental bookings
    createAssets: true,
  },
};

/**
 * Template Registry
 * 
 * Maps business models to their canonical templates.
 * This is the single source of truth for template resolution.
 */
export const TEMPLATE_REGISTRY: Record<BusinessModel, Template> = {
  commerce: COMMERCE_BASE,
  food: FOOD_BASE,
  services: SERVICES_BASE,
  rental: RENTAL_BASE,
};

/**
 * Get template by business model
 * 
 * Architecture Decision: Deterministic mapping
 * - No scoring, no AI, no randomness
 * - Each businessModel maps to exactly ONE template
 * - Opinionated defaults only
 */
export function getTemplateByBusinessModel(businessModel: BusinessModel): Template {
  const template = TEMPLATE_REGISTRY[businessModel];
  
  if (!template) {
    throw new Error(`No template found for business model: ${businessModel}`);
  }
  
  return template;
}

/**
 * Validate template exists
 */
export function templateExists(templateId: string): boolean {
  return Object.values(TEMPLATE_REGISTRY).some(t => t.id === templateId);
}

/**
 * Get all available templates (for admin/debugging)
 */
export function getAllTemplates(): Template[] {
  return Object.values(TEMPLATE_REGISTRY);
}

