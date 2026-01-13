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
  FileText,
  Lock
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { toast } from 'sonner';
import { apiFetch } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';

interface LedgerEntry {
  id: string;
  amount: number;
  currency: string;
  entry_type: 'payment' | 'debt';
  status: 'pending' | 'finalized' | 'completed' | 'disputed' | 'cancelled';
  reference: string | null;
  created_at: string;
  finalizes_at: string | null;
}

interface BalanceSummary {
  currency: string;
  balance: number;
  count: number;
}

export function CustomerProfile() {
  const navigate = useNavigate();
  const { storeId, customerId } = useParams<{ storeId: string; customerId: string }>();
  const { getAccessToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>({
    name: 'جاري التحميل...',
    phone: '',
    balance: 0,
    currency: 'SAR'
  });
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
      year: 'numeric',
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

  useEffect(() => {
    const fetchData = async () => {
      if (!storeId || !customerId) return;
      
      try {
        setLoading(true);
        const token = await getAccessToken();
        
        // 1. Fetch customer details
        const customersResponse = await apiFetch<{ success: boolean; data: any[] }>(
          `/api/customers?businessId=${storeId}&limit=1000`,
          token
        );
        // Handle response structure: { success: true, data: [...] }
        const customersList = customersResponse.data || [];
        const customerData = customersList.find((c: any) => c.id === customerId);
        
        // 2. Fetch balance summary
        const summaryResponse = await apiFetch<{ success: boolean; data: BalanceSummary[] }>(
          `/api/ledger/summary?businessId=${storeId}&customerId=${customerId}`,
          token
        );
        
        // Handle response structure: { success: true, data: [...] }
        const balances = summaryResponse.data || [];
        const totalBalance = balances.reduce((sum, b) => sum + (b.balance || 0), 0);
        const primaryCurrency = balances.find(b => b.currency === 'SAR')?.currency || balances[0]?.currency || 'SAR';
        
        // 3. Fetch ledger entries (full history)
        const entriesResponse = await apiFetch<{ success: boolean; data: LedgerEntry[] }>(
          `/api/ledger/entries?businessId=${storeId}&customerId=${customerId}&limit=1000`,
          token
        );
        
        // Handle response structure: { success: true, data: [...] }
        setCustomer({
          name: customerData?.name || 'عميل',
          phone: customerData?.phone || '',
          balance: totalBalance,
          currency: primaryCurrency
        });
        
        setEntries(entriesResponse.data || []);
        
      } catch (e: any) {
        console.error('Failed to fetch customer profile:', e);
        toast.error('فشل تحميل بيانات العميل');
        if (e.message === 'UNAUTHORIZED') {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [storeId, customerId, getAccessToken, navigate]);

  if (loading) {
    return (
      <DashboardLayout title="كشف حساب العميل" subtitle="جاري التحميل...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </DashboardLayout>
    );
  }

  const isPositive = customer.balance >= 0;
  const balanceLabel = isPositive ? 'دائن' : 'مدين';

  return (
    <DashboardLayout 
      title={customer.name} 
      subtitle="كشف الحساب الكامل - للعرض فقط"
    >
      <div className="space-y-6">
        {/* Read-Only Notice */}
        <Card className="p-4 border-2 border-blue-200 rounded-xl bg-blue-50">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blue-900">كشف حساب للعرض فقط</p>
              <p className="text-xs text-blue-700 mt-0.5">
                هذا السجل غير قابل للتعديل أو الحذف. جميع القيود المالية ثابتة ومؤمنة.
              </p>
            </div>
          </div>
        </Card>

        {/* Balance Card */}
        <Card className={`p-6 border-2 rounded-3xl shadow-sm ${
          isPositive 
            ? 'bg-emerald-50 border-emerald-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wallet className="w-5 h-5" />
              <span>الرصيد الحالي</span>
            </div>
            <Badge className={`${
              isPositive 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {balanceLabel}
            </Badge>
          </div>
          
          <div className="flex items-baseline gap-2 mb-2">
            <p className={`text-5xl font-black leading-none ${
              isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {customer.balance >= 0 ? '+' : ''}{customer.balance.toLocaleString('ar-SA', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}
            </p>
            <span className="text-xl font-bold text-gray-600">
              {getCurrencySymbol(customer.currency)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            {isPositive 
              ? 'العميل لديه رصيد متاح في هذا المتجر' 
              : 'العميل مدين لهذا المتجر'}
          </p>
        </Card>

        {/* Customer Info */}
        <Card className="p-4 border border-gray-200 rounded-xl bg-white">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 mb-1">الاسم</p>
              <p className="font-bold text-gray-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">الهاتف</p>
              <p className="font-bold text-gray-900" dir="ltr">{customer.phone}</p>
            </div>
          </div>
        </Card>

        {/* Ledger Entries - Read-Only */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">سجل العمليات المالي</h3>
            <Badge variant="outline" className="text-xs">
              {entries.length} عملية
            </Badge>
          </div>

          {entries.length > 0 ? (
            <div className="space-y-2">
              {entries.map((entry) => {
                const isPositive = entry.amount >= 0;
                const Icon = isPositive ? ArrowUp : ArrowDown;
                
                return (
                  <Card 
                    key={entry.id} 
                    className="p-4 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors"
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
                            <Badge variant="outline" className="text-xs">
                              {entry.entry_type === 'payment' ? 'دفعة' : 'دين'}
                            </Badge>
                            {getStatusBadge(entry.status)}
                            {entry.status === 'pending' && entry.finalizes_at && (
                              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 text-xs">
                                يثبت: {formatDate(entry.finalizes_at)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-left ml-4">
                        <div className={`font-black text-lg leading-none ${
                          isPositive ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {isPositive ? '+' : ''}{entry.amount.toLocaleString('ar-SA', { 
                            minimumFractionDigits: 2 
                          })}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getCurrencySymbol(entry.currency)}
                        </div>
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
              <p className="text-gray-500 font-medium">لا توجد عمليات مسجلة</p>
              <p className="text-xs text-gray-400 mt-1">ستظهر العمليات هنا بعد أول عملية مالية</p>
            </Card>
          )}
        </div>

        {/* Back Button */}
        <div className="pt-4">
          <Button
            variant="outline"
            className="w-full rounded-xl"
            onClick={() => navigate(`/merchant/${storeId}`)}
          >
            <ChevronRight className="w-4 h-4 ml-2" />
            العودة إلى لوحة التاجر
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
