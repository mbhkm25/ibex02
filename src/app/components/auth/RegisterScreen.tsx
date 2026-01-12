import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { Navigate } from 'react-router-dom';

export function RegisterScreen() {
  const { register, isLoading, isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
          <p className="text-gray-500 mt-2">انضم إلينا وابدأ رحلتك</p>
        </div>

        <Button 
            onClick={() => register()} 
            disabled={isLoading}
            className="w-full h-12 text-lg font-medium bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center gap-2"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحميل...
                </>
            ) : (
                'إنشاء حساب عبر Auth0'
            )}
        </Button>

        <div className="mt-6 text-sm text-gray-500">
            لديك حساب بالفعل؟{' '}
            <button onClick={() => register()} className="text-blue-600 font-semibold hover:underline">
                تسجيل الدخول
            </button>
        </div>
      </div>
    </div>
  );
}
