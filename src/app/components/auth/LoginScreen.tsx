import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Fingerprint, ScanFace, ArrowRight, ShieldCheck, TrendingUp, Shield, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { toast } from 'sonner';

export function LoginScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Capture PWA install event (Web App Install Banner)
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('تم تثبيت التطبيق بنجاح!');
    }
    setDeferredPrompt(null);
    setCanInstall(false);
  };

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
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row-reverse overflow-hidden">
      
      {/* 
        Visual Section 
        - Mobile: Top Header (35% height)
        - Desktop: Left Side (50% width)
      */}
      <div className="relative h-[35vh] lg:h-auto lg:flex-1 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex flex-col items-center justify-center lg:justify-center p-8 overflow-hidden transition-all duration-500">
         {/* Decorative Circles */}
         <div className="absolute top-0 right-0 w-64 lg:w-[500px] h-64 lg:h-[500px] bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-48 lg:w-[400px] h-48 lg:h-[400px] bg-blue-400 opacity-10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl"></div>
         
         {/* Content Wrapper */}
         <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl flex items-center justify-center text-white mb-4 lg:mb-8 shadow-xl border border-white/20">
                <Wallet className="w-8 h-8 lg:w-10 lg:h-10" />
            </div>
            
            {/* Desktop Only Text */}
            <div className="hidden lg:block space-y-2">
                <h2 className="text-3xl font-bold text-white">منصة مالية متكاملة</h2>
                <p className="text-blue-100 text-lg">تحكم في مدفوعاتك بكل سهولة وأمان.</p>
            </div>

            {/* Desktop Only Illustration */}
            <div className="hidden lg:block mt-12 relative w-full max-w-md aspect-square">
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-white/5 rounded-[3rem] backdrop-blur-sm border border-white/10 p-8 flex flex-col gap-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="h-2 w-20 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="flex gap-4 items-end h-32 mb-4">
                        <div className="w-full bg-white/10 rounded-t-lg h-[40%] animate-pulse"></div>
                        <div className="w-full bg-white/20 rounded-t-lg h-[70%]"></div>
                        <div className="w-full bg-white/10 rounded-t-lg h-[50%] animate-pulse delay-75"></div>
                        <div className="w-full bg-white/30 rounded-t-lg h-[85%]"></div>
                    </div>
                 </div>
                 {/* Floating Badges */}
                 <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce delay-1000 duration-[3000ms]">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                 </div>
                 <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce delay-500 duration-[3000ms]">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                 </div>
            </div>
         </div>
      </div>

      {/* 
        Form Section 
        - Mobile: Bottom Sheet style (overlaps header)
        - Desktop: Right Side (full height)
      */}
      <div className="flex-1 flex flex-col bg-white -mt-8 rounded-t-[2rem] lg:mt-0 lg:rounded-none px-6 py-8 lg:p-12 relative z-20 shadow-[-10px_-10px_30px_rgba(0,0,0,0.1)] lg:shadow-none overflow-y-auto">
         <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
            
            {/* Header Text */}
            <div className="mb-8 text-center lg:text-right">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">مرحباً بعودتك!</h1>
                <p className="text-gray-500">الرجاء إدخال بياناتك لتسجيل الدخول</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">رقم الجوال</Label>
                        <Input
                            id="phone"
                            type="tel"
                            dir="ltr"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="h-12 lg:h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-right text-lg"
                            placeholder="+966 5XXXXXXXX"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">كلمة المرور</Label>
                            <button type="button" className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                                نسيت؟
                            </button>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="h-12 lg:h-14 rounded-2xl bg-gray-50 border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-lg"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 lg:h-14 rounded-2xl text-base lg:text-lg font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all transform hover:-translate-y-0.5">
                    تسجيل الدخول
                </Button>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-100" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-400 font-medium">خيارات أخرى</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-12 lg:h-14 rounded-2xl border-gray-200 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 gap-2 transition-all group"
                        onClick={handleBiometricLogin}
                    >
                        <Fingerprint className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        <span>البصمة</span>
                    </Button>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="h-12 lg:h-14 rounded-2xl border-gray-200 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 gap-2 transition-all group"
                        onClick={handleBiometricLogin}
                    >
                        <ScanFace className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        <span>الوجه</span>
                    </Button>
                </div>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-500 mb-4">ليس لديك حساب؟</p>
                <Button 
                    variant="ghost" 
                    className="w-full h-12 rounded-2xl text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 font-bold"
                    onClick={() => navigate('/register')}
                >
                    إنشاء حساب جديد
                </Button>
            </div>
            
            <div className="mt-6 space-y-3">
                {/* Install App Button */}
                {canInstall && (
                    <div className="pb-3 border-b border-gray-100">
                        <Button
                            variant="outline"
                            className="w-full h-11 rounded-2xl border-2 border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 font-bold gap-2"
                            onClick={handleInstallClick}
                        >
                            <Download className="w-4 h-4" />
                            تثبيت التطبيق
                        </Button>
                    </div>
                )}
                <div className="text-center">
                    <Button 
                        variant="link" 
                        className="text-gray-400 hover:text-gray-600 gap-2"
                        onClick={() => navigate('/')}
                    >
                        <ArrowRight className="w-4 h-4" />
                        عودة للرئيسية
                    </Button>
                </div>
                <div className="pt-4 border-t border-gray-100">
                    <Button
                        variant="ghost"
                        className="w-full text-xs text-gray-500 hover:text-gray-700 gap-2"
                        onClick={() => navigate('/admin/login')}
                    >
                        <Shield className="w-3 h-3" />
                        تسجيل دخول المدير
                    </Button>
                </div>
            </div>
         </div>
      </div>
    </div>
  );
}
