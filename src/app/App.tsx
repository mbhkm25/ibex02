import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Auth Pages
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { RegisterScreen } from './components/auth/RegisterScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { OTPScreen } from './components/auth/OTPScreen';

// Main App Pages
import { Dashboard } from './components/dashboard/Dashboard';
import { CreateStore } from './components/merchant/CreateStore';
import { MerchantDashboard } from './components/merchant/MerchantDashboard';
import { CustomerProfile } from './components/merchant/CustomerProfile';
import { QRScanner } from './components/customer/QRScanner';
import { PaymentQRScanner } from './components/customer/PaymentQRScanner';
import { QRCodeScanner } from './components/qr/QRCodeScanner';
import { QRCodeResolver } from './components/qr/QRCodeResolver';
import { CustomerWallet } from './components/customer/CustomerWallet';
import { ExploreBusiness } from './components/customer/ExploreBusiness';
import { MySubscriptions } from './components/customer/MySubscriptions';
import { ProductsAndServices } from './components/customer/ProductsAndServices';
import { TransactionHistory } from './components/customer/TransactionHistory';

// Business Pages
import { BusinessServiceRequest } from './components/business/BusinessServiceRequest';
import { MyBusinesses } from './components/business/MyBusinesses';
import { MyServiceRequests } from './components/business/MyServiceRequests';
import { BusinessManagement } from './components/business/BusinessManagement';
import { BusinessProducts } from './components/business/BusinessProducts';
import { BusinessOffers } from './components/business/BusinessOffers';
import { CustomerTransactionHistory } from './components/business/CustomerTransactionHistory';
import { CustomerChat } from './components/business/CustomerChat';
import { Customer360Profile } from './components/business/Customer360Profile';
import { QRGenerator } from './components/business/QRGenerator';

// Cashier App
import { CashierApp } from './components/cashier/CashierApp';

// Notifications
import { NotificationsScreen } from './components/notifications/NotificationsScreen';

// Admin Pages
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminUsers } from './components/admin/AdminUsers';
import { AdminPackages } from './components/admin/AdminPackages';
import { AdminBusinesses } from './components/admin/AdminBusinesses';
import { AdminServiceRequests } from './components/admin/AdminServiceRequests';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { AdminSettings } from './components/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Routes>
          {/* Auth Routes */}
          <Route path="/welcome" element={<WelcomeScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/otp" element={<OTPScreen />} />
          
          {/* Main App Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-store" element={<CreateStore />} />
          <Route path="/merchant/:storeId" element={<MerchantDashboard />} />
          <Route path="/merchant/:storeId/customer/:customerId" element={<CustomerProfile />} />
          
          {/* Customer Routes */}
          <Route path="/scan" element={<Navigate to="/scan/store" replace />} />
          <Route path="/scan/store" element={<QRScanner />} />
          <Route path="/scan/pay" element={<PaymentQRScanner />} />
          <Route path="/scan/qr" element={<ProtectedRoute><QRCodeScanner /></ProtectedRoute>} />
          <Route path="/q/:qrId" element={<ProtectedRoute><QRCodeResolver /></ProtectedRoute>} />
          <Route path="/wallet/:storeId" element={<CustomerWallet />} />
          <Route path="/wallet/:storeId/products" element={<ProductsAndServices />} />
          <Route path="/wallet/:storeId/history" element={<TransactionHistory />} />
          <Route path="/explore" element={<ExploreBusiness />} />
          <Route path="/subscriptions" element={<MySubscriptions />} />
          
          {/* Business Routes - Protected */}
          <Route path="/business" element={<ProtectedRoute><MyBusinesses /></ProtectedRoute>} />
          <Route path="/business/request" element={<ProtectedRoute><BusinessServiceRequest /></ProtectedRoute>} />
          <Route path="/business/requests" element={<ProtectedRoute><MyServiceRequests /></ProtectedRoute>} />
          <Route path="/business/:businessId/manage" element={<ProtectedRoute><BusinessManagement /></ProtectedRoute>} />
          <Route path="/business/:businessId/products" element={<ProtectedRoute><BusinessProducts /></ProtectedRoute>} />
          <Route path="/business/:businessId/offers" element={<ProtectedRoute><BusinessOffers /></ProtectedRoute>} />
          <Route path="/business/:businessId/qr" element={<ProtectedRoute><QRGenerator /></ProtectedRoute>} />
          <Route path="/business/:businessId/customer/:customerId" element={<ProtectedRoute><Customer360Profile /></ProtectedRoute>} />
          <Route path="/business/:businessId/customer/:customerId/history" element={<ProtectedRoute><CustomerTransactionHistory /></ProtectedRoute>} />
          <Route path="/business/:businessId/customer/:customerId/chat" element={<ProtectedRoute><CustomerChat /></ProtectedRoute>} />
          
          {/* Cashier Routes */}
          <Route path="/cashier/:storeId" element={<CashierApp />} />
          
          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsScreen />} />
          
          {/* Admin Routes - Protected with Admin Role */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/businesses" element={<ProtectedRoute requireAdmin><AdminBusinesses /></ProtectedRoute>} />
          <Route path="/admin/packages" element={<ProtectedRoute requireAdmin><AdminPackages /></ProtectedRoute>} />
          <Route path="/admin/service-requests" element={<ProtectedRoute requireAdmin><AdminServiceRequests /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
          </Routes>
          
          <Toaster position="top-center" dir="rtl" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
