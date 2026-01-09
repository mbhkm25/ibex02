/**
 * Template Resolver Service
 * 
 * Architecture: Deterministic template resolution based on business model
 * 
 * Core Principle: BusinessModel → Template (one-to-one mapping)
 * 
 * Rules:
 * - Each businessModel maps to exactly ONE base template
 * - No scoring, no randomness, no AI
 * - Opinionated defaults only
 * 
 * This service is the bridge between:
 * - User Intent (BusinessModel)
 * - System Structure (Template)
 */

import { BusinessModel } from '../types/serviceRequest';
import { Template, getTemplateByBusinessModel } from './templateRegistry';

/**
 * Template Resolution Result
 */
export interface TemplateResolution {
  template: Template;
  businessModel: BusinessModel;
  resolvedAt: Date;
}

/**
 * Resolve template for a business model
 * 
 * Architecture Decision: Deterministic resolution
 * - No complex logic, no scoring
 * - Direct mapping from businessModel to template
 * - Fail fast if businessModel is invalid
 * 
 * @param businessModel - The business model selected by user
 * @returns Template resolution result
 * @throws Error if businessModel is invalid or template not found
 */
export function resolveTemplate(businessModel: BusinessModel): TemplateResolution {
  // Guard: businessModel must be valid
  if (!businessModel) {
    throw new Error('Business model is required for template resolution');
  }

  // Guard: businessModel must be one of the valid values
  const validModels: BusinessModel[] = ['commerce', 'food', 'services', 'rental'];
  if (!validModels.includes(businessModel)) {
    throw new Error(`Invalid business model: ${businessModel}`);
  }

  // Resolve template (deterministic)
  const template = getTemplateByBusinessModel(businessModel);

  return {
    template,
    businessModel,
    resolvedAt: new Date(),
  };
}

/**
 * Validate template resolution prerequisites
 * 
 * Used before activation to ensure all requirements are met.
 */
export function validateTemplateResolution(businessModel: BusinessModel | null | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!businessModel) {
    return {
      valid: false,
      error: 'Business model is required',
    };
  }

  try {
    resolveTemplate(businessModel);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

