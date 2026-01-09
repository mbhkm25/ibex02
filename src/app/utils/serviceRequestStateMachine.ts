/**
 * ServiceRequest State Machine
 * 
 * Architecture Decision: Strict state machine to prevent invalid transitions
 * and ensure UI consistency with backend state management.
 * 
 * States: draft → submitted → reviewed → approved → rejected → activated
 * 
 * Rules:
 * - Users can only edit drafts
 * - Users can only submit drafts
 * - Admins can approve/reject submitted/reviewed requests
 * - System activates approved requests
 * - Rejected requests can be resubmitted (creates new draft)
 */

import { ServiceRequestStatus } from '../types/serviceRequest';

export type ServiceRequestState = ServiceRequestStatus;

/**
 * State machine configuration
 * Defines what actions are allowed in each state
 */
export interface StateConfig {
  // What the user sees
  label: string;
  description: string;
  color: string;
  icon: string;
  
  // What actions are allowed
  canEdit: boolean;           // User can edit form
  canSubmit: boolean;         // User can submit
  canResubmit: boolean;       // User can resubmit (after rejection)
  canApprove: boolean;        // Admin can approve
  canReject: boolean;         // Admin can reject
  canActivate: boolean;       // Admin can activate (approved → activated)
  canView: boolean;           // User can view details
  
  // UI behavior
  showForm: boolean;          // Show editable form
  showReadOnly: boolean;      // Show read-only view
  showStatusMessage: boolean; // Show status message
  showRejectionReason: boolean; // Show rejection reason
  showResubmitButton: boolean;  // Show resubmit CTA
  showBusinessAccess: boolean;  // Show link to business (if activated)
  
  // Next valid states
  validTransitions: ServiceRequestState[];
}

/**
 * State machine configuration map
 */
export const STATE_CONFIG: Record<ServiceRequestState, StateConfig> = {
  draft: {
    label: 'مسودة',
    description: 'يمكنك تعديل الطلب قبل الإرسال',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: '📝',
    canEdit: true,
    canSubmit: true,
    canResubmit: false,
    canApprove: false,
    canReject: false,
    canActivate: false,
    canView: true,
    showForm: true,
    showReadOnly: false,
    showStatusMessage: false,
    showRejectionReason: false,
    showResubmitButton: false,
    showBusinessAccess: false,
    validTransitions: ['submitted']
  },
  submitted: {
    label: 'تم الإرسال',
    description: 'تم إرسال طلبك وهو قيد المراجعة من قبل المسؤول',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: '📤',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    canApprove: true,
    canReject: true,
    canView: true,
    showForm: false,
    showReadOnly: true,
    showStatusMessage: true,
    showRejectionReason: false,
    showResubmitButton: false,
    showBusinessAccess: false,
    validTransitions: ['reviewed', 'rejected']
  },
  reviewed: {
    label: 'قيد المراجعة',
    description: 'الطلب قيد المراجعة النهائية',
    color: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: '👀',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    canApprove: true,
    canReject: true,
    canView: true,
    showForm: false,
    showReadOnly: true,
    showStatusMessage: true,
    showRejectionReason: false,
    showResubmitButton: false,
    showBusinessAccess: false,
    validTransitions: ['approved', 'rejected']
  },
  approved: {
    label: 'معتمد',
    description: 'تم اعتماد طلبك وسيتم تفعيل العمل قريباً',
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    icon: '✅',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    canApprove: false,
    canReject: false,
    canActivate: true,
    canView: true,
    showForm: false,
    showReadOnly: true,
    showStatusMessage: true,
    showRejectionReason: false,
    showResubmitButton: false,
    showBusinessAccess: false,
    validTransitions: ['activated']
  },
  rejected: {
    label: 'مرفوض',
    description: 'تم رفض طلبك. يمكنك مراجعة السبب وإعادة الإرسال',
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: '❌',
    canEdit: false,
    canSubmit: false,
    canResubmit: true,
    canApprove: false,
    canReject: false,
    canActivate: false,
    canView: true,
    showForm: false,
    showReadOnly: true,
    showStatusMessage: true,
    showRejectionReason: true,
    showResubmitButton: true,
    showBusinessAccess: false,
    validTransitions: [] // Rejected is terminal, but user can create new draft
  },
  activated: {
    label: 'مفعل',
    description: 'تم تفعيل عملك بنجاح. يمكنك الآن إدارته',
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: '🚀',
    canEdit: false,
    canSubmit: false,
    canResubmit: false,
    canApprove: false,
    canReject: false,
    canActivate: false,
    canView: true,
    showForm: false,
    showReadOnly: true,
    showStatusMessage: true,
    showRejectionReason: false,
    showResubmitButton: false,
    showBusinessAccess: true,
    validTransitions: [] // Activated is terminal
  }
};

/**
 * Get state configuration
 */
export function getStateConfig(state: ServiceRequestState): StateConfig {
  return STATE_CONFIG[state];
}

/**
 * Check if transition is valid
 */
export function canTransition(
  from: ServiceRequestState,
  to: ServiceRequestState
): boolean {
  const config = STATE_CONFIG[from];
  return config.validTransitions.includes(to);
}

/**
 * Check if user can edit request
 */
export function canUserEdit(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].canEdit;
}

/**
 * Check if user can submit request
 */
export function canUserSubmit(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].canSubmit;
}

/**
 * Check if user can resubmit request
 */
export function canUserResubmit(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].canResubmit;
}

/**
 * Check if admin can approve request
 */
export function canAdminApprove(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].canApprove;
}

/**
 * Check if admin can reject request
 */
export function canAdminReject(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].canReject;
}

/**
 * Check if admin can activate request (approved → activated)
 */
export function canAdminActivate(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].canActivate;
}

/**
 * Get next valid states for a given state
 */
export function getValidTransitions(state: ServiceRequestState): ServiceRequestState[] {
  return STATE_CONFIG[state].validTransitions;
}

/**
 * Check if request is in terminal state (no more transitions)
 */
export function isTerminalState(state: ServiceRequestState): boolean {
  return STATE_CONFIG[state].validTransitions.length === 0;
}

/**
 * Check if request is active (not rejected or activated)
 */
export function isActiveState(state: ServiceRequestState): boolean {
  return state !== 'rejected' && state !== 'activated';
}

/**
 * Get user-facing status message based on state
 */
export function getStatusMessage(
  state: ServiceRequestState,
  rejectionReason?: string
): { title: string; description: string; action?: string } {
  const config = STATE_CONFIG[state];
  
  const messages: Record<ServiceRequestState, { title: string; description: string; action?: string }> = {
    draft: {
      title: 'مسودة',
      description: 'يمكنك تعديل الطلب قبل الإرسال'
    },
    submitted: {
      title: 'تم الإرسال',
      description: 'تم إرسال طلبك وهو قيد المراجعة من قبل المسؤول. سيتم إشعارك عند اتخاذ القرار.'
    },
    reviewed: {
      title: 'قيد المراجعة',
      description: 'الطلب قيد المراجعة النهائية من قبل المسؤول.'
    },
    approved: {
      title: 'تم الاعتماد',
      description: 'تم اعتماد طلبك بنجاح. سيتم تفعيل عملك قريباً وسيتم إشعارك.'
    },
    rejected: {
      title: 'تم الرفض',
      description: rejectionReason || 'تم رفض طلبك. يرجى مراجعة السبب وإعادة الإرسال.',
      action: 'إعادة الإرسال'
    },
    activated: {
      title: 'تم التفعيل',
      description: 'تم تفعيل عملك بنجاح. يمكنك الآن إدارته من صفحة "أعمالي".',
      action: 'الذهاب إلى العمل'
    }
  };
  
  return messages[state];
}

