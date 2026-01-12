import React, { useState, useEffect } from 'react';
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
  MoreVertical,
  ArrowUp,
  X,
  Info,
  AlertCircle,
  QrCode,
  Upload,
  FileImage
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
import { DashboardLayout } from '../layout/DashboardLayout';
import { uploadFile } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';

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

interface DepositRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  bankId: string;
  bankName: string;
  accountNumber: string;
  referenceNumber: string;
  amount: number;
  currency: 'SAR' | 'YER' | 'USD';
  receiptUrl?: string;
  receiptType?: 'pdf' | 'image';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export function BusinessManagement() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const { getAccessToken } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'customers' | 'orders' | 'cashier' | 'currency' | 'bank' | 'subscription' | 'deposits'>('overview');
  const [selectedDepositRequest, setSelectedDepositRequest] = useState<DepositRequest | null>(null);
  const [showDepositDetails, setShowDepositDetails] = useState(false);
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

  // TODO: Fetch business profile from API
  // This feature requires business activation
  // All data must come from database via API
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveBusiness, setHasActiveBusiness] = useState(false);
  
  // Logo state
  const [logoFile, setLogoFile] = useState<any>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Empty state data - no mock data allowed
  const customers: Customer[] = [];
  const bankAccounts: BankAccount[] = [];
  const orders: any[] = [];
  const depositRequests: DepositRequest[] = [];
  const pendingDeposits: DepositRequest[] = [];
  
  const totalDebt = 0;
  const totalCredit = 0;
  const activeCredit = 0;

  // Check if business is activated and fetch logo
  useEffect(() => {
    // TODO: Check if user has activated business
    // For now, assume no active business
    setHasActiveBusiness(false);
    setLoading(false);
    
    // TODO: Fetch business logo from API
    // For now, logo will be fetched when business data is loaded
  }, [businessId]);
  
  // Fetch logo when business has logo_file_id
  useEffect(() => {
    const fetchLogo = async () => {
      if (!business?.logo_file_id || !businessId) return;
      
      try {
        // TODO: Fetch logo metadata via Data API
        // For now, we'll use a serverless endpoint to get signed URL
        const token = await getAccessToken();
        const response = await fetch(`/api/storage?action=download-url&file_id=${business.logo_file_id}`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          setLogoUrl(data.data.downloadUrl);
        }
      } catch (error) {
        console.error('Failed to fetch logo:', error);
      }
    };
    
    fetchLogo();
  }, [business?.logo_file_id, businessId]);
  
  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !businessId) return;
    
    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      setLogoError('يجب أن يكون الملف صورة');
      return;
    }
    
    // Validate file size (2MB max for logo)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setLogoError(`حجم الملف (${(file.size / 1024 / 1024).toFixed(2)}MB) يتجاوز الحد الأقصى المسموح (2MB)`);
      return;
    }
    
    setUploadingLogo(true);
    setLogoError(null);
    
    try {
      const token = await getAccessToken();

      // STEP 1: Upload file
      const uploadResult = await uploadFile({
        file,
        businessId,
        originalFilename: file.name,
        metadata: { type: 'logo' },
        token,
      });
      
      // STEP 2: Update business logo
      const updateResponse = await fetch('/api/business/update-logo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          business_id: businessId,
          file_id: uploadResult.id,
        }),
      });
      
      if (!updateResponse.ok) {
        const error = await updateResponse.json().catch(() => ({ message: 'Failed to update logo' }));
        throw new Error(error.message || 'فشل تحديث الشعار');
      }
      
      const updateData = await updateResponse.json();
      
      // STEP 3: Update local state
      setBusiness((prev: any) => ({
        ...prev,
        logo_file_id: updateData.data.logo_file_id,
      }));
      
      // STEP 4: Fetch new logo URL
      const downloadResponse = await fetch(`/api/storage?action=download-url&file_id=${uploadResult.id}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (downloadResponse.ok) {
        const downloadData = await downloadResponse.json();
        setLogoUrl(downloadData.data.downloadUrl);
      }
      
      toast.success('تم رفع الشعار بنجاح!');
      
    } catch (error: any) {
      console.error('Logo upload error:', error);
      setLogoError(error.message || 'حدث خطأ أثناء رفع الشعار');
      toast.error(error.message || 'فشل رفع الشعار');
    } finally {
      setUploadingLogo(false);
      // Reset file input
      event.target.value = '';
    }
  };

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

  const handleApproveDeposit = (requestId: string) => {
    const request = depositRequests.find(r => r.id === requestId);
    if (!request) return;
    
    toast.success(`تم اعتماد إضافة رصيد بقيمة ${request.amount} ${request.currency === 'SAR' ? 'ر.س' : request.currency === 'YER' ? 'ر.ي' : '$'} للعميل ${request.customerName}`);
    setShowDepositDetails(false);
    setSelectedDepositRequest(null);
  };

  const handleRejectDeposit = (requestId: string) => {
    const request = depositRequests.find(r => r.id === requestId);
    if (!request) return;
    
    toast.info(`تم رفض طلب إضافة الرصيد للعميل ${request.customerName}`);
    setShowDepositDetails(false);
    setSelectedDepositRequest(null);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return 'ر.س';
    }
  };

  // Show empty state if business is not activated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveBusiness) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <DashboardLayout title="إدارة العمل">
          <div className="p-6">
            <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-black text-gray-900 mb-2">العمل غير مفعّل</h2>
              <p className="text-sm text-gray-600 mb-6">
                هذه الميزة متاحة فقط بعد تفعيل عملك.<br />
                يرجى الانتظار حتى يتم اعتماد طلبك وتفعيل العمل من قبل المسؤول.
              </p>
              <Button
                onClick={() => navigate('/business/my-requests')}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 px-6 font-black"
              >
                عرض طلباتي
              </Button>
            </Card>
          </div>
        </DashboardLayout>
      </div>
    );
  }

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
            <h1 className="text-lg font-black text-gray-900 truncate">{business?.name || 'إدارة العمل'}</h1>
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
            {/* Logo Section */}
            <Card className="p-4 bg-white border-2 border-gray-200 rounded-xl">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-gray-900">شعار العمل</h3>
                  <label className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload"
                    />
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs font-bold rounded-lg border-2 border-gray-200 hover:bg-gray-50"
                      disabled={uploadingLogo}
                    >
                      <span>
                        {uploadingLogo ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-900 ml-1.5"></div>
                            جاري الرفع...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 ml-1.5" />
                            {logoUrl ? 'تغيير الشعار' : 'رفع شعار'}
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
                
                {logoError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{logoError}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-center p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Business Logo"
                      className="max-w-full max-h-32 object-contain rounded-lg"
                      onError={() => {
                        setLogoUrl(null);
                        toast.error('فشل تحميل الشعار');
                      }}
                    />
                  ) : (
                    <div className="text-center">
                      <FileImage className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs text-gray-500 font-medium">لا يوجد شعار</p>
                      <p className="text-[10px] text-gray-400 mt-1">حد أقصى 2MB</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
            
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
                onClick={() => navigate(`/business/${businessId}/qr`)}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2"
              >
                <QrCode className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">إنشاء QR Code</div>
                  <div className="text-[10px] text-gray-500 font-normal">إنشاء رموز QR</div>
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
              <Button
                onClick={() => setActiveSection('deposits')}
                className="w-full h-11 bg-white border-2 border-gray-200 rounded-xl justify-start font-bold text-sm hover:bg-gray-50 py-2 relative"
              >
                <ArrowUp className="w-4 h-4 ml-2 text-gray-700" />
                <div className="flex-1 text-right">
                  <div className="text-gray-900 text-sm">طلبات الإيداع</div>
                  <div className="text-[10px] text-gray-500 font-normal">{pendingDeposits.length} طلب قيد المراجعة</div>
                </div>
                {pendingDeposits.length > 0 && (
                  <Badge className="absolute left-2 top-2 bg-red-500 text-white text-[9px] px-1.5 py-0 h-4 min-w-4 flex items-center justify-center font-black">
                    {pendingDeposits.length}
                  </Badge>
                )}
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
                    
                    {/* Pending Deposit Request Notification */}
                    {depositRequests.filter(d => d.customerId === customer.id && d.status === 'pending').length > 0 && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-bold text-amber-900">
                              طلب إيداع قيد المراجعة
                            </p>
                            <p className="text-[10px] text-amber-700">
                              {depositRequests.filter(d => d.customerId === customer.id && d.status === 'pending').length} طلب يحتاج للمراجعة
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveSection('deposits');
                              const pendingRequest = depositRequests.find(d => d.customerId === customer.id && d.status === 'pending');
                              if (pendingRequest) {
                                setSelectedDepositRequest(pendingRequest);
                                setShowDepositDetails(true);
                              }
                            }}
                            className="h-7 px-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                          >
                            مراجعة
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* الطبقة الثالثة: الإجراءات */}
                  <div className="space-y-2">
                    {/* Primary Action */}
                    <Button
                      onClick={() => navigate(`/business/${businessId}/customer/${customer.id}`)}
                      className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold text-sm shadow-sm"
                    >
                      ملف العميل
                    </Button>
                    <Button
                      onClick={() => handleCustomerAction(customer.id, 'كشف حساب')}
                      variant="outline"
                      className="w-full h-10 border-2 border-gray-200 rounded-xl font-bold text-xs"
                    >
                      كشف حساب
                    </Button>
                    
                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const pendingRequest = depositRequests.find(d => d.customerId === customer.id && d.status === 'pending');
                          if (pendingRequest) {
                            setSelectedDepositRequest(pendingRequest);
                            setShowDepositDetails(true);
                          } else {
                            handleCustomerAction(customer.id, 'اعتماد رصيد');
                          }
                        }}
                        className="flex-1 h-10 text-xs font-bold rounded-xl border-2 border-blue-200 text-blue-700 hover:bg-blue-50 relative"
                      >
                        {depositRequests.filter(d => d.customerId === customer.id && d.status === 'pending').length > 0 ? (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 ml-1.5" />
                            مراجعة طلب
                            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 h-3 min-w-3 flex items-center justify-center font-black">
                              {depositRequests.filter(d => d.customerId === customer.id && d.status === 'pending').length}
                            </Badge>
                          </>
                        ) : (
                          'اعتماد رصيد'
                        )}
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

      {/* Deposit Request Details Dialog */}
      <Dialog open={showDepositDetails} onOpenChange={setShowDepositDetails}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">تفاصيل طلب إضافة الرصيد</DialogTitle>
            <DialogDescription className="text-right text-sm text-gray-600">
              مراجعة تفاصيل العملية قبل الاعتماد
            </DialogDescription>
          </DialogHeader>
          
          {selectedDepositRequest && (
            <div className="space-y-4 py-4">
              {/* Customer Info */}
              <Card className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">العميل:</span>
                    <span className="font-black text-gray-900">{selectedDepositRequest.customerName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">الهاتف:</span>
                    <span className="font-bold text-gray-900">{selectedDepositRequest.customerPhone}</span>
                  </div>
                </div>
              </Card>

              {/* Deposit Details */}
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
                </div>
              </Card>

              {/* Receipt */}
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

              {/* Info Message */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-2 text-xs text-amber-700">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>يرجى المطابقة مع العمليات في حسابك البنكي قبل الاعتماد</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-2">
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button
                onClick={() => selectedDepositRequest && handleApproveDeposit(selectedDepositRequest.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 font-black text-sm"
              >
                <CheckCircle className="w-4 h-4 ml-1.5" />
                اعتماد
              </Button>
              <Button
                onClick={() => selectedDepositRequest && handleRejectDeposit(selectedDepositRequest.id)}
                variant="outline"
                className="border-2 border-red-200 text-red-700 hover:bg-red-50 rounded-xl h-12 font-black text-sm"
              >
                <X className="w-4 h-4 ml-1.5" />
                رفض
              </Button>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowDepositDetails(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
