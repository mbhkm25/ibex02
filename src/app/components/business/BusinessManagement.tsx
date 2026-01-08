import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Edit,
  Trash2,
  Copy,
  Check,
  CheckCircle,
  Package,
  Megaphone,
  Plus,
  User,
  CreditCard,
  ArrowLeftRight,
  Building2,
  Calendar,
  DollarSign,
  Users,
  ShoppingBag,
  Wallet,
  TrendingUp,
  Phone,
  ChevronLeft,
  Ban,
  History,
  Tag,
  Star,
  MessageCircle,
  MoreVertical
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CustomerCategoryDialog } from './CustomerCategoryDialog';
import { CustomerCreditApprovalDialog } from './CustomerCreditApprovalDialog';
import { CustomerRatingDialog } from './CustomerRatingDialog';
import { CustomerSuspendDialog } from './CustomerSuspendDialog';

interface Customer {
  id: string;
  name: string;
  phone: string;
  balance: number;
  creditStatus: 'نقدي' | 'آجل' | 'مقيد';
  creditLimit: number;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  notes: string;
}

export function BusinessManagement() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [activeSection, setActiveSection] = useState<'overview' | 'customers' | 'orders' | 'cashier' | 'currency' | 'bank' | 'subscription'>('overview');
  const [showAddBankAccount, setShowAddBankAccount] = useState(false);
  const [newBankAccount, setNewBankAccount] = useState({ bankName: '', accountNumber: '', notes: '' });
  const [copiedAccountId, setCopiedAccountId] = useState<string | null>(null);
  const [showCustomerMoreActions, setShowCustomerMoreActions] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showCreditDialog, setShowCreditDialog] = useState(false);
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showSuspendDialog, setShowSuspendDialog] = useState(false);

  // Mock data
  const business = {
    id: businessId || '1',
    name: 'سوبر ماركت الرحمة',
    logo: '🏪'
  };

  const customers: Customer[] = [
    { id: '1', name: 'أحمد محمد', phone: '+966501234567', balance: 250, creditStatus: 'نقدي', creditLimit: 0 },
    { id: '2', name: 'فاطمة علي', phone: '+966507654321', balance: -45, creditStatus: 'آجل', creditLimit: 500 },
    { id: '3', name: 'خالد سعيد', phone: '+966509876543', balance: 180, creditStatus: 'نقدي', creditLimit: 0 },
    { id: '4', name: 'سارة أحمد', phone: '+966501112233', balance: 320, creditStatus: 'آجل', creditLimit: 1000 },
  ];

  const bankAccounts: BankAccount[] = [
    { id: '1', bankName: 'البنك الأهلي', accountNumber: 'SA1234567890123456789012', notes: 'الحساب الرئيسي' },
    { id: '2', bankName: 'STC Pay', accountNumber: '0501234567', notes: 'محفظة إلكترونية' },
  ];

  const orders = [
    { id: '#1234', customer: 'أحمد محمد', date: 'اليوم، 2:30 م', amount: 250, status: 'مكتمل' },
    { id: '#1235', customer: 'فاطمة علي', date: 'أمس، 7:15 م', amount: 180, status: 'قيد التنفيذ' },
    { id: '#1236', customer: 'خالد سعيد', date: '13 يناير', amount: 320, status: 'مكتمل' },
  ];

  const totalDebt = customers.filter(c => c.balance > 0).reduce((sum, c) => sum + c.balance, 0);
  const totalCredit = customers.filter(c => c.balance < 0).reduce((sum, c) => sum + Math.abs(c.balance), 0);
  const activeCredit = customers.filter(c => c.creditStatus === 'آجل').length;

  const handleCustomerAction = (customerId: string, action: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    setSelectedCustomer(customer);
    setShowCustomerMoreActions(null);

    switch (action) {
      case 'سجل العمليات':
        navigate(`/business/${businessId}/customer/${customerId}/history`);
        break;
      case 'محادثة':
        navigate(`/business/${businessId}/customer/${customerId}/chat`);
        break;
      case 'تصنيف فئة':
        setShowCategoryDialog(true);
        break;
      case 'اعتماد الآجل':
        setShowCreditDialog(true);
        break;
      case 'تقييم العميل':
        setShowRatingDialog(true);
        break;
      case 'إيقاف الحساب':
        setShowSuspendDialog(true);
        break;
      default:
        toast.info(`إجراء ${action} للعميل ${customerId}`);
    }
  };

  const handleAddBankAccount = () => {
    if (!newBankAccount.bankName || !newBankAccount.accountNumber) {
      toast.error('يرجى إدخال جميع الحقول المطلوبة');
      return;
    }
    toast.success('تم إضافة الحساب البنكي');
    setShowAddBankAccount(false);
    setNewBankAccount({ bankName: '', accountNumber: '', notes: '' });
  };

  const handleCopyAccountNumber = (accountNumber: string, accountId: string) => {
    navigator.clipboard.writeText(accountNumber);
    setCopiedAccountId(accountId);
    toast.success('تم نسخ رقم الحساب');
    setTimeout(() => setCopiedAccountId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/business')}
            className="h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-gray-900 truncate">{business.name}</h1>
            <p className="text-xs text-gray-500">إدارة العمل</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/business/${businessId}/products`)}
            className="h-9 w-9 rounded-xl"
          >
            <Package className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="pb-20">
        {/* Overview Section */}
        {activeSection === 'overview' && (
          <div className="space-y-3 p-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-blue-700" />
                    <span className="text-[10px] font-bold text-blue-700">دائن</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-black text-blue-900 leading-none">{totalDebt.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-blue-600 mt-0.5">ر.س</div>
                  </div>
                </div>
              </Card>
              <Card className="p-2.5 bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-red-700" />
                    <span className="text-[10px] font-bold text-red-700">مدين</span>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-black text-red-900 leading-none">{totalCredit.toLocaleString()}</div>
                    <div className="text-[9px] font-bold text-red-600 mt-0.5">ر.س</div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-1.5">
              <Button
                onClick={() => navigate(`/business/${businessId}/products`)}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <Package className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">المنتجات والخدمات</div>
                  <div className="text-[10px] text-gray-500 font-normal">إدارة المنتجات</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => navigate(`/business/${businessId}/offers`)}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <Megaphone className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">العروض والإعلانات</div>
                  <div className="text-[10px] text-gray-500 font-normal">إدارة العروض</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => setActiveSection('customers')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <Users className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">العملاء</div>
                  <div className="text-[10px] text-gray-500 font-normal">{customers.length} عميل</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => setActiveSection('orders')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <ShoppingBag className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">الطلبات</div>
                  <div className="text-[10px] text-gray-500 font-normal">{orders.length} طلب</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => setActiveSection('cashier')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <User className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">الكاشير</div>
                  <div className="text-[10px] text-gray-500 font-normal">إدارة الكاشير</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => setActiveSection('currency')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <ArrowLeftRight className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">صرف العملات</div>
                  <div className="text-[10px] text-gray-500 font-normal">تسجيل العمليات</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => setActiveSection('bank')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <Wallet className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">الحسابات البنكية</div>
                  <div className="text-[10px] text-gray-500 font-normal">{bankAccounts.length} حساب</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
              <Button
                onClick={() => setActiveSection('subscription')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <CreditCard className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">باقة الاشتراك</div>
                  <div className="text-[10px] text-gray-500 font-normal">إدارة الاشتراك</div>
                </div>
                <ChevronLeft className="w-4 h-4 text-gray-400" />
              </Button>
            </div>
          </div>
        )}

        {/* Customers Section */}
        {activeSection === 'customers' && (
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-base font-black text-gray-900">العملاء</h2>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-8 px-3 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 ml-1.5" />
                عميل جديد
              </Button>
            </div>
            <div className="space-y-3">
              {customers.map((customer) => (
                <Card
                  key={customer.id}
                  className="p-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all shadow-sm"
                >
                  {/* الطبقة الأولى: الهوية */}
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-gray-200 shrink-0 shadow-sm">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-black">
                        {customer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-black text-gray-900 truncate">{customer.name}</h3>
                        <Badge
                          variant={customer.creditStatus === 'آجل' ? 'default' : 'secondary'}
                          className="text-[10px] font-bold px-2 py-0.5 shrink-0"
                        >
                          {customer.creditStatus}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* الطبقة الثانية: الوضع المالي */}
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-end justify-between">
                      <div>
                        <div className="text-[10px] text-gray-500 mb-1 font-medium">الرصيد الحالي</div>
                        <div className={`text-2xl font-black leading-none ${customer.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {customer.balance >= 0 ? '+' : ''}{customer.balance}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">ر.س</div>
                      </div>
                      {customer.creditLimit > 0 && (
                        <div className="text-right">
                          <div className="text-[10px] text-gray-500 mb-1 font-medium">سقف الآجل</div>
                          <div className="text-lg font-black text-gray-900">{customer.creditLimit}</div>
                          <div className="text-xs text-gray-500 mt-0.5">ر.س</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* الطبقة الثالثة: الإجراءات */}
                  <div className="space-y-2">
                    {/* Primary Action */}
                    <Button
                      onClick={() => handleCustomerAction(customer.id, 'كشف حساب')}
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-sm"
                    >
                      كشف حساب
                    </Button>
                    
                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCustomerAction(customer.id, 'اعتماد رصيد')}
                        className="flex-1 h-10 text-xs font-bold rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        اعتماد رصيد
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCustomerAction(customer.id, 'سجل العمليات')}
                        className="flex-1 h-10 text-xs font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50"
                      >
                        <History className="w-4 h-4 ml-1.5" />
                        السجل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCustomerAction(customer.id, 'محادثة')}
                        className="flex-1 h-10 text-xs font-bold rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <MessageCircle className="w-4 h-4 ml-1.5" />
                        محادثة
                      </Button>
                    </div>

                    {/* More Actions Menu */}
                    <div className="relative">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowCustomerMoreActions(showCustomerMoreActions === customer.id ? null : customer.id)}
                        className="w-full h-9 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-xl"
                      >
                        <MoreVertical className="w-4 h-4 ml-1.5" />
                        المزيد من الإجراءات
                      </Button>
                      {showCustomerMoreActions === customer.id && (
                        <div className="mt-2 p-2 bg-gray-50 rounded-xl space-y-1 border border-gray-200">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleCustomerAction(customer.id, 'إيقاف الحساب');
                              setShowCustomerMoreActions(null);
                            }}
                            className="w-full h-8 justify-start text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Ban className="w-3.5 h-3.5 ml-2" />
                            إيقاف الحساب
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleCustomerAction(customer.id, 'تصنيف فئة');
                              setShowCustomerMoreActions(null);
                            }}
                            className="w-full h-8 justify-start text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                          >
                            <Tag className="w-3.5 h-3.5 ml-2" />
                            تصنيف فئة حساب العميل
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleCustomerAction(customer.id, 'اعتماد الآجل');
                              setShowCustomerMoreActions(null);
                            }}
                            className="w-full h-8 justify-start text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                          >
                            <CreditCard className="w-3.5 h-3.5 ml-2" />
                            اعتماد ميزة الشراء بالآجل (تسقيف)
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              handleCustomerAction(customer.id, 'تقييم العميل');
                              setShowCustomerMoreActions(null);
                            }}
                            className="w-full h-8 justify-start text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                          >
                            <Star className="w-3.5 h-3.5 ml-2" />
                            تقييم العميل
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Orders Section */}
        {activeSection === 'orders' && (
          <div className="space-y-2 p-4">
            <h2 className="text-base font-black text-gray-900">الطلبات</h2>
          <div className="space-y-1.5">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
              >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <h3 className="text-sm font-black text-gray-900">{order.id}</h3>
                        <Badge
                          className={`text-[9px] font-bold px-1.5 py-0.5 ${
                            order.status === 'مكتمل'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {order.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mb-0.5">{order.customer}</div>
                      <div className="text-[10px] text-gray-500">{order.date}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-base font-black text-gray-900">{order.amount} ر.س</div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-1.5 border-t border-gray-100">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-[10px] font-bold rounded-lg border-gray-200"
                    >
                      عرض التفاصيل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8 text-[10px] font-bold rounded-lg border-gray-200"
                    >
                      طباعة
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Cashier Section */}
        {activeSection === 'cashier' && (
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-base font-black text-gray-900">الكاشير</h2>
              <Button
                size="sm"
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-8 px-3 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 ml-1.5" />
                إضافة كاشير
              </Button>
            </div>
            <Card className="p-6 bg-white border border-gray-200 rounded-xl text-center">
              <User className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-gray-600 mb-0.5">لا يوجد كاشير مرتبط</p>
              <p className="text-[10px] text-gray-500">قم بإضافة كاشير للبدء في استلام المدفوعات</p>
            </Card>
          </div>
        )}

        {/* Currency Exchange Section */}
        {activeSection === 'currency' && (
          <div className="space-y-2 p-4">
            <h2 className="text-base font-black text-gray-900">صرف وتحويل العملات</h2>
            <Card className="p-3 bg-white border border-gray-200 rounded-xl">
              <div className="space-y-2">
                <div>
                  <Label className="text-[10px] font-bold text-gray-700 mb-1 block">نوع العملية</Label>
                  <select title="نوع العملية" className="w-full h-10 rounded-lg border-2 border-gray-200 px-2.5 font-bold text-xs focus:border-blue-400 focus:ring-1 focus:ring-blue-200">
                    <option>صرف</option>
                    <option>تحويل</option>
                  </select>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-gray-700 mb-1 block">المبلغ</Label>
                  <Input
                    className="w-full h-10 rounded-lg border-2 border-gray-200 text-sm font-bold focus:border-blue-400"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] font-bold text-gray-700 mb-1 block">من</Label>
                    <select title="من" className="w-full h-10 rounded-lg border-2 border-gray-200 px-2.5 font-bold text-xs focus:border-blue-400">
                      <option>ريال سعودي</option>
                      <option>دولار</option>
                      <option>يورو</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-[10px] font-bold text-gray-700 mb-1 block">إلى</Label>
                    <select title="إلى" className="w-full h-10 rounded-lg border-2 border-gray-200 px-2.5 font-bold text-xs focus:border-blue-400">
                      <option>ريال سعودي</option>
                      <option>دولار</option>
                      <option>يورو</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-black text-xs mt-2">
                  <ArrowLeftRight className="w-3.5 h-3.5 ml-1.5" />
                  تسجيل العملية
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Bank Accounts Section */}
        {activeSection === 'bank' && (
          <div className="space-y-2 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <h2 className="text-base font-black text-gray-900">الحسابات البنكية</h2>
              <Button
                size="sm"
                onClick={() => setShowAddBankAccount(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-8 px-3 font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 ml-1.5" />
                إضافة
              </Button>
            </div>
            <div className="space-y-1.5">
              {bankAccounts.map((account) => (
                <Card
                  key={account.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-sm font-black text-gray-900 mb-0.5">{account.bankName}</h3>
                      <p className="text-[10px] text-gray-500">{account.notes}</p>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="text-[9px] text-gray-500 mb-0.5">رقم الحساب</div>
                        <div className="text-xs font-bold text-gray-900 font-mono truncate">{account.accountNumber}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyAccountNumber(account.accountNumber, account.id)}
                        className="h-7 w-7 p-0 rounded-lg hover:bg-blue-50 shrink-0"
                      >
                        {copiedAccountId === account.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </Button>
                    </div>
                    <div className="flex gap-1.5 pt-1.5 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-[10px] font-bold rounded-lg border-gray-200"
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-8 text-[10px] font-bold rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subscription Section */}
        {activeSection === 'subscription' && (
          <div className="space-y-2 p-4">
            <h2 className="text-base font-black text-gray-900">باقة الاشتراك</h2>
            <Card className="p-3 bg-white border border-gray-200 rounded-xl">
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200/50">
                    <div className="flex items-center gap-1 mb-1">
                      <Building2 className="w-3 h-3 text-blue-700" />
                      <span className="text-[9px] font-bold text-blue-700 uppercase">الباقة</span>
                    </div>
                    <div className="text-sm font-black text-blue-900">باقة أساسية</div>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-lg border border-emerald-200/50">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="w-3 h-3 text-emerald-700" />
                      <span className="text-[9px] font-bold text-emerald-700 uppercase">التجديد</span>
                    </div>
                    <div className="text-sm font-black text-emerald-900">15 فبراير</div>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg border border-amber-200/50">
                    <div className="flex items-center gap-1 mb-1">
                      <DollarSign className="w-3 h-3 text-amber-700" />
                      <span className="text-[9px] font-bold text-amber-700 uppercase">الشهري</span>
                    </div>
                    <div className="text-sm font-black text-amber-900">500 ر.س</div>
                  </div>
                  <div className="p-2 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-lg border border-purple-200/50">
                    <div className="flex items-center gap-1 mb-1">
                      <CheckCircle className="w-3 h-3 text-purple-700" />
                      <span className="text-[9px] font-bold text-purple-700 uppercase">الحالة</span>
                    </div>
                    <div className="text-sm font-black text-emerald-700">نشط</div>
                  </div>
                </div>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-black text-xs">
                  <CreditCard className="w-3.5 h-3.5 ml-1.5" />
                  تجديد الاشتراك
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] lg:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          <button
            onClick={() => setActiveSection('overview')}
            className={`flex flex-col items-center gap-1 flex-1 h-full transition-colors ${
              activeSection === 'overview' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Building2 className={`w-5 h-5 transition-transform ${activeSection === 'overview' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold">الرئيسية</span>
          </button>
          <button
            onClick={() => setActiveSection('customers')}
            className={`flex flex-col items-center gap-1 flex-1 h-full transition-colors ${
              activeSection === 'customers' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Users className={`w-5 h-5 transition-transform ${activeSection === 'customers' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold">العملاء</span>
          </button>
          <button
            onClick={() => setActiveSection('orders')}
            className={`flex flex-col items-center gap-1 flex-1 h-full transition-colors ${
              activeSection === 'orders' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <ShoppingBag className={`w-5 h-5 transition-transform ${activeSection === 'orders' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold">الطلبات</span>
          </button>
          <button
            onClick={() => setActiveSection('bank')}
            className={`flex flex-col items-center gap-1 flex-1 h-full transition-colors ${
              activeSection === 'bank' ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Wallet className={`w-5 h-5 transition-transform ${activeSection === 'bank' ? 'scale-110' : ''}`} />
            <span className="text-[10px] font-bold">الحسابات</span>
          </button>
        </div>
      </nav>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddBankAccount} onOpenChange={setShowAddBankAccount}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">إضافة حساب بنكي</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">اسم المصرف/المحفظة</Label>
              <Input
                value={newBankAccount.bankName}
                onChange={(e) => setNewBankAccount({ ...newBankAccount, bankName: e.target.value })}
                className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="مثال: البنك الأهلي"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">رقم الحساب</Label>
              <Input
                value={newBankAccount.accountNumber}
                onChange={(e) => setNewBankAccount({ ...newBankAccount, accountNumber: e.target.value })}
                className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="رقم الحساب أو رقم المحفظة"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">ملاحظة</Label>
              <Input
                value={newBankAccount.notes}
                onChange={(e) => setNewBankAccount({ ...newBankAccount, notes: e.target.value })}
                className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="ملاحظات إضافية (اختياري)"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={handleAddBankAccount}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-sm"
            >
              إضافة
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAddBankAccount(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Action Dialogs */}
      {selectedCustomer && (
        <>
          <CustomerCategoryDialog
            open={showCategoryDialog}
            onOpenChange={setShowCategoryDialog}
            customerName={selectedCustomer.name}
          />
          <CustomerCreditApprovalDialog
            open={showCreditDialog}
            onOpenChange={setShowCreditDialog}
            customerName={selectedCustomer.name}
            currentLimit={selectedCustomer.creditLimit}
          />
          <CustomerRatingDialog
            open={showRatingDialog}
            onOpenChange={setShowRatingDialog}
            customerName={selectedCustomer.name}
          />
          <CustomerSuspendDialog
            open={showSuspendDialog}
            onOpenChange={setShowSuspendDialog}
            customerName={selectedCustomer.name}
            isSuspended={false}
          />
        </>
      )}

    </div>
  );
}
