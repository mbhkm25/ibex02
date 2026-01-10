# QR Scanner Implementation

## Overview

This document describes the QR Scanner UI implementation for scanning and resolving QR codes.

**Core Principle:**
- QR = Pointer (points to entity)
- Scanner = Reader (reads QR code)
- Data API = Resolver (fetches metadata)
- UI = Navigator (routes to entity)

---

## Components

### 1. QRCodeScanner Component

**File:** `src/app/components/qr/QRCodeScanner.tsx`

**Route:** `/scan/qr`

**Features:**
- Real-time QR code scanning using device camera
- Uses `html5-qrcode` library
- Mobile-first design with full-screen camera view
- Automatic QR code resolution via Data API
- User confirmation dialog before navigation
- Error handling for invalid/inactive QR codes

**Security:**
- Requires authentication (ProtectedRoute)
- Validates QR code exists and is active
- User confirmation before navigation

### 2. QRCodeResolver Component

**File:** `src/app/components/qr/QRCodeResolver.tsx`

**Route:** `/q/:qrId`

**Features:**
- Resolves QR code from URL
- Fetches QR metadata from Data API
- Automatic redirect to entity page
- Error handling for invalid/inactive QR codes

**Use Case:**
- When user clicks QR code URL
- When QR code is shared via link
- Direct access to QR code entity

---

## Flow

### Scanning Flow

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Scanner   │         │  Data API    │         │   Router    │
│             │         │              │         │             │
│ 1. Scan QR  │────────▶│ 2. Fetch     │────────▶│ 3. Route    │
│    Code     │         │    Metadata  │         │    to Entity│
│             │         │              │         │             │
│ 4. Show     │◀────────│ 5. Return   │◀────────│ 6. Validate │
│    Confirm  │         │    Metadata  │         │    QR Active│
└─────────────┘         └──────────────┘         └─────────────┘
```

### Resolution Flow

```
User clicks QR URL → /q/:qrId
  ↓
QRCodeResolver mounts
  ↓
Fetch QR metadata from Data API
  ↓
Validate QR is active
  ↓
Redirect to entity page based on entity_type
```

---

## Routing

### Entity Type Routing

| entity_type | Route |
|------------|-------|
| `business` | `/business/:entity_id/manage` |
| `product` | `/wallet/:business_id/products?product=:entity_id` |
| `service` | `/wallet/:business_id/products?service=:entity_id` |
| `payment` | `/wallet/:business_id/history?payment=:entity_id` |
| `customer` | `/business/:business_id/customer/:entity_id` |

---

## QR Code Format

### URL Format

QR codes contain URLs in the format:
```
https://<app-domain>/q/<qr_id>
```

### UUID Format

QR codes can also contain direct UUID:
```
123e4567-e89b-12d3-a456-426614174000
```

### Extraction

The scanner extracts `qr_id` from:
1. URL pattern: `/q/<uuid>`
2. Direct UUID format

---

## Error Handling

### Invalid QR Code

**Error:** "رمز QR غير صالح"
**Cause:** Scanned text doesn't match QR URL or UUID format
**Action:** Show error, allow retry

### QR Not Found

**Error:** "رمز QR غير موجود في النظام"
**Cause:** QR ID doesn't exist in database
**Action:** Show error, allow retry

### QR Inactive

**Error:** "رمز QR غير نشط"
**Cause:** QR code exists but `is_active = false`
**Action:** Show error, allow retry

### Camera Error

**Error:** "فشل الوصول إلى الكاميرا"
**Cause:** Camera permission denied or unavailable
**Action:** Show error, allow retry

### Authentication Error

**Error:** "انتهت جلسة تسجيل الدخول"
**Cause:** JWT token expired or invalid
**Action:** Logout user, redirect to login

---

## UX Features

### Mobile-First Design

- Full-screen camera view
- Scanning frame overlay
- Animated scanning line
- Clear instructions

### User Confirmation

- Dialog shows QR metadata before navigation
- User must confirm before redirect
- Shows entity type and ID
- Cancel option to scan again

### Loading States

- Loading spinner during QR resolution
- Clear feedback during processing
- Non-blocking UI during scan

### Error States

- Clear error messages
- Retry buttons
- Helpful guidance

---

## Security

### ✅ Enforced

- ✅ Requires authentication
- ✅ Validates QR code exists
- ✅ Validates QR code is active
- ✅ User confirmation before navigation
- ✅ RLS ensures users only see their own QR codes

### ❌ Not Allowed

- ❌ No auto-navigation without confirmation
- ❌ No access to inactive QR codes
- ❌ No access to other users' QR codes
- ❌ No direct database access

---

## Usage

### Access Scanner

1. **From Dashboard:**
   - Click "مسح QR" in navigation
   - Navigate to `/scan/qr`

2. **From URL:**
   - Direct access: `/scan/qr`
   - Requires authentication

### Scan QR Code

1. Grant camera permission
2. Point camera at QR code
3. Wait for scan (automatic)
4. Confirm navigation in dialog
5. Redirect to entity page

### Access via QR URL

1. Click QR code URL (e.g., `https://app.com/q/123...`)
2. QRCodeResolver fetches metadata
3. Automatic redirect to entity page

---

## Testing

### Manual Testing

1. **Generate QR Code:**
   ```typescript
   // Use QR Generator to create QR code
   // Get qr_id and qr_url
   ```

2. **Test Scanner:**
   - Open `/scan/qr`
   - Grant camera permission
   - Scan generated QR code
   - Verify confirmation dialog
   - Verify navigation

3. **Test Resolver:**
   - Open `/q/<qr_id>` directly
   - Verify automatic redirect
   - Verify error handling

### Test Cases

- ✅ Valid active QR code → Navigate to entity
- ✅ Invalid QR format → Show error
- ✅ QR not found → Show error
- ✅ Inactive QR → Show error
- ✅ Camera denied → Show error
- ✅ Unauthenticated → Redirect to login

---

## Dependencies

- `html5-qrcode` - QR code scanning library
- `qrcode.react` - QR code generation (for display)
- Neon Data API - QR metadata resolution

---

## Next Steps

After QR Scanner implementation:

1. ✅ **Test with real QR codes** from QR Generator
2. ✅ **Test on mobile devices** (camera access)
3. ✅ **Test error scenarios** (invalid, inactive, not found)
4. ⏳ **Add QR code history** (list of scanned QR codes)
5. ⏳ **Add QR code analytics** (scan count, last scanned)

---

## References

- [html5-qrcode Documentation](https://github.com/mebjas/html5-qrcode)
- [QR Codes Database Setup](../docs/QR_CODES_DATABASE_SETUP.md)
- [QR Code Generation API](../docs/QR_CODE_GENERATION_API.md)
- [Data API Integration](../docs/DATA_API_INTEGRATION.md)

