import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Wallet,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  FileText,
  HelpCircle,
  Plus,
  MessageCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../services/apiClient';

interface LedgerEntry {
  id: string;
  amount: number;
  currency: string;
  entry_type: 'payment' | 'debt';
  status: 'pending' | 'finalized' | 'completed' | 'disputed' | 'cancelled';
  reference: string | null;
  created_at: string;
  finalizes_at: string | null;
  customer_name?: string;
}

interface BalanceSummary {
  currency: string;
  balance: number;
  count: number;
}

export function CustomerWallet() {
  const navigate = useNavigate();
  const { storeId } = useParams<{ storeId: string }>();
  const { getAccessToken } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'all' | 'payments' | 'debts'>('all');
  const [loading, setLoading] = useState(true);
  
  // Wallet Data
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('SAR');
  const [storeName, setStoreName] = useState<string>('المتجر');
  
  // Ledger Entries
  const [allEntries, setAllEntries] = useState<LedgerEntry[]>([]);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);

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

  // Get entry label
  const getEntryLabel = (entry: LedgerEntry) => {
    if (entry.reference) return entry.reference;
    if (entry.entry_type === 'payment') return 'دفعة مستلمة';
    if (entry.entry_type === 'debt') return 'دين مسجل';
    return 'عملية مالية';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">قيد الانتظار</Badge>;
      case 'finalized':
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-50 border-emerald-200 text-emerald-700 text-xs">مثبت</Badge>;
      case 'disputed':
        return <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700 text-xs">متنازع عليه</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-700 text-xs">ملغي</Badge>;
      default:
        return null;
    }
  };

  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!storeId) return;
      
      try {
        setLoading(true);
        const token = await getAccessToken();
        
        // 1. Fetch balance summary
        const summaryResponse = await apiFetch<{ success: boolean; data: BalanceSummary[] }>(
          `/api/ledger/summary?businessId=${storeId}`,
          token
        );
        
        // Handle response structure: { success: true, data: [...] }
        const balances = summaryResponse.data || [];
        if (balances.length > 0) {
          // Find primary currency (SAR by default, or first available)
          const sarBalance = balances.find(b => b.currency === 'SAR');
          const primaryBalance = sarBalance || balances[0];
          
          setBalance(primaryBalance.balance || 0);
          setCurrency(primaryBalance.currency || 'SAR');
        } else {
          setBalance(0);
          setCurrency('SAR');
        }
        
        // 2. Fetch ledger entries
        const entriesResponse = await apiFetch<{ success: boolean; data: LedgerEntry[] }>(
          `/api/ledger/entries?businessId=${storeId}&limit=50`,
          token
        );
        
        // Handle response structure: { success: true, data: [...] }
        setAllEntries(entriesResponse.data || []);
        
        // 3. Fetch business name
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
          // Keep default name
        }
        
      } catch (error: any) {
        console.error('Failed to fetch wallet data:', error);
        if (error.message === 'UNAUTHORIZED') {
          toast.error('يرجى تسجيل الدخول');
          navigate('/login');
        } else {
          toast.error('فشل تحميل بيانات المحفظة');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [storeId, getAccessToken, navigate]);

  // Filter entries by tab
  useEffect(() => {
    if (activeTab === 'all') {
      setEntries(allEntries);
    } else if (activeTab === 'payments') {
      setEntries(allEntries.filter(e => e.entry_type === 'payment'));
    } else if (activeTab === 'debts') {
      setEntries(allEntries.filter(e => e.entry_type === 'debt'));
    }
  }, [activeTab, allEntries]);

  // Determine balance status
  const isPositive = balance >= 0;
  const balanceLabel = isPositive ? 'لك' : 'عليك';
  const balanceColor = isPositive ? 'text-emerald-600' : 'text-red-600';
  const balanceBgColor = isPositive ? 'bg-emerald-50' : 'bg-red-50';
  const balanceBorderColor = isPositive ? 'border-emerald-200' : 'border-red-200';

  if (loading) {
    return (
      <DashboardLayout title="المحفظة" subtitle="جاري التحميل...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      title={storeName} 
      subtitle="محفظتك المالية في هذا المتجر"
    >
      <div className="space-y-6">
        {/* Balance Card - Clear & Simple */}
        <Card className={`p-6 border-2 ${balanceBorderColor} rounded-3xl ${balanceBgColor} shadow-sm`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wallet className="w-5 h-5" />
              <span>الرصيد الحالي</span>
            </div>
            <Badge className={`${isPositive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
              {balanceLabel}
            </Badge>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <p className={`text-5xl font-black ${balanceColor} leading-none`}>
              {balance >= 0 ? '+' : ''}{balance.toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <span className="text-xl font-bold text-gray-600">{getCurrencySymbol(currency)}</span>
          </div>
          
          <p className="text-sm text-gray-500 mt-2">
            {isPositive 
              ? 'هذا المبلغ متاح لك في هذا المتجر' 
              : 'هذا المبلغ مستحق عليك لهذا المتجر'}
          </p>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 rounded-xl border border-gray-200 hover:bg-gray-50"
            onClick={() => navigate('/scan/store')}
          >
            <Plus className="ml-2 w-4 h-4" />
            <span className="font-medium">إضافة رصيد</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-12 rounded-xl border border-gray-200 hover:bg-gray-50"
            onClick={() => navigate(`/wallet/${storeId}/debt-requests`)}
          >
            <FileText className="ml-2 w-4 h-4" />
            <span className="font-medium">طلبات الدين</span>
          </Button>
        </div>

        {/* Tabs: All / Payments / Debts */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1 h-12">
            <TabsTrigger value="all" className="rounded-lg text-sm font-bold">
              جميع العمليات
            </TabsTrigger>
            <TabsTrigger value="payments" className="rounded-lg text-sm font-bold">
              المدفوعات
            </TabsTrigger>
            <TabsTrigger value="debts" className="rounded-lg text-sm font-bold">
              الديون
            </TabsTrigger>
          </TabsList>

          {/* All Entries Tab */}
          <TabsContent value="all" className="space-y-3">
            {entries.length > 0 ? (
              <div className="space-y-2">
                {entries.map((entry) => {
                  const isPositive = entry.amount >= 0;
                  const Icon = isPositive ? ArrowUp : ArrowDown;
                  
                  return (
                    <Card 
                      key={entry.id} 
                      className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                            isPositive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-gray-900 leading-tight mb-1">
                              {getEntryLabel(entry)}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                              {getStatusBadge(entry.status)}
                            </div>
                          </div>
                        </div>
                        <div className="text-left ml-4">
                          <div className={`font-black text-lg leading-none ${
                            isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isPositive ? '+' : ''}{entry.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{getCurrencySymbol(entry.currency)}</div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="p-8 text-center border border-gray-200 rounded-xl bg-white">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد عمليات</p>
                <p className="text-xs text-gray-400 mt-1">ستظهر عملياتك هنا بعد أول استخدام</p>
              </Card>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-3">
            {entries.length > 0 ? (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="p-4 border border-emerald-200 rounded-xl bg-emerald-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 border-2 border-emerald-200 flex items-center justify-center shrink-0">
                          <ArrowUp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 leading-tight mb-1">
                            {getEntryLabel(entry)}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                            {getStatusBadge(entry.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-left ml-4">
                        <div className="font-black text-lg leading-none text-emerald-600">
                          +{entry.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{getCurrencySymbol(entry.currency)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border border-gray-200 rounded-xl bg-white">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد مدفوعات</p>
              </Card>
            )}
          </TabsContent>

          {/* Debts Tab */}
          <TabsContent value="debts" className="space-y-3">
            {entries.length > 0 ? (
              <div className="space-y-2">
                {entries.map((entry) => (
                  <Card 
                    key={entry.id} 
                    className="p-4 border border-red-200 rounded-xl bg-red-50/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 border-2 border-red-200 flex items-center justify-center shrink-0">
                          <ArrowDown className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-gray-900 leading-tight mb-1">
                            {getEntryLabel(entry)}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs text-gray-500">{formatDate(entry.created_at)}</p>
                            {getStatusBadge(entry.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-left ml-4">
                        <div className="font-black text-lg leading-none text-red-600">
                          {entry.amount.toLocaleString('ar-SA', { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{getCurrencySymbol(entry.currency)}</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center border border-gray-200 rounded-xl bg-white">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <XCircle className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد ديون</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Help Card */}
        <Card className="p-4 border border-gray-200 rounded-xl bg-gray-50">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">معلومة مهمة:</strong> الرصيد الإيجابي يعني أن لديك رصيد متاح في هذا المتجر. الرصيد السلبي يعني أنك مدين للمتجر.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <FileText className="w-3 h-3 ml-1" />
                  كيف يعمل الرصيد؟
                </Button>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <HelpCircle className="w-3 h-3 ml-1" />
                  الأسئلة الشائعة
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
