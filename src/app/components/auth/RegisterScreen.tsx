import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';

export function RegisterScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to OTP screen
    navigate('/otp', { state: { phone: formData.phone } });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full">
        <Button
            variant="ghost"
            className="mb-6 rounded-full text-gray-500 hover:text-gray-900 gap-2 px-2"
            onClick={() => navigate(-1)}
        >
            <ArrowRight className="w-5 h-5" />
            <span>رجوع</span>
        </Button>

        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">إنشاء حساب جديد</h1>
            <p className="text-gray-500 mt-2">املأ البيانات التالية لإنشاء محفظتك</p>
        </div>

        <Card className="p-8 border-0 shadow-sm rounded-3xl bg-white">
            <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <Label htmlFor="fullName">الاسم الكامل</Label>
                <Input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                placeholder="أدخل اسمك الكامل"
                required
                />
            </div>

            <div>
                <Label htmlFor="phone">رقم الجوال</Label>
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
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                id="email"
                type="email"
                dir="ltr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors text-right"
                placeholder="example@email.com"
                required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="password">كلمة المرور</Label>
                    <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                    placeholder="••••••••"
                    required
                    />
                </div>
                <div>
                    <Label htmlFor="confirmPassword">تأكيدها</Label>
                    <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                    placeholder="••••••••"
                    required
                    />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl mt-4 text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                متابعة
            </Button>
            </form>
        </Card>

        <p className="text-center mt-6 text-gray-500">
            لديك حساب بالفعل؟{' '}
            <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-blue-600 font-semibold hover:underline"
            >
                تسجيل الدخول
            </button>
        </p>
      </div>
    </div>
  );
}
