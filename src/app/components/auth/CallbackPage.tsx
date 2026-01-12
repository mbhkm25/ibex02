import { useEffect } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from 'react-router-dom';

export function CallbackPage() {
  const { isLoading, isAuthenticated, error } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect to dashboard on success
        navigate('/dashboard', { replace: true });
      } else if (error) {
        // Handle error
        console.error('Auth0 Callback Error:', error);
        navigate('/login?error=auth_failed', { replace: true });
      } else {
        // Fallback (e.g. user cancelled or closed tab)
        navigate('/login', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, error, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري إكمال تسجيل الدخول...</p>
        </div>
      </div>
    );
  }

  return null; // Redirecting...
}
