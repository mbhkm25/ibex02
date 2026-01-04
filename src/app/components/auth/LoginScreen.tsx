import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Wallet, Fingerprint, ScanFace } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';

export function LoginScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleBiometricLogin = () => {
    toast.info('جاري التحقق من البصمة...', {
        duration: 1500,
        onAutoClose: () => {
            toast.success('تم التحقق بنجاح');
            setTimeout(() => navigate('/dashboard'), 500);
        }
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-200">
                <Wallet className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">مرحباً بعودتك</h1>
            <p className="text-gray-500 mt-2">سجل دخولك للمتابعة إلى محفظتك</p>
        </div>

        <Card className="p-8 border-0 shadow-sm rounded-3xl bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                <Label htmlFor="phone" className="text-base">رقم الجوال</Label>
                <Input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors text-right"
                    placeholder="+966 5XXXXXXXX"
                    required
                />
                </div>

                <div>
                <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="password">كلمة المرور</Label>
                    <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                    >
                    نسيت كلمة المرور؟
                    </button>
                </div>
                <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                    placeholder="••••••••"
                    required
                />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                تسجيل الدخول
            </Button>
            
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">أو سجل الدخول عبر</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 rounded-xl border-gray-100 hover:bg-gray-50 hover:text-blue-600 gap-2"
                    onClick={handleBiometricLogin}
                >
                    <Fingerprint className="w-5 h-5" />
                    <span>البصمة</span>
                </Button>
                <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 rounded-xl border-gray-100 hover:bg-gray-50 hover:text-blue-600 gap-2"
                    onClick={handleBiometricLogin}
                >
                    <ScanFace className="w-5 h-5" />
                    <span>الوجه</span>
                </Button>
            </div>
            </form>
        </Card>

        <p className="text-center text-gray-500">
            ليس لديك حساب؟{' '}
            <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-blue-600 font-semibold hover:underline"
            >
                إنشاء حساب جديد
            </button>
        </p>
      </div>
    </div>
  );
}
