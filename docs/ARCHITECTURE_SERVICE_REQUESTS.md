# Service Request System - Architecture Document

## Executive Summary

This document defines the end-to-end architecture for the Service Request System, which enables users to request "Customer Management Service" and allows administrators to review, approve, and activate businesses on the platform. The system is designed to be MVP-safe while remaining scalable for thousands of businesses.

---

## 1. System Diagram (Textual)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Dashboard → "Request Customer Management Service" Button │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BusinessServiceRequest Component                         │  │
│  │  - Form Data Collection                                   │  │
│  │  - Validation (Frontend)                                  │  │
│  │  - File Upload (Logo)                                     │  │
│  └──────────────────────┬───────────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────────┘
                          │
                          │ HTTP POST /api/service-requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ServiceRequestController                                 │  │
│  │  - Validate (Backend)                                     │  │
│  │  - Create ServiceRequest (status: 'draft')                │  │
│  │  - Store Files                                            │  │
│  │  - Trigger Template Matching (Async)                      │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Template Engine Service                                  │  │
│  │  - Analyze BusinessProfile                                │  │
│  │  - Match Templates (Auto)                                  │  │
│  │  - Score Matching                                         │  │
│  │  - Store Suggestions                                      │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Notification Service                                     │  │
│  │  - Notify Admin (New Request)                             │  │
│  │  - Notify User (Request Submitted)                        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                          │
                          │ Admin Reviews
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN INTERFACE                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  AdminServiceRequests Component                           │  │
│  │  - View Requests (Filtered/Searched)                     │  │
│  │  - Review Details                                         │  │
│  │  - Approve/Reject                                         │  │
│  │  - Override Template Selection                            │  │
│  └──────────────────────┬───────────────────────────────────┘  │
│                         │                                        │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Business Activation Service                             │  │
│  │  - Create BusinessProfile                                 │  │
│  │  - Create TemplateInstance                                │  │
│  │  - Initialize Business Data                               │  │
│  │  - Send Activation Email                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle

### State Machine

```
┌─────────┐
│  DRAFT  │ ← User creates request (saved locally or server)
└────┬────┘
     │ User submits
     ▼
┌─────────────┐
│  SUBMITTED  │ ← Request sent to admin queue
└──────┬──────┘
       │ Admin reviews
       ├─────────────────┐
       │                 │
       ▼                 ▼
┌─────────────┐    ┌──────────┐
│  REVIEWED   │    │ REJECTED │ ← Final state (can resubmit)
└──────┬──────┘    └──────────┘
       │
       │ Admin approves
       ▼
┌─────────────┐
│  APPROVED   │ ← Template matching happens here
└──────┬──────┘
       │
       │ System activates
       ▼
┌─────────────┐
│  ACTIVATED  │ ← Business is live, user can access
└─────────────┘
```

### Detailed Lifecycle Steps

#### Phase 1: Request Creation (User)
1. **User clicks "Request Service"** in Dashboard
2. **Form opens** (`BusinessServiceRequest.tsx`)
3. **User fills form**:
   - Business name, contact info, address
   - Logo upload
   - Manager phone, email (optional), password
   - Description, business type
4. **Frontend validation** (required fields, file size, format)
5. **User submits** → Request created with status: `'draft'`
6. **Auto-save** (optional, for better UX)

#### Phase 2: Submission (User → Backend)
1. **User clicks "Submit Request"**
2. **Frontend sends POST** `/api/service-requests`
3. **Backend validates**:
   - Required fields
   - Email format
   - Phone format
   - File size/type
   - Business name uniqueness (optional)
4. **Status changes** to `'submitted'`
5. **Notification sent** to admin
6. **User receives confirmation**

#### Phase 3: Admin Review
1. **Admin views** `/admin/service-requests`
2. **Admin filters/searches** requests
3. **Admin opens request details**
4. **Admin reviews**:
   - Business information
   - Logo
   - Description
   - Template suggestions (if auto-matched)
5. **Admin decision**:
   - **Approve** → Status: `'approved'`
   - **Reject** → Status: `'rejected'` (with reason)

#### Phase 4: Template Matching (After Approval)
1. **System triggers** Template Engine
2. **Engine analyzes** BusinessProfile:
   - Business type (products/services/both)
   - Description keywords
   - Industry category (if available)
3. **Engine matches** against available Templates
4. **Engine scores** matches (0-100)
5. **Engine suggests** top 3 templates
6. **Admin can override** template selection

#### Phase 5: Business Activation
1. **System creates** BusinessProfile
2. **System creates** TemplateInstance (linked to selected Template)
3. **System initializes**:
   - Business settings
   - Default configurations
   - Empty customer list
   - Empty order list
   - Bank accounts (empty)
4. **System sends** activation email to user
5. **Status changes** to `'activated'`
6. **User can access** `/business/:businessId/manage`

#### Phase 6: Post-Activation
1. **User logs in** and sees business in "أعمالي"
2. **User can customize** business settings
3. **User can start** managing customers
4. **System tracks** business metrics

---

## 3. Data Models

### 3.1 ServiceRequest

```typescript
interface ServiceRequest {
  // Identity
  id: string;                    // UUID
  userId: string;                // Reference to User
  requestNumber: string;         // Human-readable: REQ-2024-001
  
  // Status & Lifecycle
  status: 'draft' | 'submitted' | 'reviewed' | 'approved' | 'rejected' | 'activated';
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: string;           // Admin user ID
  approvedAt?: Date;
  approvedBy?: string;           // Admin user ID
  activatedAt?: Date;
  rejectionReason?: string;      // If rejected
  
  // Business Information
  businessName: string;
  contactInfo: string;           // Phone, website, etc.
  address: string;
  logoUrl?: string;              // Uploaded file URL
  logoKey?: string;              // S3/storage key
  
  // Manager Information
  managerPhone: string;
  email?: string;
  passwordHash: string;          // Hashed password for business account
  
  // Business Details
  description: string;
  businessType: 'products' | 'services' | 'both';
  
  // Template Matching
  suggestedTemplateIds?: string[];  // Auto-matched templates
  selectedTemplateId?: string;      // Admin-selected template
  templateMatchScores?: {            // Scores for each suggested template
    templateId: string;
    score: number;
    reasons: string[];
  }[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;               // For optimistic locking
  
  // Relations
  businessProfileId?: string;    // Created after activation
}
```

### 3.2 BusinessProfile

```typescript
interface BusinessProfile {
  // Identity
  id: string;                    // UUID
  serviceRequestId: string;      // Reference to ServiceRequest
  userId: string;                // Owner user ID
  businessNumber: string;         // Human-readable: BIZ-2024-001
  
  // Basic Information
  name: string;
  slug: string;                  // URL-friendly: "super-market-al-noor"
  contactInfo: string;
  address: string;
  logoUrl?: string;
  
  // Manager Information
  managerPhone: string;
  email?: string;
  
  // Business Details
  description: string;
  businessType: 'products' | 'services' | 'both';
  category?: string;             // Industry category
  tags?: string[];               // For search/filtering
  
  // Template Instance
  templateInstanceId: string;    // Reference to TemplateInstance
  
  // Status
  status: 'active' | 'suspended' | 'closed';
  activatedAt: Date;
  suspendedAt?: Date;
  closedAt?: Date;
  
  // Metrics (computed, cached)
  customersCount: number;
  ordersCount: number;
  totalBalance: number;          // Sum of all customer balances
  revenue?: number;              // Monthly revenue
  growth?: number;               // Growth percentage
  
  // Settings
  settings: {
    allowCreditPurchases: boolean;
    defaultCurrency: 'SAR' | 'YER' | 'USD';
    notificationPreferences: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.3 Template (Logical Definition)

```typescript
interface Template {
  // Identity
  id: string;                     // UUID
  name: string;                   // "Retail Store Template"
  slug: string;                   // "retail-store"
  version: string;                 // "1.0.0"
  
  // Classification
  category: string;                // "retail", "restaurant", "service"
  businessTypes: ('products' | 'services' | 'both')[];
  tags: string[];                   // ["grocery", "supermarket", "retail"]
  
  // Matching Rules (for auto-matching)
  matchingRules: {
    keywords: string[];            // ["grocery", "supermarket", "retail"]
    businessTypes: ('products' | 'services' | 'both')[];
    requiredFields?: string[];     // Fields that must match
    weight: number;                // Matching weight (0-100)
  };
  
  // Template Configuration
  configuration: {
    // Features enabled
    features: {
      customerManagement: boolean;
      orderManagement: boolean;
      inventoryManagement: boolean;
      paymentProcessing: boolean;
      reporting: boolean;
      // ... more features
    };
    
    // Default Settings
    defaultSettings: {
      allowCreditPurchases: boolean;
      defaultCurrency: 'SAR' | 'YER' | 'USD';
      paymentMethods: string[];
      // ... more settings
    };
    
    // UI/UX Configuration (not visual theme, but functional)
    uiConfig: {
      defaultSections: string[];   // Which sections to show
      defaultPermissions: string[]; // What owner can do
      workflows: Workflow[];        // Business logic workflows
    };
  };
  
  // Pricing (future)
  pricing?: {
    setupFee?: number;
    monthlyFee?: number;
    transactionFee?: number;
    currency: string;
  };
  
  // Metadata
  isActive: boolean;
  isDefault: boolean;              // Default template for category
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;               // Admin user ID
}
```

### 3.4 TemplateInstance

```typescript
interface TemplateInstance {
  // Identity
  id: string;                      // UUID
  templateId: string;               // Reference to Template
  businessProfileId: string;        // Reference to BusinessProfile
  
  // Configuration (customized from template)
  configuration: {
    features: Record<string, boolean>;  // Override template features
    settings: Record<string, any>;      // Override template settings
    uiConfig: Record<string, any>;      // Override template UI config
  };
  
  // Customizations
  customizations: {
    sections: string[];             // Enabled sections
    permissions: string[];           // Custom permissions
    workflows: Workflow[];           // Custom workflows
  };
  
  // Status
  status: 'active' | 'suspended' | 'migrated';
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  migratedFrom?: string;            // If template was changed
}
```

---

## 4. Template Engine Integration

### 4.1 Auto-Matching Flow

```
┌─────────────────────────────────────────────────────────────┐
│  ServiceRequest Approved                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Template Engine Service                                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Extract BusinessProfile from ServiceRequest      │  │
│  │  2. Analyze:                                          │  │
│  │     - businessType                                    │  │
│  │     - description (NLP/keyword extraction)           │  │
│  │     - category (if provided)                         │  │
│  │  3. Query Templates:                                 │  │
│  │     - Filter by businessTypes                        │  │
│  │     - Filter by category                             │  │
│  │     - Filter by active templates                     │  │
│  │  4. Score Matching:                                   │  │
│  │     - Keyword matching (description vs keywords)     │  │
│  │     - Business type matching                         │  │
│  │     - Category matching                              │  │
│  │     - Weighted scoring                               │  │
│  │  5. Rank Templates (top 3)                           │  │
│  │  6. Store Suggestions in ServiceRequest              │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼──────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Admin Reviews Suggestions                                  │
│  - Sees top 3 templates with scores                          │
│  - Can view template details                                │
│  - Can override and select different template               │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Matching Algorithm (Pseudo-code)

```typescript
function matchTemplates(businessProfile: BusinessProfile): TemplateMatch[] {
  const candidates = getTemplatesByBusinessType(businessProfile.businessType);
  
  const matches = candidates.map(template => {
    let score = 0;
    const reasons: string[] = [];
    
    // Keyword matching (40% weight)
    const keywordScore = matchKeywords(
      businessProfile.description,
      template.matchingRules.keywords
    );
    score += keywordScore * 0.4;
    if (keywordScore > 0) {
      reasons.push(`Keywords matched: ${keywordScore}%`);
    }
    
    // Business type matching (30% weight)
    if (template.matchingRules.businessTypes.includes(businessProfile.businessType)) {
      score += 30;
      reasons.push('Business type matched');
    }
    
    // Category matching (20% weight)
    if (businessProfile.category && template.category === businessProfile.category) {
      score += 20;
      reasons.push('Category matched');
    }
    
    // Template weight (10% weight)
    score += template.matchingRules.weight * 0.1;
    reasons.push(`Template weight: ${template.matchingRules.weight}`);
    
    return {
      templateId: template.id,
      score: Math.min(score, 100),
      reasons
    };
  });
  
  // Sort by score descending, return top 3
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
```

### 4.3 Admin Override

When admin approves a request:
1. **Admin sees** suggested templates with scores
2. **Admin can**:
   - Accept suggested template (highest score)
   - Select different template from list
   - Request custom template (future feature)
3. **Admin selects** template → Stored in `ServiceRequest.selectedTemplateId`
4. **On activation**, `TemplateInstance` is created with selected template

---

## 5. Frontend vs Backend Separation

### 5.1 Frontend-Only (Client-Side)

✅ **Allowed:**
- Form validation (UX enhancement)
- Auto-save drafts (localStorage or API)
- File preview (logo)
- Search/filter UI (client-side filtering for small datasets)
- UI state management (tabs, modals, etc.)
- Optimistic updates (for better UX)

❌ **Not Allowed (Must be Backend):**
- Final validation (security)
- Business logic (template matching, scoring)
- Authorization (who can approve/reject)
- Data persistence
- File upload processing
- Notification sending

### 5.2 Backend-Enforced (Server-Side)

✅ **Required:**
- **Validation**: All form data must be validated server-side
- **Authorization**: 
  - Only admins can approve/reject
  - Users can only see their own requests
  - Users can only edit their own draft requests
- **Business Logic**:
  - Template matching algorithm
  - Template scoring
  - Business activation logic
  - Status transitions (state machine)
- **Data Integrity**:
  - Unique business names (if required)
  - Referential integrity (userId, templateId, etc.)
  - Optimistic locking (prevent concurrent edits)
- **Security**:
  - File upload validation (type, size, malware scan)
  - Password hashing
  - Rate limiting (prevent spam)
  - Input sanitization
- **Notifications**:
  - Email/SMS sending
  - Push notifications
- **Audit Trail**:
  - Log all status changes
  - Log admin actions
  - Track who did what and when

### 5.3 API Endpoints (Proposed)

```
POST   /api/service-requests              # Create request (draft)
PUT    /api/service-requests/:id         # Update request (draft only)
POST   /api/service-requests/:id/submit  # Submit request
GET    /api/service-requests             # List user's requests
GET    /api/service-requests/:id         # Get request details

# Admin endpoints
GET    /api/admin/service-requests        # List all requests (filtered)
GET    /api/admin/service-requests/:id   # Get request details
POST   /api/admin/service-requests/:id/approve  # Approve request
POST   /api/admin/service-requests/:id/reject   # Reject request
POST   /api/admin/service-requests/:id/activate # Activate business

# Template endpoints
GET    /api/templates                    # List available templates
GET    /api/templates/:id                 # Get template details
POST   /api/templates/:id/match           # Test template matching (admin)
```

---

## 6. Folder/Module Structure

```
src/
├── app/
│   ├── components/
│   │   ├── business/
│   │   │   ├── BusinessServiceRequest.tsx    # Request form
│   │   │   ├── MyBusinesses.tsx              # List approved businesses
│   │   │   └── BusinessManagement.tsx        # Business management UI
│   │   ├── admin/
│   │   │   └── AdminServiceRequests.tsx       # Admin review UI
│   │   └── ...
│   ├── api/
│   │   ├── serviceRequests.ts                # Service request API client
│   │   ├── templates.ts                     # Template API client
│   │   └── ...
│   ├── services/
│   │   ├── templateEngine.ts                # Template matching logic (client-side helper)
│   │   └── ...
│   ├── types/
│   │   ├── serviceRequest.ts                # ServiceRequest interface
│   │   ├── businessProfile.ts               # BusinessProfile interface
│   │   ├── template.ts                      # Template interface
│   │   └── ...
│   └── ...
└── ...

backend/                                    # Future backend structure
├── src/
│   ├── controllers/
│   │   ├── ServiceRequestController.ts
│   │   ├── BusinessProfileController.ts
│   │   └── TemplateController.ts
│   ├── services/
│   │   ├── ServiceRequestService.ts
│   │   ├── TemplateEngineService.ts        # Core matching logic
│   │   ├── BusinessActivationService.ts
│   │   └── NotificationService.ts
│   ├── models/
│   │   ├── ServiceRequest.ts
│   │   ├── BusinessProfile.ts
│   │   ├── Template.ts
│   │   └── TemplateInstance.ts
│   ├── repositories/
│   │   ├── ServiceRequestRepository.ts
│   │   ├── BusinessProfileRepository.ts
│   │   └── TemplateRepository.ts
│   ├── validators/
│   │   ├── ServiceRequestValidator.ts
│   │   └── ...
│   └── ...
└── ...
```

---

## 7. Future Extensibility

### 7.1 Pricing Integration

**Phase 1 (MVP)**: Free service
**Phase 2**: Subscription-based pricing
- Each template can have pricing
- ServiceRequest can include pricing selection
- Admin can set pricing during approval
- BusinessProfile tracks subscription status

```typescript
interface ServiceRequest {
  // ... existing fields
  selectedPricingPlan?: {
    planId: string;
    setupFee: number;
    monthlyFee: number;
    currency: string;
  };
}
```

### 7.2 Automation & AI Matching

**Current**: Rule-based matching (keywords, types, categories)
**Future**: AI-powered matching
- Use NLP to extract business intent from description
- Use ML to learn from admin selections
- Improve matching accuracy over time
- Auto-suggest custom templates for edge cases

```typescript
interface TemplateEngine {
  matchTemplates(businessProfile: BusinessProfile): Promise<TemplateMatch[]>;
  learnFromSelection(requestId: string, selectedTemplateId: string): Promise<void>;
  generateCustomTemplate(businessProfile: BusinessProfile): Promise<Template>;
}
```

### 7.3 Multi-Step Approval

**Current**: Single admin approval
**Future**: Multi-step approval workflow
- Finance approval (pricing)
- Technical approval (template compatibility)
- Legal approval (compliance)
- Final activation

```typescript
interface ServiceRequest {
  // ... existing fields
  approvalWorkflow: {
    steps: ApprovalStep[];
    currentStep: number;
    completedSteps: string[];
  };
}

interface ApprovalStep {
  id: string;
  name: string;
  requiredRole: 'admin' | 'finance' | 'technical' | 'legal';
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: Date;
}
```

### 7.4 Template Marketplace

**Future**: Allow third-party templates
- Template creators can submit templates
- Admin reviews and approves templates
- Templates can be paid or free
- Template versioning and updates

### 7.5 Business Migration

**Future**: Allow businesses to change templates
- Migrate from one template to another
- Preserve data during migration
- Handle incompatible features
- Rollback capability

```typescript
interface TemplateMigration {
  id: string;
  businessProfileId: string;
  fromTemplateId: string;
  toTemplateId: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  migrationPlan: MigrationStep[];
  rollbackPlan?: MigrationStep[];
}
```

---

## 8. Security Considerations

### 8.1 Data Protection
- Encrypt sensitive data (passwords, emails)
- Secure file uploads (logo)
- Validate file types and sizes
- Scan uploaded files for malware

### 8.2 Authorization
- Role-based access control (RBAC)
- Users can only access their own requests
- Admins can only approve/reject (not edit)
- Audit all admin actions

### 8.3 Rate Limiting
- Limit request submissions per user
- Limit file uploads
- Prevent spam/abuse

### 8.4 Input Validation
- Sanitize all user inputs
- Validate email formats
- Validate phone numbers
- Prevent SQL injection, XSS, etc.

---

## 9. Performance Considerations

### 9.1 Scalability
- **Database Indexing**: Index `userId`, `status`, `createdAt`
- **Caching**: Cache template matching results
- **Pagination**: Paginate request lists
- **Async Processing**: Template matching should be async

### 9.2 Optimization
- **Lazy Loading**: Load request details on demand
- **Image Optimization**: Compress/resize logos
- **CDN**: Serve static assets (logos) from CDN
- **Database Queries**: Optimize queries, use joins efficiently

---

## 10. Testing Strategy

### 10.1 Unit Tests
- Template matching algorithm
- Validation logic
- State machine transitions

### 10.2 Integration Tests
- API endpoints
- Database operations
- File uploads

### 10.3 E2E Tests
- Complete request flow (user → admin → activation)
- Template matching and selection
- Business activation

---

## 11. Monitoring & Observability

### 11.1 Metrics
- Request submission rate
- Approval/rejection rate
- Average time to approval
- Template matching accuracy
- Business activation success rate

### 11.2 Logging
- Log all status changes
- Log admin actions
- Log errors and exceptions
- Log template matching decisions

### 11.3 Alerts
- High rejection rate
- Slow approval times
- Template matching failures
- System errors

---

## Conclusion

This architecture provides a solid foundation for the Service Request System, balancing MVP requirements with future scalability. The separation of concerns (frontend/backend), clear data models, and extensible template engine ensure the system can grow from prototype to production while serving thousands of businesses.

**Key Principles:**
1. **Security First**: All validations and authorizations on backend
2. **Scalability**: Design for growth from day one
3. **Extensibility**: Easy to add features (pricing, AI, etc.)
4. **Maintainability**: Clear structure, well-documented
5. **User Experience**: Fast, intuitive, mobile-first

---

**Document Version**: 1.0  
**Last Updated**: 2024-01-20  
**Author**: System Architecture Team

