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
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layout/DashboardLayout';

export function Dashboard() {
  const navigate = useNavigate();

  // Mock Data relevant to our app
  const recentTransactions = [
    { id: '1', store: 'سوبر ماركت الرحمة', amount: -125, type: 'مشتريات', date: 'اليوم، 2:30 م', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: '2', store: 'مطعم البيك', amount: -45, type: 'مشتريات', date: 'أمس، 7:15 م', icon: <Utensils className="w-4 h-4" /> },
    { id: '3', store: 'شحن رصيد', amount: +200, type: 'إيداع', date: '2 يناير، 11:00 ص', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <DashboardLayout 
      title="مرحباً، أحمد" 
      subtitle="إليك ملخص نشاطك اليومي."
    >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Right Column (Main Stats & Actions) */}
          <div className="lg:col-span-8 space-y-6">
            
             {/* Quick Actions Grid - Updated to include Payment and Store Scan */}
             <div className="grid grid-cols-2 gap-4">
                <QuickActionCard 
                  icon={<QrCode className="w-6 h-6 text-blue-600" />} 
                  title="مسح متجر" 
                  desc="للاشتراك والتصفح"
                  color="bg-blue-50"
                  onClick={() => navigate('/scan/store')}
                />
                <QuickActionCard 
                  icon={<ScanLine className="w-6 h-6 text-green-600" />} 
                  title="دفع فوري" 
                  desc="سداد الفواتير"
                  color="bg-green-50"
                  onClick={() => navigate('/scan/pay')}
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
                  desc="الأعمال المشترك بها"
                  color="bg-orange-50"
                  onClick={() => navigate('/subscriptions')}
                />
             </div>

            {/* Transactions Table */}
            <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <h3 className="font-semibold text-lg text-gray-800">آخر العمليات</h3>
                 <Button variant="ghost" size="sm" className="text-primary">عرض الكل</Button>
               </div>
               <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                 <table className="w-full">
                   <thead>
                     <tr className="text-right text-sm text-gray-400 border-b border-gray-50">
                       <th className="pb-4 font-medium pr-2">الجهة</th>
                       <th className="pb-4 font-medium">النوع</th>
                       <th className="pb-4 font-medium">التاريخ</th>
                       <th className="pb-4 font-medium text-left pl-2">المبلغ</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {recentTransactions.map((tx) => (
                       <TransactionRow 
                         key={tx.id}
                         icon={tx.icon}
                         name={tx.store}
                         type={tx.type}
                         date={tx.date}
                         amount={tx.amount}
                         isPositive={tx.amount > 0}
                       />
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Left Column (Secondary Stats) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Spending Stats */}
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-white space-y-6">
              <h3 className="font-semibold text-lg text-gray-800">تحليل المصروفات</h3>
              <StatRow 
                icon={<ShoppingBag className="w-5 h-5 text-orange-500" />} 
                bg="bg-orange-100" 
                label="تسوق" 
                percent={65} 
                color="bg-orange-400" 
                amount="850 ر.س"
              />
              <StatRow 
                icon={<Utensils className="w-5 h-5 text-green-500" />} 
                bg="bg-green-100" 
                label="مطاعم" 
                percent={25} 
                color="bg-green-500" 
                amount="320 ر.س"
              />
              <StatRow 
                icon={<Car className="w-5 h-5 text-blue-500" />} 
                bg="bg-blue-100" 
                label="نقل" 
                percent={10} 
                color="bg-blue-500" 
                amount="80 ر.س"
              />
            </Card>

            {/* Subscriptions Widget */}
            <Card className="p-5 border-0 shadow-sm rounded-3xl bg-white">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-700">اشتراكاتي النشطة</h4>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => navigate('/subscriptions')}>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </Button>
              </div>
              <div className="space-y-3">
                 <SubscriptionItem name="بقالة الحي" date="ينتهي في 25/1" amount="500 ر.س" />
                 <SubscriptionItem name="نادي اللياقة" date="ينتهي في 01/2" amount="350 ر.س" />
              </div>
            </Card>

            {/* Promo Card */}
            <Card className="p-5 border-0 shadow-sm rounded-3xl bg-gray-900 text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-lg font-bold mb-2">ابدأ تجارتك اليوم</h4>
                 <p className="text-sm text-gray-300 mb-4">اطلب خدمة إدارة العملاء لإدارة عملائك وطلباتك.</p>
                 <Button size="sm" className="bg-white text-gray-900 hover:bg-gray-100 rounded-xl" onClick={() => navigate('/business/request')}>
                   طلب خدمة إدارة العملاء
                 </Button>
               </div>
               <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary rounded-full opacity-20 blur-xl"></div>
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
      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center gap-2 group"
    >
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>
        <p className="text-xs text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function StatRow({ icon, bg, label, percent, color, amount }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-sm font-medium text-gray-900">{amount}</span>
          </div>
          <Progress value={percent} className="h-2 bg-gray-100" indicatorClassName={color} />
        </div>
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
        <span className="font-medium text-gray-700">{name}</span>
      </td>
      <td className="py-4 text-gray-500 text-xs sm:text-sm">{type}</td>
      <td className="py-4 text-gray-400 text-xs sm:text-sm">{date}</td>
      <td className={`py-4 text-left font-bold pl-2 ${isPositive ? 'text-green-600' : 'text-gray-800'}`}>
        {isPositive ? '+' : ''}{amount} ر.س
      </td>
    </tr>
  );
}

function SubscriptionItem({ name, date, amount }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
          <Store className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-sm text-gray-800">{name}</p>
          <p className="text-xs text-gray-400">{date}</p>
        </div>
      </div>
      <span className="text-sm font-bold text-gray-700">{amount}</span>
    </div>
  );
}
