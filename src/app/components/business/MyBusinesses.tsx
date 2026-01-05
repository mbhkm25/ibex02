import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  ShoppingBag, 
  Wallet,
  ChevronRight,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';

interface Business {
  id: string;
  name: string;
  logo: string;
  status: 'approved' | 'pending' | 'rejected';
  type: 'products' | 'services' | 'both';
  customersCount: number;
  ordersCount: number;
  totalBalance: number;
  approvedDate?: string;
  revenue?: number;
  growth?: number;
}

export function MyBusinesses() {
  const navigate = useNavigate();

  // Mock data - Approved businesses
  const businesses: Business[] = [
    {
      id: '1',
      name: 'سوبر ماركت الرحمة',
      logo: '🏪',
      status: 'approved',
      type: 'both',
      customersCount: 245,
      ordersCount: 1234,
      totalBalance: 125000,
      approvedDate: '15 يناير 2024',
      revenue: 45000,
      growth: 12.5
    },
    {
      id: '2',
      name: 'مطعم البيك',
      logo: '🍔',
      status: 'approved',
      type: 'both',
      customersCount: 189,
      ordersCount: 856,
      totalBalance: 89000,
      approvedDate: '20 ديسمبر 2023',
      revenue: 32000,
      growth: 8.3
    },
    {
      id: '3',
      name: 'صيدلية النهدي',
      logo: '💊',
      status: 'pending',
      type: 'products',
      customersCount: 0,
      ordersCount: 0,
      totalBalance: 0
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] px-2 py-0.5">
            <CheckCircle className="w-3 h-3 ml-1" />
            معتمد
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] px-2 py-0.5">
            <Clock className="w-3 h-3 ml-1" />
            قيد المراجعة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-50 text-red-700 border border-red-200 font-bold text-[10px] px-2 py-0.5">
            <XCircle className="w-3 h-3 ml-1" />
            مرفوض
          </Badge>
        );
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'products':
        return 'منتجات';
      case 'services':
        return 'خدمات';
      case 'both':
        return 'منتجات وخدمات';
      default:
        return '';
    }
  };

  const handleNavigate = (businessId: string) => {
    navigate(`/business/${businessId}/manage`);
  };

  return (
    <DashboardLayout 
      title="أعمالي" 
      subtitle="إدارة أعمالك المعتمدة"
    >
      <div className="space-y-3">
        {businesses.length === 0 ? (
          <Card className="p-8 border-2 border-gray-200 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">لا توجد أعمال معتمدة</h3>
            <p className="text-sm text-gray-600 mb-4">ابدأ بطلب خدمة إدارة العملاء</p>
            <Button
              onClick={() => navigate('/business/request')}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 px-5 font-bold"
            >
              طلب خدمة إدارة العملاء
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {businesses.map((business) => (
              <Card 
                key={business.id} 
                className="p-4 border-2 border-gray-200 rounded-xl bg-white hover:border-gray-300 hover:shadow-md transition-all overflow-hidden"
              >
                {business.status === 'approved' ? (
                  <div className="space-y-3">
                    {/* Header - Compact */}
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-2xl shrink-0 shadow-sm border border-slate-800">
                          {business.logo}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-base font-black text-gray-900 truncate">{business.name}</h3>
                            {getStatusBadge(business.status)}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-bold text-gray-500 uppercase">{getTypeLabel(business.type)}</span>
                            {business.approvedDate && (
                              <>
                                <span className="text-[10px] text-gray-400">•</span>
                                <span className="text-[10px] text-gray-500">منذ {business.approvedDate}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleNavigate(business.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-lg h-9 px-4 font-bold text-xs shrink-0"
                      >
                        إدارة
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      </Button>
                    </div>

                    {/* Stats Grid - Dense */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Users className="w-3.5 h-3.5 text-blue-700" />
                          <span className="text-[10px] font-bold text-blue-700 uppercase">عملاء</span>
                        </div>
                        <div className="text-lg font-black text-blue-900">{business.customersCount}</div>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50">
                        <div className="flex items-center gap-1.5 mb-1">
                          <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                          <span className="text-[10px] font-bold text-emerald-700 uppercase">طلبات</span>
                        </div>
                        <div className="text-lg font-black text-emerald-900">{business.ordersCount}</div>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border border-amber-200/50">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Wallet className="w-3.5 h-3.5 text-amber-700" />
                          <span className="text-[10px] font-bold text-amber-700 uppercase">رصيد</span>
                        </div>
                        <div className="text-lg font-black text-amber-900">
                          {(business.totalBalance / 1000).toFixed(0)}K
                        </div>
                      </div>
                      <div className="p-2.5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
                        <div className="flex items-center gap-1.5 mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-purple-700" />
                          <span className="text-[10px] font-bold text-purple-700 uppercase">نمو</span>
                        </div>
                        <div className="text-lg font-black text-purple-900">
                          {business.growth ? `+${business.growth}%` : '-'}
                        </div>
                      </div>
                    </div>

                    {/* Revenue Bar */}
                    {business.revenue && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-gray-600">الإيرادات الشهرية</span>
                          <span className="text-xs font-black text-gray-900">{business.revenue.toLocaleString()} ر.س</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                            style={{ width: `${Math.min((business.revenue / 50000) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
                        {business.logo}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="text-base font-black text-gray-900">{business.name}</h3>
                          {getStatusBadge(business.status)}
                        </div>
                        <p className="text-xs text-gray-500">{getTypeLabel(business.type)}</p>
                      </div>
                    </div>
                    {business.status === 'pending' && (
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-gray-600 mb-0.5">قيد المراجعة</p>
                        <p className="text-[10px] text-gray-500">سيتم إشعارك عند الموافقة</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
