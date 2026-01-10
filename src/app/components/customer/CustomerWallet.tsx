import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Receipt, 
  MessageCircle, 
  TrendingUp, 
  Wallet,
  ShoppingBag,
  ArrowUp,
  Clock,
  Info,
  CheckCircle,
  FileText,
  HelpCircle,
  Package,
  Star,
  Calendar,
  DollarSign,
  BarChart3,
  Plus,
  Copy,
  Check,
  Upload,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '../ui/dialog';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  notes: string;
}

export function CustomerWallet() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'orders'>('overview');
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositCurrency, setDepositCurrency] = useState<'SAR' | 'YER' | 'USD'>('SAR');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);

  // TODO: Fetch wallet data from API
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Fetch wallet data from API based on storeId
    setLoading(false);
    setWallet(null);
  }, [storeId]);

  // TODO: Fetch transactions from API
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    // TODO: Fetch transactions from API
    setTransactions([]);
  }, [storeId]);

  // TODO: Fetch recent orders from API
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  
  useEffect(() => {
    // TODO: Fetch recent orders from API
    setRecentOrders([]);
  }, [storeId]);

  // TODO: Fetch store bank accounts from API
  const [storeBankAccounts, setStoreBankAccounts] = useState<BankAccount[]>([]);
  
  useEffect(() => {
    // TODO: Fetch store bank accounts from API
    setStoreBankAccounts([]);
  }, [storeId]);

  const selectedBankAccount = storeBankAccounts.find(b => b.id === selectedBank);

  const handleCopyAccountNumber = (accountNumber: string, accountId: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccountId(accountId);
    toast.success('تم نسخ رقم الحساب');
    setTimeout(() => setCopiedAccountId(null), 2000);
  };

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setReceiptFile(file);
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setReceiptPreview(reader.result as string);
          };
          reader.readAsDataURL(file);
        } else {
          setReceiptPreview(null);
        }
      } else {
        toast.error('يرجى اختيار ملف PDF أو صورة');
      }
    }
  };

  const handleSubmitDeposit = () => {
    if (!selectedBank) {
      toast.error('يرجى اختيار المصرف');
      return;
    }
    if (!referenceNumber.trim()) {
      toast.error('يرجى إدخال الرقم المرجعي');
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }

    toast.success('تم إرسال طلب إضافة الرصيد! سيتم مراجعته قريباً');
    setShowDepositDialog(false);
    // Reset form
    setSelectedBank('');
    setReferenceNumber('');
    setDepositAmount('');
    setDepositCurrency('SAR');
    setReceiptFile(null);
    setReceiptPreview(null);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return 'ر.س';
    }
  };

  const getNextBestAction = () => {
    if (wallet.balance === 0) {
      return {
        title: 'ابدأ بمسح كود المتجر',
        description: 'قم بمسح كود المتجر للاشتراك وإضافة رصيد',
        action: () => navigate('/scan/store')
      };
    }
    return null;
  };

  const nextAction = getNextBestAction();

  const handleRequestCredit = () => {
    toast.info('جاري إرسال طلبك...');
    setTimeout(() => {
      toast.success('تم إرسال طلبك! سيتم مراجعته قريباً');
    }, 1500);
  };

  return (
    <DashboardLayout 
      title={wallet.storeName} 
      subtitle="إدارة رصيدك واشتراكاتك"
    >
      <div className="space-y-5">
        {/* Store Header - Professional */}
        <Card className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl border border-gray-200">
              {wallet.storeLogo}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">{wallet.storeName}</h2>
              <p className="text-sm text-gray-500">متجرك المفضل</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Balance Card - Professional Layout */}
        <Card className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="w-4 h-4" />
                <span>رصيدك الحالي</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${wallet.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {wallet.balance >= 0 ? '+' : ''}{wallet.balance}
                </p>
                <span className="text-lg font-medium text-gray-500">ر.س</span>
              </div>
            </div>

            {/* Right: Status */}
            <div className="flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {wallet.creditStatus === 'نقدي' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-600" />
                )}
                <div>
                  <p className="text-xs text-gray-500">حالة الحساب</p>
                  <p className="font-semibold text-gray-900">{wallet.creditStatus}</p>
                </div>
              </div>
              {wallet.creditLimit > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">سقف الآجل</p>
                    <p className="font-semibold text-gray-900">{wallet.creditLimit} ر.س</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Add Balance Button */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <Button
              onClick={() => setShowDepositDialog(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-bold h-11"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة رصيد
            </Button>
          </div>
        </Card>

        {/* Combined Action & Credit Card - Professional & Dense */}
        {(nextAction || (wallet.creditLimit === 0 && wallet.balance >= 0)) && (
          <Card className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {nextAction ? nextAction.title : 'الشراء بالآجل'}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {nextAction ? nextAction.description : 'اطلب اعتماد الشراء بالآجل من المتجر. الشراء بالآجل يخضع لموافقة إدارة المتجر.'}
                  </p>
                </div>
                {wallet.creditLimit === 0 && wallet.balance >= 0 && (
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Info & Actions - Compact Row */}
              {wallet.creditLimit === 0 && wallet.balance >= 0 && (
                <>
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">السقف المقترح:</span>
                      <span className="font-semibold text-gray-900">{wallet.suggestedCreditLimit} ر.س</span>
                    </div>
                    {wallet.creditRequestStatus === 'pending' && (
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">
                        قيد المراجعة
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button 
                      size="sm" 
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium h-9 px-4"
                      onClick={handleRequestCredit}
                      disabled={wallet.creditRequestStatus === 'pending'}
                    >
                      {wallet.creditRequestStatus === 'pending' ? 'قيد المراجعة' : 'طلب اعتماد'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-9 px-3">
                          <Info className="w-3 h-3 ml-1" />
                          كيف يعمل؟
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-xl max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-base font-bold">الشراء بالآجل</DialogTitle>
                          <DialogDescription className="text-right leading-relaxed text-sm">
                            الشراء بالآجل يخضع لموافقة إدارة المتجر. يمكنك الشراء الآن والدفع لاحقاً حسب الاتفاق مع المتجر.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}

              {/* Next Action Button */}
              {nextAction && (
                <div className="pt-3 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium h-10"
                    onClick={nextAction.action}
                  >
                    {nextAction.title}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => navigate(`/wallet/${storeId}/products`)}
          >
            <Receipt className="ml-2 w-4 h-4" />
            <span className="font-medium">المنتجات والخدمات</span>
          </Button>
          <Button variant="outline" className="h-12 rounded-lg border border-gray-200 hover:bg-gray-50">
            <MessageCircle className="ml-2 w-4 h-4" />
            <span className="font-medium">تواصل</span>
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-3">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-gray-100 p-1 h-11">
            <TabsTrigger value="overview" className="rounded-lg text-xs font-bold">نظرة عامة</TabsTrigger>
            <TabsTrigger value="stats" className="rounded-lg text-xs font-bold">إحصائيات</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg text-xs font-bold">الطلبات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3">
            {/* Transactions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">سجل العمليات</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-600 hover:text-gray-900"
                  onClick={() => navigate(`/wallet/${storeId}/history`)}
                >
                  عرض الكل
                </Button>
              </div>

              <div className="space-y-2">
                {transactions.slice(0, 3).map((transaction) => {
                  const Icon = transaction.icon;
                  const isPositive = transaction.amount > 0;
                  
                  return (
                    <Card 
                      key={transaction.id} 
                      className="p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer bg-white"
                      onClick={() => navigate(`/wallet/${storeId}/history`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isPositive 
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                              : 'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-black text-sm text-gray-900 leading-tight">{transaction.note}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`font-black text-base leading-none ${
                            isPositive ? 'text-emerald-600' : 'text-red-600'
                          }`}>
                            {isPositive ? '+' : ''}{transaction.amount} <span className="text-xs text-gray-500">ر.س</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-3">
            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <h3 className="text-sm font-black text-gray-900 mb-3">إحصائيات الحساب</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                  <div className="text-[9px] font-bold text-blue-700 mb-1">إجمالي المشتريات</div>
                  <div className="text-lg font-black text-blue-900 leading-none">{wallet.totalSpent.toLocaleString()}</div>
                  <div className="text-[9px] text-blue-600 mt-0.5">ر.س</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                  <div className="text-[9px] font-bold text-purple-700 mb-1">عدد الطلبات</div>
                  <div className="text-lg font-black text-purple-900 leading-none">{wallet.totalOrders}</div>
                  <div className="text-[9px] text-purple-600 mt-0.5">طلب</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
                  <div className="text-[9px] font-bold text-amber-700 mb-1">متوسط الطلب</div>
                  <div className="text-lg font-black text-amber-900 leading-none">{wallet.averageOrderValue}</div>
                  <div className="text-[9px] text-amber-600 mt-0.5">ر.س</div>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
                  <div className="text-[9px] font-bold text-emerald-700 mb-1">التقييم</div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-black text-emerald-900 leading-none">{wallet.rating}</span>
                  </div>
                  <div className="text-[9px] text-emerald-600 mt-0.5">من 5</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <h3 className="text-sm font-black text-gray-900 mb-3">معلومات الحساب</h3>
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">تاريخ الانضمام</span>
                  <span className="font-bold text-gray-900">{wallet.joinDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">آخر طلب</span>
                  <span className="font-bold text-gray-900">{wallet.lastOrderDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">حالة الحساب</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                    {wallet.creditStatus}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-3">
            <Card className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-gray-900">آخر الطلبات</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold h-7"
                >
                  عرض الكل
                </Button>
              </div>
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <div className="text-sm font-black text-gray-900 mb-0.5">{order.id}</div>
                      <div className="text-[10px] text-gray-500">{order.date} • {order.items} منتج</div>
                    </div>
                    <div className="text-left">
                      <div className="text-base font-black text-gray-900 mb-1">{order.amount} ر.س</div>
                      <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200">
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Legal Transparency */}
        <Card className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">معلومة مهمة:</strong> المنصة لا تدير الأموال. الرصيد والاعتمادات تُدار مباشرة من قبل المتجر.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <FileText className="w-3 h-3 ml-1" />
                  كيف يعمل الرصيد؟
                </Button>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <FileText className="w-3 h-3 ml-1" />
                  سياسة الآجل
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

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">إضافة رصيد</DialogTitle>
            <DialogDescription className="text-right text-sm text-gray-600">
              قم بإيداع المبلغ في حساب المتجر ثم أدخل تفاصيل العملية
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Bank Selection */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">اختر المصرف</Label>
              <Select value={selectedBank} onValueChange={setSelectedBank}>
                <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                  <SelectValue placeholder="اختر المصرف" />
                </SelectTrigger>
                <SelectContent>
                  {storeBankAccounts.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      <div>
                        <div className="font-bold">{bank.bankName}</div>
                        <div className="text-xs text-gray-500">{bank.notes}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Account Number Display */}
            {selectedBankAccount && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-bold text-blue-700">رقم الحساب</Label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCopyAccountNumber(selectedBankAccount.accountNumber, selectedBankAccount.id)}
                    className="h-7 px-2 text-xs"
                  >
                    {copiedAccountId === selectedBankAccount.id ? (
                      <>
                        <Check className="w-3 h-3 ml-1 text-emerald-600" />
                        <span className="text-emerald-600">تم النسخ</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 ml-1" />
                        <span>نسخ</span>
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-sm font-mono font-bold text-gray-900 break-all">
                  {selectedBankAccount.accountNumber}
                </div>
                <p className="text-xs text-gray-500 mt-1">{selectedBankAccount.bankName}</p>
              </div>
            )}

            {/* Reference Number */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">الرقم المرجعي لعملية الإيداع</Label>
              <Input
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                placeholder="أدخل الرقم المرجعي"
                className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
              />
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">المبلغ</Label>
                <Input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  min="0.01"
                  step="0.01"
                  className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                />
              </div>
              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">العملة</Label>
                <Select value={depositCurrency} onValueChange={(v) => setDepositCurrency(v as typeof depositCurrency)}>
                  <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                    <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
                    <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Receipt Upload */}
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">إيصال الإيداع (اختياري)</Label>
              {receiptPreview ? (
                <div className="relative">
                  <div className="w-full h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={receiptPreview} alt="Receipt preview" className="w-full h-full object-cover" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="absolute top-2 left-2 h-7 w-7 rounded-lg bg-white/90 hover:bg-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : receiptFile ? (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-bold text-gray-900">{receiptFile.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="h-7 w-7"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex items-center justify-center gap-2 h-12 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors">
                  <Upload className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">اختر ملف PDF أو صورة</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleReceiptChange}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-gray-500 mt-1">يمكنك رفع إيصال الإيداع كـ PDF أو صورة</p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={handleSubmitDeposit}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-sm"
            >
              إرسال الطلب
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowDepositDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
