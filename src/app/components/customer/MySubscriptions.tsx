import { useNavigate } from 'react-router-dom';
import { ChevronRight, Store, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';

export function MySubscriptions() {
  const navigate = useNavigate();

  // Mock data
  const subscriptions = [
    {
      id: '1',
      name: 'سوبر ماركت الرحمة',
      balance: 250,
      status: 'نقدي',
      lastTransaction: 'اليوم، 2:30 م',
    },
    {
      id: '2',
      name: 'مطعم البيك',
      balance: -45,
      status: 'آجل',
      lastTransaction: 'أمس، 7:15 م',
    },
    {
      id: '3',
      name: 'صيدلية النهدي',
      balance: 180,
      status: 'نقدي',
      lastTransaction: '2 يناير، 11:00 ص',
    },
  ];

  return (
    <DashboardLayout title="اشتراكاتي" subtitle="إدارة اشتراكاتك ورصيدك في المتاجر">
      <div className="space-y-6">
        {subscriptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onClick={() => navigate(`/wallet/${subscription.id}`)}
              />
            ))}
            
            {/* Add New Subscription Card */}
            <Card 
                className="p-6 border-2 border-dashed border-gray-200 rounded-3xl bg-transparent hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 min-h-[160px] group"
                onClick={() => navigate('/explore')}
            >
                <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                    <Plus className="w-6 h-6" />
                </div>
                <p className="font-medium text-gray-500 group-hover:text-primary">إضافة اشتراك جديد</p>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-0 shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Store className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد اشتراكات بعد</h3>
            <p className="text-gray-500 mb-6">اشترك في المتاجر المفضلة لديك لإدارة مدفوعاتك بسهولة</p>
            <Button onClick={() => navigate('/explore')} className="rounded-xl px-8">
              استعراض المتاجر
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function SubscriptionCard({ subscription, onClick }: {
  subscription: {
    id: string;
    name: string;
    balance: number;
    status: string;
    lastTransaction: string;
  };
  onClick: () => void;
}) {
  return (
    <Card
      className="p-6 border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Store className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-gray-900 line-clamp-1">{subscription.name}</h3>
                <span className="text-xs text-gray-400">{subscription.lastTransaction}</span>
            </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">الرصيد الحالي</p>
            <p className={`text-2xl font-bold ${subscription.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {subscription.balance >= 0 ? '+' : ''}{subscription.balance} <span className="text-sm font-medium text-gray-500">ر.س</span>
            </p>
          </div>
          <Badge variant={subscription.balance >= 0 ? 'default' : 'destructive'} className="rounded-lg px-3 py-1 font-normal">
              {subscription.status}
          </Badge>
      </div>
    </Card>
  );
}
