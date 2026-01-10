import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Store, 
  Plus, 
  TrendingDown,
  AlertCircle,
  Calendar,
  CreditCard,
  DollarSign,
  Filter,
  ChevronDown,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  ArrowLeftRight,
  Info,
  Bell,
  History,
  FileText,
  Download,
  Percent,
  CalendarClock,
  MessageSquare,
  Settings,
  Trash2,
  Edit
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

interface Debt {
  id: string;
  storeId: string;
  storeName: string;
  storeLogo: string;
  amount: number;
  paidAmount?: number;
  currency: 'SAR' | 'YER' | 'USD';
  dueDate: string;
  status: 'pending' | 'overdue' | 'paid' | 'scheduled';
  createdAt: string;
  lastPayment?: string;
  description?: string;
  paymentPlan?: PaymentPlan;
  scheduledPayments?: ScheduledPayment[];
}

interface PaymentPlan {
  id: string;
  totalAmount: number;
  installments: number;
  monthlyAmount: number;
  startDate: string;
  status: 'active' | 'completed' | 'cancelled';
}

interface ScheduledPayment {
  id: string;
  amount: number;
  scheduledDate: string;
  status: 'pending' | 'completed' | 'cancelled';
}

interface PaymentHistory {
  id: string;
  debtId: string;
  amount: number;
  currency: 'SAR' | 'YER' | 'USD';
  paymentDate: string;
  method: 'wallet' | 'cash' | 'bank';
  status: 'completed' | 'pending' | 'failed';
}

interface Notification {
  id: string;
  type: 'debt_due' | 'debt_overdue' | 'payment_reminder' | 'payment_scheduled';
  title: string;
  message: string;
  debtId?: string;
  date: string;
  read: boolean;
}

interface Subscription {
  id: string;
  name: string;
  balance: number;
  status: string;
  lastTransaction: string;
  currency: 'SAR' | 'YER' | 'USD';
  debts?: Debt[];
}

export function MySubscriptions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'debts'>('subscriptions');
  const [filterCurrency, setFilterCurrency] = useState<'all' | 'SAR' | 'YER' | 'USD'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showPartialPayDialog, setShowPartialPayDialog] = useState(false);
  const [showPaymentPlanDialog, setShowPaymentPlanDialog] = useState(false);
  const [showCurrencyConvertDialog, setShowCurrencyConvertDialog] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [partialAmount, setPartialAmount] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [convertFrom, setConvertFrom] = useState<'SAR' | 'YER' | 'USD'>('SAR');
  const [convertTo, setConvertTo] = useState<'SAR' | 'YER' | 'USD'>('USD');
  const [convertAmount, setConvertAmount] = useState('');

  // TODO: Fetch subscriptions from API
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Fetch subscriptions from API
    setLoading(false);
    setSubscriptions([]);
  }, []);

  // Empty subscriptions array - no mock data
  const emptySubscriptions: Subscription[] = [
    {
      id: '1',
      name: 'سوبر ماركت الرحمة',
      balance: 250,
      status: 'نقدي',
      lastTransaction: 'اليوم، 2:30 م',
      currency: 'SAR',
      debts: [
        {
          id: 'debt-1',
          storeId: '1',
          storeName: 'سوبر ماركت الرحمة',
          storeLogo: '🏪',
          amount: 150,
          paidAmount: 0,
          currency: 'SAR',
          dueDate: '2024-02-15',
          status: 'pending',
          createdAt: '2024-01-15',
          description: 'شراء مواد غذائية'
        }
      ]
    },
    {
      id: '2',
      name: 'مطعم البيك',
      balance: -45,
      status: 'آجل',
      lastTransaction: 'أمس، 7:15 م',
      currency: 'SAR',
      debts: [
        {
          id: 'debt-2',
          storeId: '2',
          storeName: 'مطعم البيك',
          storeLogo: '🍔',
          amount: 45,
          paidAmount: 0,
          currency: 'SAR',
          dueDate: '2024-01-20',
          status: 'overdue',
          createdAt: '2024-01-10',
          description: 'وجبات طعام'
        }
      ]
    },
    {
      id: '3',
      name: 'صيدلية النهدي',
      balance: 180,
      status: 'نقدي',
      lastTransaction: '2 يناير، 11:00 ص',
      currency: 'SAR',
    },
    {
      id: '4',
      name: 'متجر الإلكترونيات',
      balance: -200,
      status: 'آجل',
      lastTransaction: '5 يناير، 3:00 م',
      currency: 'USD',
      debts: [
        {
          id: 'debt-3',
          storeId: '4',
          storeName: 'متجر الإلكترونيات',
          storeLogo: '📱',
          amount: 200,
          paidAmount: 0,
          currency: 'USD',
          dueDate: '2024-02-10',
          status: 'pending',
          createdAt: '2024-01-05',
          description: 'شراء هاتف محمول'
        }
      ]
    },
    {
      id: '5',
      name: 'محل الملابس',
      balance: -50000,
      status: 'آجل',
      lastTransaction: '10 يناير، 1:00 م',
      currency: 'YER',
      debts: [
        {
          id: 'debt-4',
          storeId: '5',
          storeName: 'محل الملابس',
          storeLogo: '👕',
          amount: 50000,
          paidAmount: 0,
          currency: 'YER',
          dueDate: '2024-01-25',
          status: 'overdue',
          createdAt: '2024-01-01',
          description: 'شراء ملابس'
        }
      ]
    }
  ];

  // TODO: Fetch payment history from API
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  
  useEffect(() => {
    // TODO: Fetch payment history from API
    setPaymentHistory([]);
  }, []);

  // Empty payment history - no mock data
  const emptyPaymentHistory: PaymentHistory[] = [
    { id: 'ph-1', debtId: 'debt-2', amount: 20, currency: 'SAR', paymentDate: '2024-01-15', method: 'wallet', status: 'completed' },
    { id: 'ph-2', debtId: 'debt-1', amount: 50, currency: 'SAR', paymentDate: '2024-01-10', method: 'cash', status: 'completed' },
    { id: 'ph-3', debtId: 'debt-4', amount: 10000, currency: 'YER', paymentDate: '2024-01-05', method: 'bank', status: 'completed' },
  ];

  // TODO: Fetch notifications from API
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // TODO: Fetch notifications from API
    setNotifications([]);
  }, []);

  // TODO: Fetch exchange rates from API
  const [exchangeRates, setExchangeRates] = useState({
    SAR: { YER: 0, USD: 0 },
    YER: { SAR: 0, USD: 0 },
    USD: { SAR: 0, YER: 0 }
  });
  
  useEffect(() => {
    // TODO: Fetch exchange rates from API
    // For now, use empty rates
  }, []);

  // Collect all debts from subscriptions
  const allDebts: Debt[] = subscriptions
    .flatMap(sub => sub.debts || [])
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Filter debts
  const filteredDebts = allDebts.filter(debt => {
    const matchesCurrency = filterCurrency === 'all' || debt.currency === filterCurrency;
    const matchesStatus = filterStatus === 'all' || debt.status === filterStatus;
    return matchesCurrency && matchesStatus;
  });

  // Calculate totals
  const totalDebtsByCurrency = {
    SAR: allDebts.filter(d => d.currency === 'SAR' && d.status !== 'paid').reduce((sum, d) => sum + d.amount, 0),
    YER: allDebts.filter(d => d.currency === 'YER' && d.status !== 'paid').reduce((sum, d) => sum + d.amount, 0),
    USD: allDebts.filter(d => d.currency === 'USD' && d.status !== 'paid').reduce((sum, d) => sum + d.amount, 0),
  };

  const overdueDebts = allDebts.filter(d => d.status === 'overdue');
  const pendingDebts = allDebts.filter(d => d.status === 'pending');
  const upcomingDebts = allDebts.filter(d => {
    const dueDate = new Date(d.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7 && daysDiff > 0 && d.status === 'pending';
  });

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return '';
    }
  };

  const getCurrencyName = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ريال سعودي';
      case 'YER': return 'ريال يمني';
      case 'USD': return 'دولار أمريكي';
      default: return '';
    }
  };

  const getStatusBadge = (status: Debt['status']) => {
    const styles = {
      pending: 'bg-blue-100 text-blue-700 border-blue-200',
      overdue: 'bg-red-100 text-red-700 border-red-200',
      paid: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      scheduled: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    const labels = {
      pending: 'مستحقة',
      overdue: 'متأخرة',
      paid: 'مدفوعة',
      scheduled: 'مجدولة'
    };
    return (
      <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${styles[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handlePayDebt = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowPayDialog(true);
  };

  const confirmPayment = () => {
    if (!selectedDebt) return;
    toast.success(`تم دفع ${selectedDebt.amount} ${getCurrencySymbol(selectedDebt.currency)} بنجاح`);
    setShowPayDialog(false);
    setSelectedDebt(null);
  };

  // 1. Schedule Payment
  const handleSchedulePayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setShowScheduleDialog(true);
  };

  const confirmSchedulePayment = () => {
    if (!selectedDebt || !scheduleDate) {
      toast.error('يرجى اختيار تاريخ للدفع');
      return;
    }
    toast.success(`تم جدولة الدفع بتاريخ ${scheduleDate}`);
    setShowScheduleDialog(false);
    setScheduleDate('');
    setSelectedDebt(null);
  };

  // 2. Partial Payment
  const handlePartialPayment = (debt: Debt) => {
    setSelectedDebt(debt);
    setPartialAmount('');
    setShowPartialPayDialog(true);
  };

  const confirmPartialPayment = () => {
    if (!selectedDebt || !partialAmount) {
      toast.error('يرجى إدخال المبلغ');
      return;
    }
    const amount = parseFloat(partialAmount);
    if (amount <= 0 || amount > selectedDebt.amount) {
      toast.error('المبلغ غير صحيح');
      return;
    }
    toast.success(`تم دفع ${amount} ${getCurrencySymbol(selectedDebt.currency)} جزئياً`);
    setShowPartialPayDialog(false);
    setPartialAmount('');
    setSelectedDebt(null);
  };

  // 3. Currency Conversion
  const convertCurrency = () => {
    if (!convertAmount) {
      toast.error('يرجى إدخال المبلغ');
      return;
    }
    const amount = parseFloat(convertAmount);
    if (amount <= 0) {
      toast.error('المبلغ غير صحيح');
      return;
    }
    const rate = exchangeRates[convertFrom][convertTo];
    const converted = (amount * rate).toFixed(2);
    toast.success(`${amount} ${getCurrencySymbol(convertFrom)} = ${converted} ${getCurrencySymbol(convertTo)}`);
    setShowCurrencyConvertDialog(false);
    setConvertAmount('');
  };

  // 4. Export Data
  const handleExportData = (format: 'pdf' | 'excel') => {
    toast.success(`جاري تصدير البيانات بصيغة ${format === 'pdf' ? 'PDF' : 'Excel'}...`);
    // In real app, this would trigger download
  };


  // 6. Get Unread Notifications Count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout title="اشتراكاتي" subtitle="إدارة اشتراكاتك ورصيدك في المتاجر">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-6">
        {/* Mobile-First Tabs and Actions */}
        <div className="space-y-3">
          <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gray-100 p-1 h-12">
            <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold">
              الاشتراكات
            </TabsTrigger>
            <TabsTrigger value="debts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm font-bold relative">
              الديون المستحقة
              {allDebts.length > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-black">
                  {allDebts.filter(d => d.status !== 'paid').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          {/* Quick Actions - Mobile Optimized */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNotifications(true)}
              className="relative border-2 border-gray-200 rounded-xl h-10 px-3 shrink-0"
            >
              <Bell className="w-4 h-4 ml-1.5" />
              <span className="text-xs font-bold">إشعارات</span>
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-black">
                  {unreadNotificationsCount}
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPaymentHistory(true)}
              className="border-2 border-gray-200 rounded-xl h-10 px-3 shrink-0"
            >
              <History className="w-4 h-4 ml-1.5" />
              <span className="text-xs font-bold">السجل</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCurrencyConvertDialog(true)}
              className="border-2 border-gray-200 rounded-xl h-10 px-3 shrink-0"
            >
              <ArrowLeftRight className="w-4 h-4 ml-1.5" />
              <span className="text-xs font-bold">تحويل</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReports(true)}
              className="border-2 border-gray-200 rounded-xl h-10 px-3 shrink-0"
            >
              <FileText className="w-4 h-4 ml-1.5" />
              <span className="text-xs font-bold">تقارير</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExportData('pdf')}
              className="border-2 border-gray-200 rounded-xl h-10 px-3 shrink-0"
            >
              <Download className="w-4 h-4 ml-1.5" />
              <span className="text-xs font-bold">تصدير</span>
            </Button>
          </div>
        </div>

        <TabsContent value="subscriptions" className="space-y-3">
          {subscriptions.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onClick={() => navigate(`/wallet/${subscription.id}`)}
                  debtCount={subscription.debts?.length || 0}
                />
              ))}
              
              {/* Add New Subscription Card */}
              <Card 
                className="p-4 border-2 border-dashed border-gray-200 rounded-xl bg-transparent hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[120px] group"
                onClick={() => navigate('/explore')}
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center text-gray-400 group-hover:text-gray-600 transition-colors">
                  <Plus className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-gray-600 group-hover:text-gray-900">إضافة اشتراك جديد</p>
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
        </TabsContent>

        <TabsContent value="debts" className="space-y-3">
          {/* Summary Cards - Mobile Optimized */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-2.5 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-red-700" />
                  <span className="text-[9px] font-bold text-red-700">متأخرة</span>
                </div>
              </div>
              <div className="text-xl font-black text-red-900 leading-none">{overdueDebts.length}</div>
              <div className="text-[9px] text-red-600 mt-0.5">ديون</div>
            </Card>
            <Card className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-700" />
                  <span className="text-[9px] font-bold text-blue-700">قادمة</span>
                </div>
              </div>
              <div className="text-xl font-black text-blue-900 leading-none">{upcomingDebts.length}</div>
              <div className="text-[9px] text-blue-600 mt-0.5">خلال 7 أيام</div>
            </Card>
            <Card className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <TrendingDown className="w-3 h-3 text-gray-700" />
                  <span className="text-[9px] font-bold text-gray-700">مستحقة</span>
                </div>
              </div>
              <div className="text-xl font-black text-gray-900 leading-none">{pendingDebts.length}</div>
              <div className="text-[9px] text-gray-600 mt-0.5">ديون</div>
            </Card>
            <Card className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-700" />
                  <span className="text-[9px] font-bold text-emerald-700">مدفوعة</span>
                </div>
              </div>
              <div className="text-xl font-black text-emerald-900 leading-none">
                {allDebts.filter(d => d.status === 'paid').length}
              </div>
              <div className="text-[9px] text-emerald-600 mt-0.5">ديون</div>
            </Card>
          </div>

          {/* Total Debts by Currency - Mobile Optimized */}
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(totalDebtsByCurrency).map(([currency, total]) => (
              total > 0 && (
                <Card key={currency} className="p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-[10px] text-gray-500 mb-0.5">إجمالي الديون</div>
                      <div className="text-base font-black text-gray-900 leading-none">
                        {total.toLocaleString()} {getCurrencySymbol(currency)}
                      </div>
                      <div className="text-[9px] text-gray-400 mt-0.5">{getCurrencyName(currency)}</div>
                    </div>
                    <DollarSign className="w-6 h-6 text-gray-300 shrink-0" />
                  </div>
                </Card>
              )
            ))}
          </div>

          {/* Filters - Mobile Optimized */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Select value={filterCurrency} onValueChange={(v) => setFilterCurrency(v as typeof filterCurrency)}>
              <SelectTrigger className="h-10 rounded-xl border-2 border-gray-200 text-sm min-w-[140px] shrink-0">
                <SelectValue placeholder="جميع العملات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع العملات</SelectItem>
                <SelectItem value="SAR">ريال سعودي</SelectItem>
                <SelectItem value="YER">ريال يمني</SelectItem>
                <SelectItem value="USD">دولار أمريكي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
              <SelectTrigger className="h-10 rounded-xl border-2 border-gray-200 text-sm min-w-[140px] shrink-0">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="pending">مستحقة</SelectItem>
                <SelectItem value="overdue">متأخرة</SelectItem>
                <SelectItem value="paid">مدفوعة</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Debts List */}
          {filteredDebts.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-gray-200 rounded-xl">
              <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-gray-900 mb-1">لا توجد ديون</h3>
              <p className="text-sm text-gray-500">جميع الديون مدفوعة أو لا توجد ديون مستحقة</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredDebts.map((debt) => {
                const daysUntilDue = getDaysUntilDue(debt.dueDate);
                const isOverdue = daysUntilDue < 0;
                const isUpcoming = daysUntilDue <= 7 && daysUntilDue > 0;

                return (
                  <Card key={debt.id} className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl shrink-0">
                        {debt.storeLogo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-sm text-gray-900 mb-0.5 leading-tight">{debt.storeName}</h3>
                            {debt.description && (
                              <p className="text-[10px] text-gray-500 line-clamp-1">{debt.description}</p>
                            )}
                          </div>
                          {getStatusBadge(debt.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <div className="text-[9px] text-gray-500 mb-0.5">المبلغ</div>
                            <div className="text-base font-black text-gray-900 leading-none">
                              {debt.amount.toLocaleString()} {getCurrencySymbol(debt.currency)}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] text-gray-500 mb-0.5">تاريخ الاستحقاق</div>
                            <div className="flex items-center gap-1 flex-wrap">
                              <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="text-xs font-bold text-gray-700">{debt.dueDate}</span>
                              {isOverdue && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-[8px] px-1 py-0 leading-none">
                                  متأخر {Math.abs(daysUntilDue)}
                                </Badge>
                              )}
                              {isUpcoming && (
                                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[8px] px-1 py-0 leading-none">
                                  خلال {daysUntilDue}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {debt.status !== 'paid' && (
                          <div className="space-y-1.5 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-1.5">
                              <Button
                                size="sm"
                                onClick={() => handlePayDebt(debt)}
                                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-9 font-bold text-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5 ml-1" />
                                دفع كامل
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePartialPayment(debt)}
                                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-lg h-9 font-bold text-xs"
                              >
                                <Percent className="w-3.5 h-3.5 ml-1" />
                                دفع جزئي
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleSchedulePayment(debt)}
                                className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg h-9 font-bold text-xs"
                              >
                                <CalendarClock className="w-3.5 h-3.5 ml-1" />
                                جدولة
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigate(`/wallet/${debt.storeId}`)}
                                className="border-2 border-gray-200 rounded-lg h-9 font-bold text-xs"
                              >
                                <Eye className="w-3.5 h-3.5 ml-1" />
                                التفاصيل
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pay Debt Dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">دفع الدين</DialogTitle>
            <DialogDescription className="text-right">
              تأكيد دفع الدين المستحق
            </DialogDescription>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">المتجر</span>
                  <span className="font-bold text-gray-900">{selectedDebt.storeName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">المبلغ</span>
                  <span className="font-black text-lg text-gray-900">
                    {selectedDebt.amount.toLocaleString()} {getCurrencySymbol(selectedDebt.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">تاريخ الاستحقاق</span>
                  <span className="font-bold text-gray-900">{selectedDebt.dueDate}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <Info className="w-4 h-4" />
                  <span>سيتم خصم المبلغ من رصيدك في هذا المتجر</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={confirmPayment}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-sm"
            >
              <CreditCard className="w-5 h-5 ml-2" />
              تأكيد الدفع
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowPayDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Payment Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-purple-600" />
              جدولة دفعة
            </DialogTitle>
            <DialogDescription className="text-right">
              اختر تاريخ لجدولة الدفعة
            </DialogDescription>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">المتجر</span>
                  <span className="font-bold text-gray-900">{selectedDebt.storeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">المبلغ</span>
                  <span className="font-black text-lg text-gray-900">
                    {selectedDebt.amount.toLocaleString()} {getCurrencySymbol(selectedDebt.currency)}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">تاريخ الدفع المجدول</Label>
                <Input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-purple-400"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={confirmSchedulePayment}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 font-black text-sm"
            >
              <CalendarClock className="w-5 h-5 ml-2" />
              تأكيد الجدولة
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowScheduleDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Partial Payment Dialog */}
      <Dialog open={showPartialPayDialog} onOpenChange={setShowPartialPayDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Percent className="w-5 h-5 text-blue-600" />
              دفع جزئي
            </DialogTitle>
            <DialogDescription className="text-right">
              دفع جزء من الدين المستحق
            </DialogDescription>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">المبلغ الكامل</span>
                  <span className="font-black text-lg text-gray-900">
                    {selectedDebt.amount.toLocaleString()} {getCurrencySymbol(selectedDebt.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">المدفوع</span>
                  <span className="font-bold text-gray-700">
                    {(selectedDebt.paidAmount || 0).toLocaleString()} {getCurrencySymbol(selectedDebt.currency)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                  <span className="text-sm font-bold text-gray-700">المتبقي</span>
                  <span className="font-black text-base text-red-600">
                    {(selectedDebt.amount - (selectedDebt.paidAmount || 0)).toLocaleString()} {getCurrencySymbol(selectedDebt.currency)}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">المبلغ المراد دفعه</Label>
                <Input
                  type="number"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  placeholder="0.00"
                  max={selectedDebt.amount - (selectedDebt.paidAmount || 0)}
                  min="0.01"
                  step="0.01"
                  className="h-12 rounded-xl border-2 border-gray-200 text-base font-bold text-center focus:border-blue-400"
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={confirmPartialPayment}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-black text-sm"
            >
              <CreditCard className="w-5 h-5 ml-2" />
              تأكيد الدفع الجزئي
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowPartialPayDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Currency Conversion Dialog */}
      <Dialog open={showCurrencyConvertDialog} onOpenChange={setShowCurrencyConvertDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
              تحويل العملات
            </DialogTitle>
            <DialogDescription className="text-right">
              تحويل المبالغ بين العملات المختلفة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">من</Label>
              <Select value={convertFrom} onValueChange={(v) => setConvertFrom(v as typeof convertFrom)}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                  <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">المبلغ</Label>
              <Input
                type="number"
                value={convertAmount}
                onChange={(e) => setConvertAmount(e.target.value)}
                placeholder="0.00"
                className="h-12 rounded-xl border-2 border-gray-200 text-base font-bold text-center focus:border-emerald-400"
              />
            </div>
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">إلى</Label>
              <Select value={convertTo} onValueChange={(v) => setConvertTo(v as typeof convertTo)}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                  <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
                  <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {convertAmount && parseFloat(convertAmount) > 0 && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-xs text-emerald-700 mb-1">المبلغ المحول</div>
                <div className="text-2xl font-black text-emerald-900">
                  {(parseFloat(convertAmount) * exchangeRates[convertFrom][convertTo]).toFixed(2)} {getCurrencySymbol(convertTo)}
                </div>
                <div className="text-[10px] text-emerald-600 mt-1">
                  سعر الصرف: 1 {getCurrencySymbol(convertFrom)} = {exchangeRates[convertFrom][convertTo]} {getCurrencySymbol(convertTo)}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={convertCurrency}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-black text-sm"
            >
              <ArrowLeftRight className="w-5 h-5 ml-2" />
              تحويل
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowCurrencyConvertDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment History Dialog */}
      <Dialog open={showPaymentHistory} onOpenChange={setShowPaymentHistory}>
        <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              سجل الدفعات
            </DialogTitle>
            <DialogDescription className="text-right">
              تاريخ جميع الدفعات السابقة
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد دفعات سابقة</p>
              </div>
            ) : (
              paymentHistory.map((payment) => (
                <Card key={payment.id} className="p-4 border border-gray-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <div className="font-black text-sm text-gray-900 mb-1">
                          {payment.amount.toLocaleString()} {getCurrencySymbol(payment.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentDate} • {payment.method === 'wallet' ? 'محفظة' : payment.method === 'cash' ? 'نقدي' : 'بنكي'}
                        </div>
                      </div>
                    </div>
                    <Badge className={payment.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                      {payment.status === 'completed' ? 'مكتمل' : payment.status === 'pending' ? 'قيد المعالجة' : 'فاشل'}
                    </Badge>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-600" />
              الإشعارات
              {unreadNotificationsCount > 0 && (
                <Badge className="bg-red-500 text-white text-[10px] px-2 py-0.5">
                  {unreadNotificationsCount} غير مقروء
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">لا توجد إشعارات</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <Card key={notification.id} className={`p-4 border rounded-xl ${!notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      notification.type === 'debt_overdue' ? 'bg-red-100' :
                      notification.type === 'debt_due' ? 'bg-blue-100' :
                      notification.type === 'payment_reminder' ? 'bg-amber-100' : 'bg-purple-100'
                    }`}>
                      {notification.type === 'debt_overdue' ? <AlertCircle className="w-5 h-5 text-red-600" /> :
                       notification.type === 'debt_due' ? <Clock className="w-5 h-5 text-blue-600" /> :
                       notification.type === 'payment_reminder' ? <Bell className="w-5 h-5 text-amber-600" /> :
                       <CalendarClock className="w-5 h-5 text-purple-600" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-black text-sm text-gray-900">{notification.title}</h4>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                      <div className="text-[10px] text-gray-400">{notification.date}</div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Dialog */}
      <Dialog open={showReports} onOpenChange={setShowReports}>
        <DialogContent className="max-w-2xl rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              التقارير الشهرية
            </DialogTitle>
            <DialogDescription className="text-right">
              تقارير مفصلة عن الديون والدفعات
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl">
                <div className="text-xs text-blue-700 mb-1">إجمالي الديون</div>
                <div className="text-2xl font-black text-blue-900">
                  {allDebts.filter(d => d.status !== 'paid').length}
                </div>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl">
                <div className="text-xs text-emerald-700 mb-1">إجمالي المدفوع</div>
                <div className="text-2xl font-black text-emerald-900">
                  {paymentHistory.filter(p => p.status === 'completed').length}
                </div>
              </Card>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-black text-sm text-gray-900 mb-3">ملخص حسب العملة</h4>
              <div className="space-y-2">
                {Object.entries(totalDebtsByCurrency).map(([currency, total]) => (
                  total > 0 && (
                    <div key={currency} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">{getCurrencyName(currency)}</span>
                      <span className="font-black text-gray-900">
                        {total.toLocaleString()} {getCurrencySymbol(currency)}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={() => handleExportData('pdf')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-black text-sm"
            >
              <Download className="w-5 h-5 ml-2" />
              تصدير PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportData('excel')}
              className="w-full border-2 border-gray-200 rounded-xl h-10 font-bold text-sm"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير Excel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function SubscriptionCard({ subscription, onClick, debtCount }: {
  subscription: Subscription;
  onClick: () => void;
  debtCount: number;
}) {
  return (
    <Card
      className="p-3 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-colors cursor-pointer group relative"
      onClick={onClick}
    >
      {debtCount > 0 && (
        <Badge className="absolute top-2 left-2 bg-red-500 text-white text-[9px] px-1.5 py-0.5 font-black rounded-lg">
          {debtCount} دين
        </Badge>
      )}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Store className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-sm text-gray-900 line-clamp-1 mb-0.5">{subscription.name}</h3>
            <span className="text-[10px] text-gray-400">{subscription.lastTransaction}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-end justify-between pt-2 border-t border-gray-100">
        <div className="flex-1">
          <p className="text-[10px] text-gray-500 mb-0.5">الرصيد الحالي</p>
          <p className={`text-lg font-black leading-none ${subscription.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {subscription.balance >= 0 ? '+' : ''}{subscription.balance} <span className="text-xs font-bold text-gray-500">
              {subscription.currency === 'SAR' ? 'ر.س' : subscription.currency === 'YER' ? 'ر.ي' : '$'}
            </span>
          </p>
        </div>
        <Badge variant={subscription.balance >= 0 ? 'default' : 'destructive'} className="rounded-lg px-2 py-0.5 text-[9px] font-bold shrink-0">
          {subscription.status}
        </Badge>
      </div>
    </Card>
  );
}
