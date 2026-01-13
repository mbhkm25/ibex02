import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Users, 
  DollarSign, 
  TrendingUp, 
  QrCode, 
  Receipt, 
  Settings, 
  ShoppingCart,
  ArrowUp,
  ArrowDown,
  Loader2,
  FileText,
  Wallet
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DashboardLayout } from '../layout/DashboardLayout';
import { apiFetch } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';

interface BalanceSummary {
  currency: string;
  balance: number;
  count: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  balance?: number;
  status?: 'creditor' | 'debtor' | 'balanced';
}

interface LedgerEntry {
  id: string;
  amount: number;
  currency: string;
  entry_type: 'payment' | 'debt';
  status: string;
  reference: string | null;
  created_at: string;
  customer_name?: string;
}

export function MerchantDashboard() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { getAccessToken } = useAuth();
  const [showQR, setShowQR] = useState(false);

  const [storeName, setStoreName] = useState<string>('المتجر');
  const [loading, setLoading] = useState(true);
  
  // 3.1 Merchant Overview Stats
  const [stats, setStats] = useState({
    customersCount: 0,
    totalBalances: 0, // إجمالي أرصدة العملاء (موجب + سالب)
    totalDebts: 0,    // إجمالي الديون (سالب فقط)
    totalPayments: 0, // إجمالي المدفوعات (موجب فقط)
    currency: 'SAR'
  });
  
  // 3.2 Customers List
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  
  // Recent Transactions
  const [transactions, setTransactions] = useState<LedgerEntry[]>([]);

  // Get currency symbol
  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return 'ر.س';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get customer status
  const getCustomerStatus = (balance: number): 'creditor' | 'debtor' | 'balanced' => {
    if (balance > 0) return 'creditor';
    if (balance < 0) return 'debtor';
    return 'balanced';
  };

  const getStatusLabel = (status: 'creditor' | 'debtor' | 'balanced') => {
    switch (status) {
      case 'creditor': return 'دائن';
      case 'debtor': return 'مدين';
      case 'balanced': return 'متعادل';
    }
  };

  const getStatusColor = (status: 'creditor' | 'debtor' | 'balanced') => {
    switch (status) {
      case 'creditor': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'debtor': return 'bg-red-100 text-red-700 border-red-200';
      case 'balanced': return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Fetch Overview Stats (3.1)
  useEffect(() => {
    const fetchOverview = async () => {
      if (!storeId) return;
      
      try {
        setLoading(true);
        const token = await getAccessToken();
        
        // 1. Fetch business name
        try {
          const businessResponse = await apiFetch<{ success: boolean; data: { name: string } }>(
            `/api/business/${storeId}`,
            token
          );
          if (businessResponse.success && businessResponse.data) {
            setStoreName(businessResponse.data.name);
          }
        } catch (err) {
          console.warn('Failed to fetch business name:', err);
        }
        
        // 2. Fetch total ledger summary (all customers) - بدون customerId للحصول على إجمالي
        const summaryResponse = await apiFetch<{ success: boolean; data: BalanceSummary[] }>(
          `/api/ledger/summary?businessId=${storeId}`,
          token
        );
        
        // Handle response structure: { success: true, data: [...] }
        const balances = summaryResponse.data || [];
        const sarBalance = balances.find(b => b.currency === 'SAR');
        const primaryBalance = sarBalance || balances[0];
        const primaryCurrency = primaryBalance?.currency || 'SAR';
        
        // Calculate totals from ledger entries
        const entriesResponse = await apiFetch<{ success: boolean; data: LedgerEntry[] }>(
          `/api/ledger/entries?businessId=${storeId}&limit=1000`,
          token
        );
        
        // Handle response structure: { success: true, data: [...] }
        const allEntries = entriesResponse.data || [];
        const finalizedEntries = allEntries.filter(e => 
          e.status === 'finalized' || e.status === 'completed'
        );
        
        // Calculate totals (فقط للعملة الأساسية أو جميع العملات)
        // إجمالي الأرصدة = SUM(amount) لجميع القيود المثبتة
        const totalBalances = finalizedEntries.reduce((sum, e) => sum + e.amount, 0);
        
        // إجمالي الديون = SUM(ABS(amount)) للديون فقط
        const totalDebts = finalizedEntries
          .filter(e => e.entry_type === 'debt')
          .reduce((sum, e) => sum + Math.abs(e.amount), 0);
        
        // إجمالي المدفوعات = SUM(amount) للمدفوعات فقط (موجب)
        const totalPayments = finalizedEntries
          .filter(e => e.entry_type === 'payment')
          .reduce((sum, e) => sum + e.amount, 0);
        
        // Get customers count
        const customersResponse = await apiFetch<{ success: boolean; data: any[] }>(
          `/api/customers?businessId=${storeId}&limit=1000`,
          token
        );
        // Handle response structure: { success: true, data: [...] }
        const customersCount = customersResponse.data?.length || 0;
        
        setStats({
          customersCount,
          totalBalances,
          totalDebts,
          totalPayments,
          currency: primaryCurrency
        });
        
        // 3. Fetch recent transactions
        const recentEntriesResponse = await apiFetch<{ success: boolean; data: LedgerEntry[] }>(
          `/api/ledger/entries?businessId=${storeId}&limit=10`,
          token
        );
        // Handle response structure: { success: true, data: [...] }
        setTransactions(recentEntriesResponse.data || []);
        
      } catch (error: any) {
        console.error('Failed to fetch merchant overview:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [storeId, getAccessToken]);

  // Fetch Customers List with Balances (3.2)
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!storeId) return;
      
      try {
        setLoadingCustomers(true);
        const token = await getAccessToken();
        
        // 1. Fetch customers list
        const customersResponse = await apiFetch<{ success: boolean; data: Customer[] }>(
          `/api/customers?businessId=${storeId}&limit=100`,
          token
        );
        
        const customersList = customersResponse.data || [];
        
        // 2. Fetch balance for each customer
        const customersWithBalances = await Promise.all(
          customersList.map(async (customer) => {
            try {
              const summaryResponse = await apiFetch<{ success: boolean; data: BalanceSummary[] }>(
                `/api/ledger/summary?businessId=${storeId}&customerId=${customer.id}`,
                token
              );
              
              const balances = summaryResponse.data || [];
              const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);
              
              return {
                ...customer,
                balance: totalBalance,
                status: getCustomerStatus(totalBalance)
              };
            } catch (err) {
              console.error(`Failed to fetch balance for customer ${customer.id}:`, err);
              return {
                ...customer,
                balance: 0,
                status: 'balanced' as const
              };
            }
          })
        );
        
        setCustomers(customersWithBalances);
        
      } catch (error: any) {
        console.error('Failed to fetch customers:', error);
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [storeId, getAccessToken]);

  if (loading) {
    return (
      <DashboardLayout title="لوحة التاجر" subtitle="جاري التحميل...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={storeName} 
      subtitle="لوحة التحكم المالية"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-end">
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700">
                <QrCode className="w-5 h-5" />
                عرض رمز المتجر
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-center">رمز QR الخاص بالمتجر</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4 p-4">
                <div className="w-64 h-64 bg-muted rounded-2xl flex items-center justify-center">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  اطلب من العملاء مسح هذا الرمز للاشتراك في متجرك
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 3.1 Merchant Overview - Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            icon={<Users className="w-5 h-5" />}
            title="عدد العملاء"
            value={stats.customersCount.toString()}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard
            icon={<Wallet className="w-5 h-5" />}
            title="إجمالي الأرصدة"
            value={`${stats.totalBalances >= 0 ? '+' : ''}${stats.totalBalances.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ${getCurrencySymbol(stats.currency)}`}
            color={stats.totalBalances >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"}
            subtitle="صافي رصيد جميع العملاء"
          />
          <StatsCard
            icon={<ArrowDown className="w-5 h-5" />}
            title="إجمالي الديون"
            value={`${stats.totalDebts.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ${getCurrencySymbol(stats.currency)}`}
            color="bg-red-100 text-red-600"
            subtitle="ديون العملاء عليهم"
          />
          <StatsCard
            icon={<ArrowUp className="w-5 h-5" />}
            title="إجمالي المدفوعات"
            value={`${stats.totalPayments.toLocaleString('ar-SA', { minimumFractionDigits: 2 })} ${getCurrencySymbol(stats.currency)}`}
            color="bg-emerald-100 text-emerald-600"
            subtitle="مدفوعات العملاء"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-12 rounded-xl bg-white border border-gray-100 p-1 mb-6">
            <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              العملاء ({customers.length})
            </TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              العمليات الحديثة
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">
              الإعدادات
            </TabsTrigger>
          </TabsList>

          {/* 3.2 Customers List Tab */}
          <TabsContent value="customers" className="space-y-3">
            <Card className="p-6 border border-gray-200 rounded-3xl bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-gray-900">قائمة العملاء</h3>
                <Badge variant="outline" className="text-xs">
                  {customers.length} عميل
                </Badge>
              </div>
              
              {loadingCustomers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : customers.length > 0 ? (
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer border border-gray-100"
                      onClick={() => navigate(`/merchant/${storeId}/customer/${customer.id}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          customer.status === 'creditor' 
                            ? 'bg-emerald-100 text-emerald-600' 
                            : customer.status === 'debtor'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {customer.status === 'creditor' ? (
                            <ArrowUp className="w-5 h-5" />
                          ) : customer.status === 'debtor' ? (
                            <ArrowDown className="w-5 h-5" />
                          ) : (
                            <Users className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm mb-1">{customer.name}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-500">{customer.phone}</p>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(customer.status!)}`}>
                              {getStatusLabel(customer.status!)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <div className="text-left">
                          <div className={`font-black text-base leading-none ${
                            customer.balance! >= 0 ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {customer.balance! >= 0 ? '+' : ''}{customer.balance!.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{getCurrencySymbol(stats.currency)}</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/merchant/${storeId}/customer/${customer.id}`);
                          }}
                        >
                          <FileText className="w-4 h-4 ml-1" />
                          <span className="text-xs font-bold">كشف الحساب</span>
                        </Button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">لا يوجد عملاء بعد</p>
                  <p className="text-xs text-gray-400 mt-1">سيظهر العملاء هنا بعد أول اشتراك</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-3">
            <Card className="p-6 border border-gray-200 rounded-3xl bg-white shadow-sm">
              <h3 className="font-bold text-lg text-gray-900 mb-4">آخر العمليات</h3>
              {transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.map((transaction) => {
                    const isPositive = transaction.amount >= 0;
                    const Icon = isPositive ? ArrowUp : ArrowDown;
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-gray-100"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                            isPositive 
                              ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-200' 
                              : 'bg-red-100 text-red-600 border-2 border-red-200'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 mb-1">
                              {transaction.customer_name || 'عميل'}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-gray-500">{formatDate(transaction.created_at)}</p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.entry_type === 'payment' ? 'دفعة' : 'دين'}
                              </Badge>
                              {transaction.status === 'pending' && (
                                <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">
                                  قيد الانتظار
                                </Badge>
                              )}
                            </div>
                            {transaction.reference && (
                              <p className="text-xs text-gray-400 mt-1">{transaction.reference}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-left ml-4">
                          <div className={`font-black text-lg leading-none ${
                            isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isPositive ? '+' : ''}{transaction.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{getCurrencySymbol(transaction.currency)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">لا توجد عمليات</p>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-white">
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-blue-600" 
                  size="lg"
                  onClick={() => navigate(`/business/${storeId}/manage`)}
                >
                  <Settings className="ml-2 w-5 h-5" />
                  إعدادات المتجر
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start h-14 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-blue-600" 
                  size="lg"
                  onClick={() => navigate(`/business/${storeId}/qr`)}
                >
                  <QrCode className="ml-2 w-5 h-5" />
                  إدارة رموز QR
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ 
  icon, 
  title, 
  value, 
  color,
  subtitle 
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
  subtitle?: string;
}) {
  return (
    <Card className="p-5 border border-gray-200 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
      <p className="text-2xl font-black text-gray-900 leading-none">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </Card>
  );
}
