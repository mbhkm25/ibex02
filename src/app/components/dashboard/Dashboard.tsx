import { 
  Store, 
  Search, 
  Wallet,
  QrCode,
  ShoppingBag,
  CreditCard,
  Utensils,
  Car,
  ScanLine,
  ChevronRight,
  ArrowUpRight,
  TrendingUp,
  Building2,
  History as HistoryIcon
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // TODO: Fetch recent transactions from API (BFF)
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Get first name safely
  const firstName = user?.name ? user.name.split(' ')[0] : 'ضيف';

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'صباح الخير';
    if (hour >= 12 && hour < 17) return 'طاب يومك';
    if (hour >= 17 && hour < 22) return 'مساء الخير';
    return 'أهلاً بك';
  };

  useEffect(() => {
    // TODO: Fetch real data via apiClient
    setLoading(false);
    setRecentTransactions([]);
  }, []);

  return (
    <DashboardLayout 
      title={`${getGreeting()}، ${firstName}`} 
      subtitle="نظرة سريعة على محفظتك وأعمالك اليوم."
    >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Right Column (Main Stats & Actions) */}
          <div className="lg:col-span-8 space-y-6">
            
             {/* Hero Card - Mobile First Focus */}
             <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">الرصيد المتوفر</p>
                    <h2 className="text-3xl font-bold mb-4">0.00 <span className="text-sm font-normal text-gray-400">ر.س</span></h2>
                    <div className="flex gap-3">
                      <Button size="sm" onClick={() => navigate('/scan/pay')} className="bg-white text-gray-900 hover:bg-gray-100 font-bold rounded-xl px-6">
                        <ScanLine className="w-4 h-4 ml-2" />
                        دفع فوري
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => navigate('/scan/store')} className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl">
                        <QrCode className="w-4 h-4 ml-2" />
                        مسح كود
                      </Button>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
                <div className="absolute top-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
             </div>

             {/* Quick Actions Grid */}
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickActionCard 
                  icon={<QrCode className="w-6 h-6 text-blue-600" />} 
                  title="مسح كود" 
                  desc="ادفع أو تصفح"
                  color="bg-blue-50"
                  onClick={() => navigate('/scan/store')}
                />
                <QuickActionCard 
                  icon={<Search className="w-6 h-6 text-purple-600" />} 
                  title="اكتشف" 
                  desc="متاجر حولك"
                  color="bg-purple-50"
                  onClick={() => navigate('/explore')}
                />
                <QuickActionCard 
                  icon={<Wallet className="w-6 h-6 text-orange-600" />} 
                  title="اشتراكاتي" 
                  desc="الولاء والنقاط"
                  color="bg-orange-50"
                  onClick={() => navigate('/subscriptions')}
                />
                <QuickActionCard 
                  icon={<HistoryIcon className="w-6 h-6 text-emerald-600" />} 
                  title="السجل" 
                  desc="حركاتك المالية"
                  color="bg-emerald-50"
                  onClick={() => navigate('/wallet/history')}
                />
             </div>

             {/* Merchant Entry Point (Subtle) */}
             <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                    <Store className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">منطقة التجار</h4>
                    <p className="text-xs text-gray-500">إدارة أعمالك أو إنشاء متجر</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/business')} className="text-gray-900 hover:bg-white text-xs font-bold gap-1">
                  الدخول
                  <ChevronRight className="w-3 h-3 rotate-180" />
                </Button>
             </div>

             {/* Merchant Promo (Subtle) */}
             <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                    <Store className="w-5 h-5 text-gray-700" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">هل أنت تاجر؟</h4>
                    <p className="text-xs text-gray-500">أدر أعمالك أو أنشئ متجراً جديداً</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate('/business')} className="text-gray-900 hover:bg-white text-xs font-bold">
                  دخول التجار
                  <ChevronRight className="w-3 h-3 mr-1 rotate-180" />
                </Button>
             </div>

            {/* Transactions Table */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="font-bold text-lg text-gray-900">آخر العمليات</h3>
                 <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900" onClick={() => navigate('/wallet/history')}>عرض الكل</Button>
               </div>
               
               {recentTransactions.length > 0 ? (
                 <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                   <table className="w-full">
                     <thead>
                       <tr className="text-right text-xs text-gray-400 border-b border-gray-50">
                         <th className="pb-4 font-medium pr-2">الجهة</th>
                         <th className="pb-4 font-medium hidden sm:table-cell">النوع</th>
                         <th className="pb-4 font-medium">التاريخ</th>
                         <th className="pb-4 font-medium text-left pl-2">المبلغ</th>
                       </tr>
                     </thead>
                     <tbody className="text-sm">
                       {recentTransactions.map((tx) => (
                         <TransactionRow 
                           key={tx.id}
                           {...tx}
                         />
                       ))}
                     </tbody>
                   </table>
                 </div>
               ) : (
                 <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 border-dashed">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ShoppingBag className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium">لا توجد عمليات حديثة</p>
                    <p className="text-xs text-gray-400 mt-1">ستظهر عملياتك هنا بعد أول استخدام</p>
                 </div>
               )}
            </div>
          </div>

          {/* Left Column (Secondary Stats) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Spending Stats */}
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-white space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900">مصروفات الشهر</h3>
                <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg text-gray-600">يناير 2026</span>
              </div>
              
              <div className="relative pt-2">
                <div className="flex items-end justify-center gap-1 mb-6">
                  <span className="text-4xl font-black text-gray-900">0</span>
                  <span className="text-sm font-bold text-gray-500 mb-1">ر.س</span>
                </div>
                
                {/* Empty State for Stats */}
                <div className="text-center py-4">
                  <p className="text-xs text-gray-400">لا توجد بيانات كافية للتحليل</p>
                </div>
              </div>
            </Card>

            {/* Subscriptions Widget */}
            <Card className="p-5 border-0 shadow-sm rounded-3xl bg-white">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-900">اشتراكاتي النشطة</h4>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-gray-100" onClick={() => navigate('/subscriptions')}>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
              </div>
              <div className="space-y-3">
                 {/* Mock Data Removed - Showing Empty State */}
                 <div className="p-4 bg-gray-50 rounded-2xl text-center">
                    <p className="text-xs text-gray-500">لا توجد اشتراكات نشطة</p>
                    <Button variant="link" size="sm" className="text-blue-600 text-xs mt-1 h-auto p-0" onClick={() => navigate('/explore')}>
                      تصفح المتاجر
                    </Button>
                 </div>
              </div>
            </Card>
          </div>
        </div>
    </DashboardLayout>
  );
}

function QuickActionCard({ icon, title, desc, color, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-3 group relative overflow-hidden"
    >
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div className="relative z-10">
        <h4 className="font-bold text-gray-900 text-sm mb-0.5">{title}</h4>
        <p className="text-[10px] text-gray-500 font-medium">{desc}</p>
      </div>
    </div>
  );
}

function TransactionRow({ icon, name, type, date, amount, isPositive }: any) {
  return (
    <tr className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
      <td className="py-4 flex items-center gap-3 pr-2">
        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 shrink-0">
          {icon}
        </div>
        <span className="font-bold text-gray-700 text-sm">{name}</span>
      </td>
      <td className="py-4 text-gray-500 text-xs hidden sm:table-cell">{type}</td>
      <td className="py-4 text-gray-400 text-xs">{date}</td>
      <td className={`py-4 text-left font-bold pl-2 ${isPositive ? 'text-emerald-600' : 'text-gray-900'}`}>
        {isPositive ? '+' : ''}{amount} <span className="text-[10px] font-normal text-gray-400">ر.س</span>
      </td>
    </tr>
  );
}
