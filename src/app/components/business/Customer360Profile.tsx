import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  MessageCircle,
  History,
  FileText,
  Star,
  Tag,
  CreditCard,
  Ban,
  Edit,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  User,
  Wallet,
  ArrowUp,
  ArrowDown,
  Package,
  Receipt
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { toast } from 'sonner';

interface TimelineEvent {
  id: string;
  type: 'transaction' | 'chat' | 'order' | 'credit_change' | 'category_change' | 'rating' | 'note' | 'suspension';
  title: string;
  description: string;
  date: string;
  time: string;
  icon: React.ElementType;
  color: string;
  metadata?: any;
}

interface PrivateNote {
  id: string;
  text: string;
  createdAt: string;
  createdBy: string;
}

export function Customer360Profile() {
  const navigate = useNavigate();
  const { businessId, customerId } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'transactions' | 'orders' | 'notes' | 'deposits'>('overview');
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [selectedDepositRequest, setSelectedDepositRequest] = useState<any | null>(null);
  const [showDepositDetails, setShowDepositDetails] = useState(false);

  // Mock data - Customer Info
  const customer = {
    id: customerId || '1',
    name: 'أحمد محمد',
    phone: '+966501234567',
    email: 'ahmed@example.com',
    address: 'حي النسيم، شارع الملك فهد، الرياض',
    joinDate: '2023-06-15',
    lastActive: 'اليوم، 2:30 م',
    balance: 250,
    creditStatus: 'نقدي' as 'نقدي' | 'آجل' | 'مقيد',
    creditLimit: 0,
    category: 'regular',
    categoryName: 'عميل عادي',
    rating: 4.5,
    totalOrders: 45,
    totalSpent: 12500,
    averageOrderValue: 278,
    lastOrderDate: 'اليوم، 2:30 م',
    isActive: true,
  };

  // Mock data - Timeline Events
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'transaction',
      title: 'شراء مواد غذائية',
      description: 'عملية شراء بقيمة 45 ر.س',
      date: 'اليوم',
      time: '2:30 م',
      icon: ShoppingBag,
      color: 'text-blue-600',
      metadata: { amount: -45, type: 'purchase' }
    },
    {
      id: '2',
      type: 'chat',
      title: 'محادثة نصية',
      description: 'استفسار عن منتج معين',
      date: 'اليوم',
      time: '1:15 م',
      icon: MessageCircle,
      color: 'text-green-600',
      metadata: { messageCount: 5 }
    },
    {
      id: '3',
      type: 'order',
      title: 'طلب #1234',
      description: 'طلب بقيمة 250 ر.س - مكتمل',
      date: 'اليوم',
      time: '2:30 م',
      icon: Package,
      color: 'text-purple-600',
      metadata: { orderId: '#1234', amount: 250, status: 'مكتمل' }
    },
    {
      id: '4',
      type: 'transaction',
      title: 'إضافة رصيد',
      description: 'إضافة رصيد بقيمة 300 ر.س',
      date: 'أمس',
      time: '11:15 ص',
      icon: ArrowUp,
      color: 'text-emerald-600',
      metadata: { amount: 300, type: 'topup' }
    },
    {
      id: '5',
      type: 'category_change',
      title: 'تغيير التصنيف',
      description: 'تم تصنيف العميل كـ "عميل عادي"',
      date: '3 يناير',
      time: '10:00 ص',
      icon: Tag,
      color: 'text-amber-600',
      metadata: { from: 'new', to: 'regular' }
    },
    {
      id: '6',
      type: 'rating',
      title: 'تقييم العميل',
      description: 'تم تقييم العميل بـ 4.5 نجوم',
      date: '5 يناير',
      time: '3:20 م',
      icon: Star,
      color: 'text-yellow-600',
      metadata: { rating: 4.5 }
    },
  ];

  // Mock data - Private Notes
  const privateNotes: PrivateNote[] = [
    {
      id: '1',
      text: 'العميل يفضل التواصل مساءً بعد الساعة 7',
      createdAt: '2024-01-10',
      createdBy: 'محمد التاجر'
    },
    {
      id: '2',
      text: 'طلب عدم الاتصال في أوقات الصلاة',
      createdAt: '2024-01-05',
      createdBy: 'محمد التاجر'
    },
    {
      id: '3',
      text: 'عميل ممتاز - يدفع دائماً في الوقت المحدد',
      createdAt: '2023-12-20',
      createdBy: 'محمد التاجر'
    },
  ];

  // Mock data - Recent Transactions
  const recentTransactions = [
    { id: '1', type: 'purchase', amount: -45, date: 'اليوم، 2:30 م', note: 'شراء مواد غذائية' },
    { id: '2', type: 'topup', amount: +300, date: 'أمس، 11:15 ص', note: 'إضافة رصيد' },
    { id: '3', type: 'purchase', amount: -50, date: '2 يناير، 4:20 م', note: 'شراء' },
  ];

  // Mock data - Recent Orders
  const recentOrders = [
    { id: '#1234', date: 'اليوم، 2:30 م', amount: 250, status: 'مكتمل', items: 5 },
    { id: '#1230', date: 'أمس، 7:15 م', amount: 180, status: 'مكتمل', items: 3 },
    { id: '#1225', date: '3 يناير', amount: 320, status: 'مكتمل', items: 8 },
  ];

  // Mock data - Deposit Requests for this customer
  const customerDepositRequests = [
    {
      id: 'dep-1',
      bankName: 'البنك الأهلي',
      accountNumber: 'SA1234567890123456789012',
      referenceNumber: 'REF123456789',
      amount: 500,
      currency: 'SAR',
      status: 'pending',
      createdAt: 'اليوم، 10:30 ص',
      receiptUrl: null
    },
    {
      id: 'dep-2',
      bankName: 'STC Pay',
      accountNumber: '0501234567',
      referenceNumber: 'REF987654321',
      amount: 300,
      currency: 'SAR',
      status: 'approved',
      createdAt: 'أمس، 3:45 م',
      reviewedAt: 'أمس، 4:00 م',
      receiptUrl: null
    },
  ];

  const pendingDeposits = customerDepositRequests.filter(d => d.status === 'pending');

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return 'ر.س';
    }
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      toast.error('يرجى إدخال ملاحظة');
      return;
    }
    toast.success('تم إضافة الملاحظة');
    setShowAddNoteDialog(false);
    setNewNote('');
  };

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; color: string }> = {
      vip: { label: 'عميل مميز', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      regular: { label: 'عميل عادي', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      new: { label: 'عميل جديد', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      inactive: { label: 'غير نشط', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      credit: { label: 'عميل آجل', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    };
    const cat = categories[category] || categories.regular;
    return (
      <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cat.color}`}>
        {cat.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/business/${businessId}/manage`)}
            className="h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-gray-900 truncate">ملف العميل</h1>
            <p className="text-xs text-gray-500">{customer.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/business/${businessId}/customer/${customerId}/chat`)}
            className="h-9 w-9 rounded-xl"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="pb-4">
        <div className="p-4 space-y-3">
          {/* Customer Header Card */}
          <Card className="p-4 bg-white border border-gray-200 rounded-2xl">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16 border-2 border-gray-200 shrink-0 shadow-sm">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-black">
                  {customer.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-black text-gray-900">{customer.name}</h2>
                  {getCategoryBadge(customer.category)}
                  {customer.creditStatus === 'آجل' && (
                    <Badge className="text-[10px] font-bold px-2 py-0.5 rounded-lg border bg-emerald-100 text-emerald-700 border-emerald-200">
                      {customer.creditStatus}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{customer.phone}</span>
                  </div>
                  {customer.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-gray-100">
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50">
                <div className="text-[9px] font-bold text-blue-700 mb-1">الرصيد الحالي</div>
                <div className={`text-lg font-black leading-none ${customer.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {customer.balance >= 0 ? '+' : ''}{customer.balance}
                </div>
                <div className="text-[9px] text-blue-600 mt-0.5">ر.س</div>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50">
                <div className="text-[9px] font-bold text-purple-700 mb-1">إجمالي المشتريات</div>
                <div className="text-lg font-black text-purple-900 leading-none">{customer.totalSpent.toLocaleString()}</div>
                <div className="text-[9px] text-purple-600 mt-0.5">ر.س</div>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50">
                <div className="text-[9px] font-bold text-amber-700 mb-1">عدد الطلبات</div>
                <div className="text-lg font-black text-amber-900 leading-none">{customer.totalOrders}</div>
                <div className="text-[9px] text-amber-600 mt-0.5">طلب</div>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50">
                <div className="text-[9px] font-bold text-emerald-700 mb-1">متوسط الطلب</div>
                <div className="text-lg font-black text-emerald-900 leading-none">{customer.averageOrderValue}</div>
                <div className="text-[9px] text-emerald-600 mt-0.5">ر.س</div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/business/${businessId}/customer/${customerId}/history`)}
              className="h-11 border-2 border-gray-200 rounded-xl font-bold text-xs"
            >
              <History className="w-4 h-4 ml-1.5" />
              سجل العمليات
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/business/${businessId}/customer/${customerId}/chat`)}
              className="h-11 border-2 border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs"
            >
              <MessageCircle className="w-4 h-4 ml-1.5" />
              محادثة
            </Button>
          </div>

          {/* Pending Deposit Alert */}
          {pendingDeposits.length > 0 && (
            <Card className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900">
                    {pendingDeposits.length} طلب إيداع قيد المراجعة
                  </p>
                  <p className="text-[10px] text-amber-700">
                    سيتم اعتماد الرصيد بعد مراجعة العملية
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setActiveTab('deposits')}
                  className="h-7 px-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                >
                  عرض
                </Button>
              </div>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-3">
            <TabsList className="grid w-full grid-cols-4 rounded-xl bg-gray-100 p-1 h-11">
              <TabsTrigger value="overview" className="rounded-lg text-xs font-bold">نظرة عامة</TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-lg text-xs font-bold">سجل التفاعلات</TabsTrigger>
              <TabsTrigger value="deposits" className="rounded-lg text-xs font-bold relative">
                طلبات الإيداع
                {pendingDeposits.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 h-3 min-w-3 flex items-center justify-center font-black">
                    {pendingDeposits.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="notes" className="rounded-lg text-xs font-bold">ملاحظات</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-3">
              {/* Customer Info */}
              <Card className="p-4 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-black text-gray-900 mb-3">معلومات العميل</h3>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">تاريخ الانضمام</span>
                    <span className="font-bold text-gray-900">{customer.joinDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">آخر نشاط</span>
                    <span className="font-bold text-gray-900">{customer.lastActive}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">التقييم</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-bold text-gray-900">{customer.rating}</span>
                    </div>
                  </div>
                  {customer.creditLimit > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">سقف الآجل</span>
                      <span className="font-bold text-gray-900">{customer.creditLimit} ر.س</span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Transactions */}
              <Card className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-900">آخر العمليات</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/business/${businessId}/customer/${customerId}/history`)}
                    className="text-xs font-bold h-7"
                  >
                    عرض الكل
                  </Button>
                </div>
                <div className="space-y-2">
                  {recentTransactions.slice(0, 3).map((transaction) => {
                    const isPositive = transaction.amount > 0;
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isPositive ? 'bg-emerald-100' : 'bg-red-100'
                          }`}>
                            {isPositive ? (
                              <ArrowUp className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <ArrowDown className="w-4 h-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-gray-900">{transaction.note}</div>
                            <div className="text-[10px] text-gray-500">{transaction.date}</div>
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{transaction.amount} ر.س
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Orders */}
              <Card className="p-4 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-black text-gray-900 mb-3">آخر الطلبات</h3>
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-xs font-bold text-gray-900">{order.id}</div>
                        <div className="text-[10px] text-gray-500">{order.date} • {order.items} منتج</div>
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-black text-gray-900">{order.amount} ر.س</div>
                        <Badge className="text-[9px] bg-emerald-100 text-emerald-700 border-emerald-200">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="space-y-3">
              <Card className="p-4 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-black text-gray-900 mb-3">سجل التفاعلات</h3>
                <div className="space-y-3">
                  {timelineEvents.map((event, index) => {
                    const Icon = event.icon;
                    const showDate = index === 0 || timelineEvents[index - 1].date !== event.date;
                    return (
                      <React.Fragment key={event.id}>
                        {showDate && (
                          <div className="flex items-center gap-2 my-3">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className="text-xs font-bold text-gray-500 px-2">{event.date}</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                          </div>
                        )}
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            event.color.replace('text-', 'bg-').replace('-600', '-100')
                          }`}>
                            <Icon className={`w-5 h-5 ${event.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-black text-gray-900">{event.title}</h4>
                              <span className="text-[10px] text-gray-500">{event.time}</span>
                            </div>
                            <p className="text-xs text-gray-600">{event.description}</p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </Card>
            </TabsContent>

            {/* Deposits Tab */}
            <TabsContent value="deposits" className="space-y-3">
              <Card className="p-4 bg-white border border-gray-200 rounded-xl">
                <h3 className="text-sm font-black text-gray-900 mb-3">طلبات إضافة الرصيد</h3>
                {customerDepositRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <ArrowUp className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">لا توجد طلبات إيداع</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerDepositRequests.map((request) => (
                      <Card
                        key={request.id}
                        className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDepositRequest(request);
                          setShowDepositDetails(true);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-sm font-black text-gray-900">طلب إيداع</h4>
                              <Badge className={`text-[9px] font-bold px-1.5 py-0.5 ${
                                request.status === 'pending' 
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : request.status === 'approved'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                              }`}>
                                {request.status === 'pending' ? 'قيد المراجعة' : request.status === 'approved' ? 'معتمد' : 'مرفوض'}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">المصرف:</span>
                                <span className="font-bold text-gray-900">{request.bankName}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">الرقم المرجعي:</span>
                                <span className="font-mono font-bold text-gray-900">{request.referenceNumber}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gray-500">التاريخ:</span>
                                <span className="font-bold text-gray-900">{request.createdAt}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-base font-black text-gray-900 leading-none">
                              {request.amount.toLocaleString()} {getCurrencySymbol(request.currency)}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-3">
              <Card className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-black text-gray-900">ملاحظات خاصة</h3>
                  <Button
                    size="sm"
                    onClick={() => setShowAddNoteDialog(true)}
                    className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-8 px-3 font-bold text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 ml-1.5" />
                    إضافة ملاحظة
                  </Button>
                </div>
                {privateNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">لا توجد ملاحظات</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {privateNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-900 mb-2">{note.text}</p>
                        <div className="flex items-center justify-between text-[10px] text-gray-500">
                          <span>{note.createdBy}</span>
                          <span>{note.createdAt}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Note Dialog */}
      <Dialog open={showAddNoteDialog} onOpenChange={setShowAddNoteDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">إضافة ملاحظة خاصة</DialogTitle>
            <DialogDescription className="text-right text-sm text-gray-600">
              ملاحظات خاصة لا يراها العميل
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-bold text-gray-700 mb-2 block">الملاحظة</Label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="اكتب ملاحظتك هنا..."
                className="min-h-24 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={handleAddNote}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-sm"
            >
              إضافة الملاحظة
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAddNoteDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deposit Request Details Dialog */}
      <Dialog open={showDepositDetails} onOpenChange={setShowDepositDetails}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">تفاصيل طلب إضافة الرصيد</DialogTitle>
            <DialogDescription className="text-right text-sm text-gray-600">
              مراجعة تفاصيل العملية
            </DialogDescription>
          </DialogHeader>
          
          {selectedDepositRequest && (
            <div className="space-y-4 py-4">
              <Card className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700 font-bold">المبلغ</span>
                    <span className="text-lg font-black text-blue-900">
                      {selectedDepositRequest.amount.toLocaleString()} {getCurrencySymbol(selectedDepositRequest.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">المصرف:</span>
                    <span className="font-bold text-blue-900">{selectedDepositRequest.bankName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">رقم الحساب:</span>
                    <span className="font-mono text-blue-900">{selectedDepositRequest.accountNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">الرقم المرجعي:</span>
                    <span className="font-mono font-bold text-blue-900">{selectedDepositRequest.referenceNumber}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">تاريخ الطلب:</span>
                    <span className="font-bold text-blue-900">{selectedDepositRequest.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-blue-600">الحالة:</span>
                    <Badge className={`text-[9px] font-bold px-1.5 py-0.5 ${
                      selectedDepositRequest.status === 'pending' 
                        ? 'bg-amber-100 text-amber-700 border-amber-200'
                        : selectedDepositRequest.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                        : 'bg-red-100 text-red-700 border-red-200'
                    }`}>
                      {selectedDepositRequest.status === 'pending' ? 'قيد المراجعة' : selectedDepositRequest.status === 'approved' ? 'معتمد' : 'مرفوض'}
                    </Badge>
                  </div>
                  {selectedDepositRequest.reviewedAt && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-600">تاريخ المراجعة:</span>
                      <span className="font-bold text-blue-900">{selectedDepositRequest.reviewedAt}</span>
                    </div>
                  )}
                </div>
              </Card>

              {selectedDepositRequest.receiptUrl && (
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">إيصال الإيداع</Label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-bold text-gray-900">إيصال مرفق</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full h-9 text-xs"
                      onClick={() => window.open(selectedDepositRequest.receiptUrl, '_blank')}
                    >
                      <FileText className="w-3 h-3 ml-1.5" />
                      عرض الإيصال
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-col gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowDepositDetails(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

