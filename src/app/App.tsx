import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

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
import { CustomerWallet } from './components/customer/CustomerWallet';
import { ExploreBusiness } from './components/customer/ExploreBusiness';
import { MySubscriptions } from './components/customer/MySubscriptions';

// Cashier App
import { CashierApp } from './components/cashier/CashierApp';

// Notifications
import { NotificationsScreen } from './components/notifications/NotificationsScreen';

export default function App() {
  return (
    <BrowserRouter>
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
          <Route path="/scan" element={<QRScanner />} />
          <Route path="/wallet/:storeId" element={<CustomerWallet />} />
          <Route path="/explore" element={<ExploreBusiness />} />
          <Route path="/subscriptions" element={<MySubscriptions />} />
          
          {/* Cashier Routes */}
          <Route path="/cashier/:storeId" element={<CashierApp />} />
          
          {/* Notifications */}
          <Route path="/notifications" element={<NotificationsScreen />} />
          
          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/welcome" replace />} />
        </Routes>
        
        <Toaster position="top-center" dir="rtl" />
      </div>
    </BrowserRouter>
  );
}
