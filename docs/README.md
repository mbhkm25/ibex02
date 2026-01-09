# Architecture Documentation

This directory contains comprehensive architecture documentation for the Service Request System.

## Documents

### [ARCHITECTURE_SERVICE_REQUESTS.md](./ARCHITECTURE_SERVICE_REQUESTS.md)

Complete architectural specification for the Service Request System, including:

- **System Diagram**: Visual representation of the request flow
- **Request Lifecycle**: Detailed state machine and workflow
- **Data Models**: Complete TypeScript interfaces for all entities
- **Template Engine**: Integration points and matching algorithm
- **Frontend/Backend Separation**: What goes where and why
- **API Endpoints**: Proposed REST API structure
- **Folder Structure**: Recommended code organization
- **Future Extensibility**: Roadmap for pricing, AI, automation
- **Security & Performance**: Best practices and considerations

## Quick Start

1. **Read the Architecture Document**: Start with `ARCHITECTURE_SERVICE_REQUESTS.md` to understand the full system design.

2. **Use Type Definitions**: Import types from `src/app/types/serviceRequest.ts` in your components:
   ```typescript
   import { ServiceRequest, BusinessProfile, Template } from '@/app/types/serviceRequest';
   ```

3. **Follow the Lifecycle**: Implement components according to the request lifecycle defined in the architecture document.

4. **Respect Separation**: Keep frontend-only logic in components, enforce all business logic on the backend.

## Key Principles

1. **Security First**: All validations and authorizations must be backend-enforced
2. **Scalability**: Design for thousands of businesses from day one
3. **Extensibility**: Easy to add features (pricing, AI, automation)
4. **Maintainability**: Clear structure, well-documented code
5. **User Experience**: Fast, intuitive, mobile-first design

## Implementation Status

- ✅ Architecture Document
- ✅ Type Definitions
- ✅ Frontend Components (partial)
- ⏳ Backend API (future)
- ⏳ Template Engine (future)
- ⏳ Business Activation Service (future)

## Questions?

Refer to the architecture document for detailed explanations. For implementation questions, check the code comments and type definitions.

