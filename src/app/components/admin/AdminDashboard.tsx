import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building2, 
  TrendingUp, 
  DollarSign,
  FileText,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AdminLayout } from './AdminLayout';

export function AdminDashboard() {
  const navigate = useNavigate();

  // Mock Data
  const stats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalBusinesses: 156,
    activeBusinesses: 134,
    pendingRequests: 12,
    totalTransactions: 45678,
    totalRevenue: 1250000,
    todayTransactions: 234
  };

  const recentActivities = [
    { id: '1', type: 'user', action: 'تسجيل مستخدم جديد', user: 'أحمد محمد', time: 'منذ 5 دقائق', status: 'success' },
    { id: '2', type: 'business', action: 'طلب موافقة متجر جديد', business: 'سوبر ماركت النور', time: 'منذ 15 دقيقة', status: 'pending' },
    { id: '3', type: 'request', action: 'طلب خدمة إدارة العملاء', business: 'مطعم البيك', time: 'منذ ساعة', status: 'pending' },
    { id: '4', type: 'transaction', action: 'معاملة كبيرة', amount: '5,000 ر.س', time: 'منذ ساعتين', status: 'success' },
  ];

  const pendingItems = [
    { id: '1', type: 'business', title: 'طلب موافقة متجر جديد', subtitle: 'سوبر ماركت النور', count: 3 },
    { id: '2', type: 'service', title: 'طلبات خدمة إدارة العملاء', subtitle: 'في انتظار المراجعة', count: 5 },
    { id: '3', type: 'user', title: 'حسابات معلقة', subtitle: 'تحتاج مراجعة', count: 4 },
  ];

  const StatCard = ({ icon, title, value, change, trend }: any) => (
    <Card className="p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        {change && (
          <div className={`flex items-center gap-1 text-xs font-bold ${
            trend === 'up' ? 'text-emerald-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-black text-gray-900">{value.toLocaleString()}</div>
    </Card>
  );

  return (
    <AdminLayout 
      title="لوحة التحكم" 
      subtitle="نظرة عامة على المنصة"
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            icon={<Users className="w-5 h-5 text-blue-600" />}
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            change="+12%"
            trend="up"
          />
          <StatCard 
            icon={<Building2 className="w-5 h-5 text-purple-600" />}
            title="المتاجر والأعمال"
            value={stats.totalBusinesses}
            change="+5%"
            trend="up"
          />
          <StatCard 
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            title="طلبات قيد المراجعة"
            value={stats.pendingRequests}
          />
          <StatCard 
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            title="إجمالي المعاملات"
            value={stats.totalTransactions}
            change="+8%"
            trend="up"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {pendingItems.map((item) => (
            <Card 
              key={item.id}
              className="p-4 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 transition-colors"
              onClick={() => {
                if (item.type === 'business') navigate('/admin/businesses');
                else if (item.type === 'service') navigate('/admin/service-requests');
                else navigate('/admin/users');
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-sm font-black text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.subtitle}</p>
                </div>
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs font-bold">
                  {item.count}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Activities */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-gray-900">النشاطات الأخيرة</h3>
            <Button variant="ghost" size="sm" className="text-xs">
              عرض الكل
            </Button>
          </div>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activity.status === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  activity.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {activity.status === 'success' ? <CheckCircle className="w-4 h-4" /> :
                   activity.status === 'pending' ? <Clock className="w-4 h-4" /> :
                   <XCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-gray-900 mb-0.5">{activity.action}</p>
                  <p className="text-xs text-gray-500">
                    {activity.user || activity.business || activity.amount}
                  </p>
                </div>
                <div className="text-xs text-gray-400 shrink-0">{activity.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

