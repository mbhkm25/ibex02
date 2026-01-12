import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Loader2, LogIn } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function LoginScreen() {
  const { login, isLoading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogIn className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">تسجيل الدخول</h1>
          <p className="text-gray-500 mt-2">قم بتسجيل الدخول للوصول إلى حسابك</p>
        </div>

        <Button 
            onClick={() => login()} 
            disabled={isLoading}
            className="w-full h-12 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحميل...
                </>
            ) : (
                'تسجيل الدخول عبر Auth0'
            )}
        </Button>
        
        <div className="mt-6 text-sm text-gray-500">
            ليس لديك حساب؟{' '}
            <button onClick={() => login()} className="text-blue-600 font-semibold hover:underline">
                أنشئ حساباً جديداً
            </button>
        </div>
      </div>
    </div>
  );
}
