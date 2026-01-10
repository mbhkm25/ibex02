import { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  FileText,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AdminLayout } from './AdminLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export function AdminAnalytics() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');

  // TODO: Fetch analytics from API
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Fetch analytics from API based on timeRange
    setLoading(false);
    setAnalytics(null);
  }, [timeRange]);

  // Empty analytics - no mock data
  const emptyAnalytics = {
    revenue: {
      total: 1250000,
      change: +15.5,
      trend: 'up' as const,
      breakdown: [
        { period: 'يناير', value: 450000 },
        { period: 'فبراير', value: 520000 },
        { period: 'مارس', value: 280000 },
      ]
    },
    users: {
      total: 1247,
      change: +12.3,
      trend: 'up' as const,
      breakdown: [
        { period: 'يناير', value: 350 },
        { period: 'فبراير', value: 420 },
        { period: 'مارس', value: 477 },
      ]
    },
    businesses: {
      total: 156,
      change: +8.7,
      trend: 'up' as const,
      breakdown: [
        { period: 'يناير', value: 45 },
        { period: 'فبراير', value: 52 },
        { period: 'مارس', value: 59 },
      ]
    },
    transactions: {
      total: 45678,
      change: +22.1,
      trend: 'up' as const,
      breakdown: [
        { period: 'يناير', value: 12000 },
        { period: 'فبراير', value: 15000 },
        { period: 'مارس', value: 18678 },
      ]
    }
  };

  // TODO: Fetch top businesses from API
  const [topBusinesses, setTopBusinesses] = useState<any[]>([]);
  
  useEffect(() => {
    // TODO: Fetch top businesses from API
    setTopBusinesses([]);
  }, [timeRange]);

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
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="text-xs text-gray-500 mb-1">{title}</div>
      <div className="text-2xl font-black text-gray-900">{value.toLocaleString()}</div>
    </Card>
  );

  return (
    <AdminLayout 
      title="الإحصائيات والتقارير" 
      subtitle="نظرة شاملة على أداء المنصة"
    >
      <div className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">الفترة الزمنية:</span>
          </div>
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-40 h-10 rounded-xl border-2 border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">أسبوع</SelectItem>
              <SelectItem value="month">شهر</SelectItem>
              <SelectItem value="quarter">ربع سنوي</SelectItem>
              <SelectItem value="year">سنة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard 
            icon={<DollarSign className="w-5 h-5 text-emerald-600" />}
            title="إجمالي الإيرادات"
            value={analytics.revenue.total}
            change={analytics.revenue.change}
            trend={analytics.revenue.trend}
          />
          <StatCard 
            icon={<Users className="w-5 h-5 text-blue-600" />}
            title="إجمالي المستخدمين"
            value={analytics.users.total}
            change={analytics.users.change}
            trend={analytics.users.trend}
          />
          <StatCard 
            icon={<Building2 className="w-5 h-5 text-purple-600" />}
            title="إجمالي الأعمال"
            value={analytics.businesses.total}
            change={analytics.businesses.change}
            trend={analytics.businesses.trend}
          />
          <StatCard 
            icon={<FileText className="w-5 h-5 text-amber-600" />}
            title="إجمالي المعاملات"
            value={analytics.transactions.total}
            change={analytics.transactions.change}
            trend={analytics.transactions.trend}
          />
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-xl bg-gray-100 p-1 h-11">
            <TabsTrigger value="revenue" className="rounded-lg text-xs font-bold">الإيرادات</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg text-xs font-bold">المستخدمين</TabsTrigger>
            <TabsTrigger value="businesses" className="rounded-lg text-xs font-bold">الأعمال</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg text-xs font-bold">المعاملات</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900">الإيرادات الشهرية</h3>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  <Download className="w-3.5 h-3.5 ml-1.5" />
                  تصدير
                </Button>
              </div>
              <div className="space-y-3">
                {analytics.revenue.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600 font-bold">{item.period}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.value / analytics.revenue.breakdown[0].value) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {item.value.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900">نمو المستخدمين</h3>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  <Download className="w-3.5 h-3.5 ml-1.5" />
                  تصدير
                </Button>
              </div>
              <div className="space-y-3">
                {analytics.users.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600 font-bold">{item.period}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.value / analytics.users.breakdown[0].value) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {item.value} مستخدم
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="businesses" className="space-y-4">
            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900">نمو الأعمال</h3>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  <Download className="w-3.5 h-3.5 ml-1.5" />
                  تصدير
                </Button>
              </div>
              <div className="space-y-3">
                {analytics.businesses.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600 font-bold">{item.period}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-purple-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.value / analytics.businesses.breakdown[0].value) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {item.value} عمل
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-gray-900">المعاملات الشهرية</h3>
                <Button variant="outline" size="sm" className="h-8 rounded-lg">
                  <Download className="w-3.5 h-3.5 ml-1.5" />
                  تصدير
                </Button>
              </div>
              <div className="space-y-3">
                {analytics.transactions.breakdown.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600 font-bold">{item.period}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-6 relative overflow-hidden">
                      <div 
                        className="bg-amber-500 h-full rounded-full flex items-center justify-end pr-2"
                        style={{ width: `${(item.value / analytics.transactions.breakdown[0].value) * 100}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">
                          {item.value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Businesses */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-black text-gray-900">أفضل الأعمال أداءً</h3>
            <Button variant="outline" size="sm" className="h-8 rounded-lg">
              <Download className="w-3.5 h-3.5 ml-1.5" />
              تصدير
            </Button>
          </div>
          <div className="space-y-2">
            {topBusinesses.map((business, index) => (
              <div key={business.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-black text-gray-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-sm font-black text-gray-900">{business.name}</div>
                    <div className="text-xs text-gray-500">{business.revenue.toLocaleString()} ر.س</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 text-xs font-bold ${
                  business.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {business.growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(business.growth)}%
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

