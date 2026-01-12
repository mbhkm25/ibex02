import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function CallbackPage() {
  const { error, isAuthenticated, isLoading } = useAuth0();

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-2">حدث خطأ في المصادقة</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">جاري إكمال تسجيل الدخول...</h2>
        <p className="text-gray-500 mt-2">يرجى الانتظار</p>
      </div>
    </div>
  );
}
