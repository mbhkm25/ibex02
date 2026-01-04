import { useNavigate } from 'react-router-dom';
import { Store, Wallet, QrCode } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

export function WelcomeScreen() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8F9FA]">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Icon */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-200 rotate-3 transition-transform hover:rotate-0">
            <Wallet className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">منصة الدفع الموحدة</h1>
            <p className="text-gray-500 mt-3 text-lg">
              إدارة ذكية للعملاء والمدفوعات في مكان واحد
            </p>
          </div>
        </div>

        {/* Value Propositions */}
        <div className="space-y-4">
          <ValueCard
            icon={<Store className="w-6 h-6" />}
            title="للتجار"
            description="إدارة سهلة للعملاء والأرصدة والمبيعات الآجلة"
            color="bg-orange-50 text-orange-600"
          />
          <ValueCard
            icon={<Wallet className="w-6 h-6" />}
            title="للعملاء"
            description="حساب موحد لجميع مشترياتك مع إمكانية الشراء الآجل"
            color="bg-blue-50 text-blue-600"
          />
          <ValueCard
            icon={<QrCode className="w-6 h-6" />}
            title="دفع سريع"
            description="ادفع بسهولة عبر مسح رمز QR دون الحاجة للنقد"
            color="bg-purple-50 text-purple-600"
          />
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            className="w-full h-14 text-base rounded-2xl bg-gray-900 hover:bg-black shadow-xl shadow-gray-200"
            onClick={() => navigate('/register')}
          >
            إنشاء حساب جديد
          </Button>
          <Button 
            variant="ghost" 
            className="w-full h-14 text-base rounded-2xl text-gray-600 hover:bg-gray-100"
            onClick={() => navigate('/login')}
          >
            تسجيل الدخول
          </Button>
        </div>
      </div>
    </div>
  );
}

function ValueCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  return (
    <Card className="flex items-start gap-4 p-5 rounded-3xl bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </Card>
  );
}
