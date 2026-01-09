# Mock Data Audit Report

## Overview

This document tracks all mock/fake data found in the codebase and their removal status.

**Core Rule:** Database = Reality. If it doesn't exist in DB, it doesn't exist in the app.

---

## Mock Data Sources Found

### 1. Admin Components

#### `src/app/components/admin/AdminServiceRequests.tsx`
- **Type:** Service Requests Array
- **Location:** Line 69-141
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/admin/service-requests`

#### `src/app/components/admin/AdminServiceRequests.tsx`
- **Type:** Templates Array
- **Location:** Line 144-179
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Use templates from database

#### `src/app/components/admin/AdminBusinesses.tsx`
- **Type:** Businesses Array
- **Location:** Line 58-119
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/admin/businesses`

#### `src/app/components/admin/AdminUsers.tsx`
- **Type:** Users Array
- **Location:** Line 45-86
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/admin/users`

#### `src/app/components/admin/AdminPackages.tsx`
- **Type:** Packages Array
- **Location:** Line 61-120
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/admin/packages`

#### `src/app/components/admin/AdminDashboard.tsx`
- **Type:** Recent Activities, Pending Items
- **Location:** Line 37-50
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/admin/dashboard`

#### `src/app/components/admin/AdminAnalytics.tsx`
- **Type:** Analytics Data
- **Location:** Line 68+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/admin/analytics`

### 2. Business Components

#### `src/app/components/business/MyServiceRequests.tsx`
- **Type:** Service Requests Array
- **Location:** Line 50-101
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/service-requests`

#### `src/app/components/business/BusinessManagement.tsx`
- **Type:** Customers, Bank Accounts, Orders, Deposit Requests
- **Location:** Line 108-158
- **Status:** ⚠️ REMOVE - Replace with API calls
- **Action:** Create API endpoints for each entity

#### `src/app/components/business/BusinessProducts.tsx`
- **Type:** Categories and Products
- **Location:** Line 79-153
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/business/products`

#### `src/app/components/business/BusinessOffers.tsx`
- **Type:** Offers Array
- **Location:** Line 88-172
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/business/offers`

#### `src/app/components/business/Customer360Profile.tsx`
- **Type:** Timeline Events, Private Notes, Transactions, Orders, Deposit Requests
- **Location:** Line 95-201
- **Status:** ⚠️ REMOVE - Replace with API calls
- **Action:** Create API endpoints for each entity

#### `src/app/components/business/CustomerTransactionHistory.tsx`
- **Type:** Transactions Array
- **Location:** Line 79+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/business/customers/:id/transactions`

#### `src/app/components/business/CustomerChat.tsx`
- **Type:** Messages Array
- **Location:** Line 39+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/business/customers/:id/chat`

#### `src/app/components/business/MyBusinesses.tsx`
- **Type:** Businesses Array
- **Location:** Line 37+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/businesses`

### 3. Customer Components

#### `src/app/components/customer/CustomerWallet.tsx`
- **Type:** Transactions, Recent Orders, Store Bank Accounts
- **Location:** Line 75-88
- **Status:** ⚠️ REMOVE - Replace with API calls
- **Action:** Create API endpoints for each entity

#### `src/app/components/customer/TransactionHistory.tsx`
- **Type:** Transactions Array
- **Location:** Line 83+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/customer/transactions`

#### `src/app/components/customer/ProductsAndServices.tsx`
- **Type:** Products Array
- **Location:** Line 59+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/customer/products`

#### `src/app/components/customer/MySubscriptions.tsx`
- **Type:** Subscriptions, Payment History, Notifications
- **Location:** Line 126-243
- **Status:** ⚠️ REMOVE - Replace with API calls
- **Action:** Create API endpoints for each entity

#### `src/app/components/customer/QRScanner.tsx`
- **Type:** Mock Store Data
- **Location:** Line 22-34
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/customer/stores/:id`

#### `src/app/components/customer/PaymentQRScanner.tsx`
- **Type:** Mock Payment Data
- **Location:** Line 22-32
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/customer/payments/scan`

#### `src/app/components/customer/ExploreBusiness.tsx`
- **Type:** Businesses Array
- **Location:** Line 18+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/customer/businesses`

### 4. Other Components

#### `src/app/components/dashboard/Dashboard.tsx`
- **Type:** Recent Transactions
- **Location:** Line 23+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/dashboard`

#### `src/app/components/notifications/NotificationsScreen.tsx`
- **Type:** Notifications Array
- **Location:** Line 24+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint `/api/notifications`

#### `src/app/components/merchant/MerchantDashboard.tsx`
- **Type:** Customers, Transactions
- **Location:** Line 23-29
- **Status:** ⚠️ REMOVE - Replace with API calls
- **Action:** Create API endpoints

#### `src/app/components/merchant/CustomerProfile.tsx`
- **Type:** Transactions Array
- **Location:** Line 28+
- **Status:** ⚠️ REMOVE - Replace with API call
- **Action:** Create API endpoint

### 5. API Client Mock Functions

#### `src/app/api/adminServiceRequests.ts`
- **Type:** Mock API implementations
- **Location:** Multiple functions
- **Status:** ⚠️ REMOVE - Replace with real API calls
- **Action:** Update to call actual serverless functions

---

## Removal Strategy

### Phase 1: Critical Components (Service Requests)
1. Remove mock data from `AdminServiceRequests.tsx`
2. Remove mock data from `MyServiceRequests.tsx`
3. Create API endpoints for service requests
4. Update components to use API

### Phase 2: Business Management
1. Remove mock data from `BusinessManagement.tsx`
2. Remove mock data from `BusinessProducts.tsx`
3. Remove mock data from `BusinessOffers.tsx`
4. Create API endpoints for each entity

### Phase 3: Customer Features
1. Remove mock data from customer components
2. Create API endpoints for customer features
3. Update components to use API

### Phase 4: Admin Features
1. Remove mock data from admin components
2. Create API endpoints for admin features
3. Update components to use API

### Phase 5: Other Components
1. Remove remaining mock data
2. Create API endpoints as needed
3. Update components to use API

---

## Implementation Notes

- All removed mock data will be replaced with API calls
- Components will show loading/empty/error states
- Features without API will be disabled with clear messages
- All IDs will come from database (UUIDs)
- No client-side ID generation

---

**Last Updated:** 2024-01-20  
**Status:** In Progress

