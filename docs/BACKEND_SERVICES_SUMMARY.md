# Backend Services - Quick Reference

## Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Template Registry                                       │
│  - Defines 4 canonical templates                        │
│  - ONE template per business model                      │
│  - Single source of truth                              │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Template Resolver                                       │
│  - Deterministic resolution                             │
│  - BusinessModel → Template (1:1 mapping)             │
│  - No scoring, no AI                                    │
└──────────────────────┬──────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────┐
│  Business Activation Service                            │
│  - Orchestrates activation                              │
│  - Creates BusinessProfile                              │
│  - Creates TemplateInstance                             │
│  - Initializes entities                                 │
│  - Updates request state                                │
└─────────────────────────────────────────────────────────┘
```

## Key Functions

### Template Resolution
```typescript
import { resolveTemplate } from '@/app/services/templateResolver';

const resolution = resolveTemplate('commerce');
// Returns: { template: COMMERCE_BASE, businessModel: 'commerce', resolvedAt: Date }
```

### Business Activation
```typescript
import { activateBusiness } from '@/app/services/businessActivationService';

const result = await activateBusiness({
  serviceRequest: approvedRequest,
  activatedBy: 'admin-1',
  notes: 'Standard activation'
});
// Returns: { businessProfile, templateInstance, activationDate, activatedBy }
```

### Check Activation Eligibility
```typescript
import { canActivateBusiness } from '@/app/services/businessActivationService';

const check = canActivateBusiness(serviceRequest);
// Returns: { canActivate: boolean, reason?: string }
```

## Template Registry

### Get Template by Business Model
```typescript
import { getTemplateByBusinessModel } from '@/app/services/templateRegistry';

const template = getTemplateByBusinessModel('commerce');
// Returns: COMMERCE_BASE template
```

### Get All Templates
```typescript
import { getAllTemplates } from '@/app/services/templateRegistry';

const templates = getAllTemplates();
// Returns: [COMMERCE_BASE, FOOD_BASE, SERVICES_BASE, RENTAL_BASE]
```

## API Client

### Activate Business
```typescript
import { activateBusinessFromRequest } from '@/app/api/adminServiceRequests';

const result = await activateBusinessFromRequest(requestId, {
  templateId: 'commerce-base-v1', // Optional override
  customizations: {} // Optional
});
```

## Guard Rails

All guard rails are enforced in `businessActivationService.ts`:

1. ✅ Request must be `approved`
2. ✅ `businessModel` must be present
3. ✅ Template must be resolvable
4. ✅ Request must not already be activated
5. ✅ All operations are logged (audit trail)

## Error Handling

```typescript
import { BusinessActivationError } from '@/app/services/businessActivationService';

try {
  await activateBusiness(input);
} catch (error) {
  if (error instanceof BusinessActivationError) {
    console.error('Activation failed:', error.code, error.message);
  }
}
```

## Mental Model

**BusinessModel = Intent**  
User chooses: "I sell products" → `businessModel: 'commerce'`

**Template = Structure**  
System decides: "You need inventory, products, suppliers" → `COMMERCE_BASE`

**BusinessProfile = Reality**  
System creates: Live business ready to use → `BusinessProfile` entity

---

**Files**:
- `src/app/services/templateRegistry.ts`
- `src/app/services/templateResolver.ts`
- `src/app/services/businessActivationService.ts`
- `src/app/api/adminServiceRequests.ts`

