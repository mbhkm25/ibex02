import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Wallet,
  ShoppingBag,
  Share2,
  FileText,
  Image as ImageIcon,
  Clock,
  DollarSign,
  X,
  Eye,
  Receipt,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeftRight
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { DashboardLayout } from '../layout/DashboardLayout';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  type: 'purchase' | 'topup' | 'payment' | 'refund' | 'transfer';
  amount: number;
  currency: 'SAR' | 'YER' | 'USD';
  date: string;
  time: string;
  fullDateTime: string;
  description: string;
  orderId?: string;
  receiptNumber?: string;
  paymentMethod?: 'wallet' | 'cash' | 'bank' | 'card';
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  storeName?: string;
  storeLogo?: string;
}

export function TransactionHistory() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'topup' | 'payment' | 'refund' | 'transfer'>('all');
  const [filterCurrency, setFilterCurrency] = useState<'all' | 'SAR' | 'YER' | 'USD'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [filterDateRange, setFilterDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Mock store data
  const getStoreData = (id: string | undefined) => {
    const stores: Record<string, { name: string; logo: string; currency: 'SAR' | 'YER' | 'USD' }> = {
      '1': { name: 'سوبر ماركت الرحمة', logo: '🏪', currency: 'SAR' },
      '2': { name: 'مطعم البيك', logo: '🍔', currency: 'SAR' },
      '3': { name: 'صيدلية النهدي', logo: '💊', currency: 'SAR' },
      '4': { name: 'متجر الإلكترونيات', logo: '📱', currency: 'USD' },
      '5': { name: 'محل الملابس', logo: '👕', currency: 'YER' },
    };
    return stores[id || '1'] || { name: 'المتجر', logo: '🏪', currency: 'SAR' };
  };

  const storeData = getStoreData(storeId);

  // Mock data
  const transactions: Transaction[] = [
    { 
      id: '1', 
      type: 'purchase', 
      amount: -45, 
      currency: storeData.currency,
      date: '15 يناير 2024', 
      time: '2:30 م',
      fullDateTime: '2024-01-15T14:30:00',
      description: 'شراء مواد غذائية', 
      orderId: '#1234',
      receiptNumber: 'REC-2024-001234',
      paymentMethod: 'wallet',
      status: 'completed',
      storeName: storeData.name,
      storeLogo: storeData.logo
    },
    { 
      id: '2', 
      type: 'topup', 
      amount: +300, 
      currency: storeData.currency,
      date: '14 يناير 2024', 
      time: '11:15 ص',
      fullDateTime: '2024-01-14T11:15:00',
      description: 'إضافة رصيد',
      receiptNumber: 'REC-2024-001233',
      paymentMethod: 'bank',
      status: 'completed'
    },
    { 
      id: '3', 
      type: 'purchase', 
      amount: -50, 
      currency: storeData.currency,
      date: '13 يناير 2024', 
      time: '4:20 م',
      fullDateTime: '2024-01-13T16:20:00',
      description: 'شراء', 
      orderId: '#1233',
      receiptNumber: 'REC-2024-001232',
      paymentMethod: 'cash',
      status: 'completed',
      storeName: storeData.name,
      storeLogo: storeData.logo
    },
    { 
      id: '4', 
      type: 'payment', 
      amount: -25, 
      currency: storeData.currency,
      date: '12 يناير 2024', 
      time: '3:45 م',
      fullDateTime: '2024-01-12T15:45:00',
      description: 'دفع فاتورة',
      receiptNumber: 'REC-2024-001231',
      paymentMethod: 'wallet',
      status: 'completed'
    },
    { 
      id: '5', 
      type: 'refund', 
      amount: +30, 
      currency: storeData.currency,
      date: '11 يناير 2024', 
      time: '1:20 م',
      fullDateTime: '2024-01-11T13:20:00',
      description: 'استرجاع مبلغ', 
      orderId: '#1232',
      receiptNumber: 'REC-2024-001230',
      paymentMethod: 'wallet',
      status: 'completed',
      notes: 'استرجاع بسبب عيب في المنتج'
    },
    { 
      id: '6', 
      type: 'transfer', 
      amount: -100, 
      currency: storeData.currency,
      date: '10 يناير 2024', 
      time: '10:00 ص',
      fullDateTime: '2024-01-10T10:00:00',
      description: 'تحويل رصيد',
      receiptNumber: 'REC-2024-001229',
      paymentMethod: 'wallet',
      status: 'pending'
    },
    { 
      id: '7', 
      type: 'purchase', 
      amount: -75, 
      currency: storeData.currency,
      date: '9 يناير 2024', 
      time: '5:30 م',
      fullDateTime: '2024-01-09T17:30:00',
      description: 'شراء',
      orderId: '#1231',
      receiptNumber: 'REC-2024-001228',
      paymentMethod: 'card',
      status: 'failed'
    }
  ];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.includes(searchQuery) || 
                         t.orderId?.includes(searchQuery) || 
                         t.receiptNumber?.includes(searchQuery);
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCurrency = filterCurrency === 'all' || t.currency === filterCurrency;
    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const today = new Date();
      const transactionDate = new Date(t.fullDateTime);
      
      switch (filterDateRange) {
        case 'today':
          matchesDate = transactionDate.toDateString() === today.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          matchesDate = transactionDate >= weekAgo;
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          matchesDate = transactionDate >= monthAgo;
          break;
        case 'custom':
          if (startDate && endDate) {
            matchesDate = transactionDate >= new Date(startDate) && transactionDate <= new Date(endDate);
          }
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesCurrency && matchesStatus && matchesDate;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'topup':
        return <ArrowUp className="w-4 h-4" />;
      case 'payment':
        return <Wallet className="w-4 h-4" />;
      case 'refund':
        return <ArrowDown className="w-4 h-4" />;
      case 'transfer':
        return <ArrowLeftRight className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (type === 'purchase') return 'text-red-600 bg-red-50 border-red-200';
    if (type === 'payment') return 'text-orange-600 bg-orange-50 border-orange-200';
    if (type === 'transfer') return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getTransactionLabel = (type: string) => {
    const labels = {
      purchase: 'شراء',
      topup: 'إضافة رصيد',
      payment: 'دفع',
      refund: 'استرجاع',
      transfer: 'تحويل'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const styles = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };
    const labels = {
      completed: 'مكتمل',
      pending: 'قيد المعالجة',
      failed: 'فاشل'
    };
    return (
      <Badge className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg border ${styles[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return '';
    }
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const handleShare = async (transaction: Transaction, format: 'whatsapp' | 'pdf' | 'jpeg') => {
    if (format === 'whatsapp') {
      const message = `إيصال عملية\n\n${transaction.description}\nالمبلغ: ${transaction.amount} ${getCurrencySymbol(transaction.currency)}\nالتاريخ: ${transaction.date} ${transaction.time}\nرقم الإيصال: ${transaction.receiptNumber}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      toast.success('تم فتح واتساب');
    } else if (format === 'pdf') {
      toast.success('جاري تصدير PDF...');
      // In real app, this would generate and download PDF
    } else if (format === 'jpeg') {
      toast.success('جاري تصدير JPEG...');
      // In real app, this would generate and download JPEG
    }
  };

  const handleExportAll = (format: 'pdf' | 'excel') => {
    toast.success(`جاري تصدير جميع العمليات بصيغة ${format === 'pdf' ? 'PDF' : 'Excel'}...`);
  };

  const totalIncome = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const netBalance = totalIncome - totalExpenses;

  return (
    <DashboardLayout 
      title="كشف حساب" 
      subtitle={`سجل العمليات - ${storeData.name}`}
    >
      <div className="space-y-3">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl">
            <div className="text-[9px] text-emerald-700 font-bold mb-1">إجمالي الدخل</div>
            <div className="text-base font-black text-emerald-900 leading-none">
              {totalIncome.toLocaleString()}
            </div>
            <div className="text-[9px] text-emerald-600 mt-0.5">{getCurrencySymbol(storeData.currency)}</div>
          </Card>
          <Card className="p-2.5 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl">
            <div className="text-[9px] text-red-700 font-bold mb-1">إجمالي المصروف</div>
            <div className="text-base font-black text-red-900 leading-none">
              {totalExpenses.toLocaleString()}
            </div>
            <div className="text-[9px] text-red-600 mt-0.5">{getCurrencySymbol(storeData.currency)}</div>
          </Card>
          <Card className="p-2.5 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 rounded-xl">
            <div className="text-[9px] text-gray-700 font-bold mb-1">الرصيد</div>
            <div className={`text-base font-black leading-none ${netBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netBalance >= 0 ? '+' : ''}{netBalance.toLocaleString()}
            </div>
            <div className="text-[9px] text-gray-600 mt-0.5">{getCurrencySymbol(storeData.currency)}</div>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="ابحث في السجل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="h-11 w-11 rounded-xl border-2 border-gray-200 relative"
          >
            <Filter className="w-5 h-5" />
            {(filterType !== 'all' || filterCurrency !== 'all' || filterStatus !== 'all' || filterDateRange !== 'all') && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleExportAll('pdf')}
            className="h-11 w-11 rounded-xl border-2 border-gray-200"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <Card className="p-3 bg-white border border-gray-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-gray-900">فلاتر متقدمة</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setFilterType('all');
                  setFilterCurrency('all');
                  setFilterStatus('all');
                  setFilterDateRange('all');
                  setStartDate('');
                  setEndDate('');
                }}
                className="h-7 w-7 rounded-lg text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] font-bold text-gray-700 mb-1 block">نوع العملية</Label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                  <SelectTrigger className="h-9 rounded-xl border-2 border-gray-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="purchase">مشتريات</SelectItem>
                    <SelectItem value="topup">إضافة رصيد</SelectItem>
                    <SelectItem value="payment">مدفوعات</SelectItem>
                    <SelectItem value="refund">استرجاع</SelectItem>
                    <SelectItem value="transfer">تحويل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-gray-700 mb-1 block">العملة</Label>
                <Select value={filterCurrency} onValueChange={(v) => setFilterCurrency(v as typeof filterCurrency)}>
                  <SelectTrigger className="h-9 rounded-xl border-2 border-gray-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="SAR">ريال سعودي</SelectItem>
                    <SelectItem value="YER">ريال يمني</SelectItem>
                    <SelectItem value="USD">دولار</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-gray-700 mb-1 block">الحالة</Label>
                <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as typeof filterStatus)}>
                  <SelectTrigger className="h-9 rounded-xl border-2 border-gray-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="pending">قيد المعالجة</SelectItem>
                    <SelectItem value="failed">فاشل</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-[10px] font-bold text-gray-700 mb-1 block">الفترة</Label>
                <Select value={filterDateRange} onValueChange={(v) => setFilterDateRange(v as typeof filterDateRange)}>
                  <SelectTrigger className="h-9 rounded-xl border-2 border-gray-200 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="today">اليوم</SelectItem>
                    <SelectItem value="week">آخر 7 أيام</SelectItem>
                    <SelectItem value="month">آخر شهر</SelectItem>
                    <SelectItem value="custom">مخصص</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterDateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                <div>
                  <Label className="text-[10px] font-bold text-gray-700 mb-1 block">من تاريخ</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 rounded-xl border-2 border-gray-200 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-gray-700 mb-1 block">إلى تاريخ</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 rounded-xl border-2 border-gray-200 text-xs"
                  />
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Quick Type Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {(['all', 'purchase', 'topup', 'payment', 'refund', 'transfer'] as const).map((type) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              onClick={() => setFilterType(type)}
              className={`h-9 px-3 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 ${
                filterType === type
                  ? 'bg-gray-900 text-white border-0'
                  : 'border-2 border-gray-200'
              }`}
            >
              {type === 'all' ? 'الكل' : getTransactionLabel(type)}
            </Button>
          ))}
        </div>

        {/* Transactions List */}
        <div className="space-y-2">
          {filteredTransactions.length === 0 ? (
            <Card className="p-12 text-center bg-white border border-gray-200 rounded-xl">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-gray-900 mb-1">لا توجد عمليات</h3>
              <p className="text-sm text-gray-500">لا توجد عمليات تطابق الفلاتر المحددة</p>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => {
              const isPositive = transaction.amount > 0;
              const iconColor = getTransactionColor(transaction.type, transaction.amount);
              
              return (
                <Card
                  key={transaction.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer"
                  onClick={() => handleViewDetails(transaction)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconColor}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 mb-0.5 leading-tight">{transaction.description}</h3>
                          <div className="flex items-center gap-2 flex-wrap text-[10px] text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>{transaction.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{transaction.time}</span>
                            </div>
                            {transaction.orderId && (
                              <span className="text-gray-400">• {transaction.orderId}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className={`text-base font-black leading-none ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : ''}{transaction.amount.toLocaleString()} {getCurrencySymbol(transaction.currency)}
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      {transaction.storeName && (
                        <div className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t border-gray-100">
                          <span className="text-lg">{transaction.storeLogo}</span>
                          <span className="text-[10px] text-gray-600 font-bold">{transaction.storeName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Summary */}
        <Card className="p-3 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-gray-600 mb-0.5">إجمالي العمليات</div>
              <div className="text-base font-black text-gray-900">{filteredTransactions.length}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-600 mb-0.5">الرصيد الحالي</div>
              <div className="text-base font-black text-emerald-600">250 {getCurrencySymbol(storeData.currency)}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Details Dialog */}
      <Dialog open={showTransactionDetails} onOpenChange={setShowTransactionDetails}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              تفاصيل العملية
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
              {/* Transaction Header */}
              <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${getTransactionColor(selectedTransaction.type, selectedTransaction.amount)}`}>
                    {getTransactionIcon(selectedTransaction.type)}
                  </div>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div className="text-center mb-3">
                  <div className="text-xs text-gray-600 mb-1">{getTransactionLabel(selectedTransaction.type)}</div>
                  <div className={`text-2xl font-black ${selectedTransaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {selectedTransaction.amount > 0 ? '+' : ''}{selectedTransaction.amount.toLocaleString()} {getCurrencySymbol(selectedTransaction.currency)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-black text-gray-900 mb-0.5">{selectedTransaction.description}</div>
                  {selectedTransaction.storeName && (
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      <span className="text-lg">{selectedTransaction.storeLogo}</span>
                      <span className="text-xs text-gray-600">{selectedTransaction.storeName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">رقم الإيصال</span>
                  <span className="text-xs font-black text-gray-900">{selectedTransaction.receiptNumber}</span>
                </div>
                {selectedTransaction.orderId && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">رقم الطلب</span>
                    <span className="text-xs font-black text-gray-900">{selectedTransaction.orderId}</span>
                  </div>
                )}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">التاريخ والوقت</span>
                  <span className="text-xs font-black text-gray-900">{selectedTransaction.date} {selectedTransaction.time}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs text-gray-600">العملة</span>
                  <span className="text-xs font-black text-gray-900">{getCurrencySymbol(selectedTransaction.currency)}</span>
                </div>
                {selectedTransaction.paymentMethod && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <span className="text-xs text-gray-600">طريقة الدفع</span>
                    <span className="text-xs font-black text-gray-900">
                      {selectedTransaction.paymentMethod === 'wallet' ? 'محفظة' :
                       selectedTransaction.paymentMethod === 'cash' ? 'نقدي' :
                       selectedTransaction.paymentMethod === 'bank' ? 'بنكي' : 'بطاقة'}
                    </span>
                  </div>
                )}
                {selectedTransaction.notes && (
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-xs text-blue-700 font-bold mb-1">ملاحظات</div>
                    <div className="text-xs text-blue-900">{selectedTransaction.notes}</div>
                  </div>
                )}
              </div>

              {/* Share Actions */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs font-bold text-gray-700 mb-2">مشاركة الإيصال</div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedTransaction, 'whatsapp')}
                    className="h-10 border-2 border-green-200 text-green-700 hover:bg-green-50 rounded-xl"
                  >
                    <Share2 className="w-4 h-4 ml-1" />
                    <span className="text-xs font-bold">واتساب</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedTransaction, 'pdf')}
                    className="h-10 border-2 border-red-200 text-red-700 hover:bg-red-50 rounded-xl"
                  >
                    <FileText className="w-4 h-4 ml-1" />
                    <span className="text-xs font-bold">PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(selectedTransaction, 'jpeg')}
                    className="h-10 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl"
                  >
                    <ImageIcon className="w-4 h-4 ml-1" />
                    <span className="text-xs font-bold">JPEG</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowTransactionDetails(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

