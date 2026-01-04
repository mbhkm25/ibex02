import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Fingerprint, ScanFace, ArrowRight, ShieldCheck, PieChart, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-white flex flex-row-reverse overflow-hidden">
      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:max-w-xl relative z-10 bg-white">
         <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="space-y-2">
                <Button 
                    variant="ghost" 
                    className="p-0 h-auto hover:bg-transparent hover:text-blue-600 text-gray-400 gap-2 mb-4"
                    onClick={() => navigate('/')}
                >
                    <ArrowRight className="w-4 h-4" />
                    عودة للرئيسية
                </Button>
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                    <Wallet className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">مرحباً بعودتك!</h1>
                <p className="text-gray-500">من الجيد رؤيتك مرة أخرى. سجل دخولك للمتابعة.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="phone">رقم الجوال</Label>
                        <Input
                            id="phone"
                            type="tel"
                            dir="ltr"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-right"
                            placeholder="+966 5XXXXXXXX"
                            required
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                نسيت كلمة المرور؟
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl text-base bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.02]">
                    تسجيل الدخول
                </Button>

                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-400 font-medium">أو عبر</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-12 rounded-xl border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 gap-2 transition-all"
                        onClick={handleBiometricLogin}
                    >
                        <Fingerprint className="w-5 h-5" />
                        <span>البصمة</span>
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-12 rounded-xl border-gray-100 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-100 gap-2 transition-all"
                        onClick={handleBiometricLogin}
                    >
                        <ScanFace className="w-5 h-5" />
                        <span>الوجه</span>
                    </Button>
                </div>
            </form>

            <p className="text-center text-gray-500">
                ليس لديك حساب؟{' '}
                <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="text-blue-600 font-bold hover:underline"
                >
                    إنشاء حساب
                </button>
            </p>
         </div>
      </div>

      {/* Left Side - Illustration (Desktop Only) */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 items-center justify-center p-12 relative overflow-hidden">
         {/* Decorative Circles */}
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-400 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
         
         {/* Abstract Dashboard Illustration */}
         <div className="relative z-10 w-full max-w-lg aspect-square">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-[3rem] backdrop-blur-sm border border-white/10 p-8 flex flex-col gap-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                {/* Mock Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="h-2 w-20 bg-white/20 rounded-full"></div>
                </div>
                
                {/* Mock Chart */}
                <div className="flex gap-4 items-end h-32 mb-4">
                    <div className="w-full bg-white/10 rounded-t-lg h-[40%] animate-pulse"></div>
                    <div className="w-full bg-white/20 rounded-t-lg h-[70%]"></div>
                    <div className="w-full bg-white/10 rounded-t-lg h-[50%] animate-pulse delay-75"></div>
                    <div className="w-full bg-white/30 rounded-t-lg h-[85%]"></div>
                    <div className="w-full bg-white/10 rounded-t-lg h-[60%] animate-pulse delay-150"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce delay-1000 duration-[3000ms]">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="h-2 w-16 bg-gray-200 rounded-full mb-1"></div>
                        <div className="h-3 w-12 bg-gray-900 rounded-full"></div>
                    </div>
                </div>

                <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce delay-500 duration-[3000ms]">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">حماية</p>
                        <p className="text-sm font-bold text-gray-800">100% آمن</p>
                    </div>
                </div>
            </div>
            
            <div className="text-center mt-12">
                <h2 className="text-2xl font-bold text-white mb-2">منصة مالية متكاملة</h2>
                <p className="text-blue-100">تحكم في مدفوعاتك، مبيعاتك، واشتراكاتك بكل سهولة وأمان.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
