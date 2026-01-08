import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';

export function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // هنا يمكن إضافة التحقق من بيانات المدير
    if (formData.username === 'admin' && formData.password === 'admin123') {
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin/dashboard');
    } else {
      toast.error('بيانات الدخول غير صحيحة');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">لوحة تحكم المدير</h1>
          <p className="text-sm text-gray-600">تسجيل الدخول كمدير للمنصة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-2 block">اسم المستخدم</Label>
            <Input
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="أدخل اسم المستخدم"
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-bold text-gray-700 mb-2 block">كلمة المرور</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="أدخل كلمة المرور"
              className="h-12 rounded-xl border-2 border-gray-200 focus:border-red-400"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-12 font-black"
          >
            <Lock className="w-4 h-4 ml-2" />
            تسجيل الدخول
            <ArrowRight className="w-4 h-4 mr-2" />
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            العودة إلى تسجيل الدخول العادي
          </Button>
        </div>
      </Card>
    </div>
  );
}

