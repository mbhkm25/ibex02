import { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Ban,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AdminLayout } from './AdminLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Business {
  id: string;
  name: string;
  logo: string;
  ownerName: string;
  ownerPhone: string;
  type: 'products' | 'services' | 'both';
  status: 'approved' | 'pending' | 'rejected' | 'suspended';
  customersCount: number;
  ordersCount: number;
  totalRevenue: number;
  subscriptionPackage?: string;
  subscriptionStatus?: 'active' | 'expired' | 'cancelled';
  createdAt: string;
  approvedDate?: string;
}

export function AdminBusinesses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'approved' | 'pending' | 'rejected' | 'suspended'>('all');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showBusinessDetails, setShowBusinessDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'suspended'>('all');

  // State for real data from API
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch businesses from API
  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true);
        setError(null);
        // TODO: Create API endpoint /api/admin/businesses
        // For now, return empty array - businesses come from activated service requests
        setBusinesses([]);
      } catch (err: any) {
        console.error('Failed to fetch businesses:', err);
        setError(err.message || 'فشل تحميل الأعمال');
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         business.ownerPhone.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || business.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'pending' && business.status === 'pending') ||
                      (activeTab === 'approved' && business.status === 'approved') ||
                      (activeTab === 'suspended' && business.status === 'suspended');
    return matchesSearch && matchesStatus && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const statuses = {
      approved: { label: 'معتمد', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
      pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
      suspended: { label: 'معلق', color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Ban },
    };
    return statuses[status as keyof typeof statuses] || statuses.pending;
  };

  const getTypeLabel = (type: string) => {
    const types = {
      products: 'منتجات',
      services: 'خدمات',
      both: 'منتجات وخدمات',
    };
    return types[type as keyof typeof types] || type;
  };

  const handleApprove = (id: string) => {
    // Logic to approve business
    console.log('Approve business:', id);
  };

  const handleReject = (id: string) => {
    // Logic to reject business
    console.log('Reject business:', id);
  };

  const handleSuspend = (id: string) => {
    // Logic to suspend business
    console.log('Suspend business:', id);
  };

  const stats = {
    total: businesses.length,
    approved: businesses.filter(b => b.status === 'approved').length,
    pending: businesses.filter(b => b.status === 'pending').length,
    suspended: businesses.filter(b => b.status === 'suspended').length,
  };

  if (loading) {
    return (
      <AdminLayout 
        title="إدارة المتاجر والأعمال" 
        subtitle="عرض وإدارة جميع المتاجر والأعمال في المنصة"
      >
        <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <h3 className="text-base font-black text-gray-900 mb-1">جاري التحميل...</h3>
          <p className="text-sm text-gray-600">يرجى الانتظار</p>
        </Card>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout 
        title="إدارة المتاجر والأعمال" 
        subtitle="عرض وإدارة جميع المتاجر والأعمال في المنصة"
      >
        <Card className="p-8 border-2 border-red-200 rounded-xl bg-red-50 text-center">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-base font-black text-red-900 mb-1">حدث خطأ</h3>
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title="إدارة المتاجر والأعمال" 
      subtitle="عرض وإدارة جميع المتاجر والأعمال في المنصة"
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">إجمالي الأعمال</div>
            <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">معتمدة</div>
            <div className="text-2xl font-black text-emerald-600">{stats.approved}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">قيد المراجعة</div>
            <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">معلقة</div>
            <div className="text-2xl font-black text-red-600">{stats.suspended}</div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو صاحب العمل..."
                className="pr-10 h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
              />
            </div>
            <Button variant="outline" className="h-11 rounded-xl border-2 border-gray-200">
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 rounded-xl bg-gray-100 p-1 h-11">
            <TabsTrigger value="all" className="rounded-lg text-xs font-bold">
              الكل ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="pending" className="rounded-lg text-xs font-bold">
              قيد المراجعة ({stats.pending})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg text-xs font-bold">
              معتمدة ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="suspended" className="rounded-lg text-xs font-bold">
              معلقة ({stats.suspended})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredBusinesses.length === 0 ? (
              <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-black text-gray-900 mb-1">لا توجد أعمال</h3>
                <p className="text-sm text-gray-600">
                  لم يتم تفعيل أي عمل بعد.<br />
                  الأعمال ستظهر هنا بعد تفعيلها من طلبات الخدمة.
                </p>
              </Card>
            ) : (
              filteredBusinesses.map((business) => {
              const statusBadge = getStatusBadge(business.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <Card key={business.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-14 h-14 border-2 border-gray-200 shrink-0 text-2xl">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        {business.logo}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 truncate">{business.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{business.ownerName} • {business.ownerPhone}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(business.type)}</p>
                        </div>
                        <Badge className={`text-[9px] px-2 py-0.5 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-0.5">
                            <Users className="w-3 h-3" />
                          </div>
                          <div className="text-sm font-black text-gray-900">{business.customersCount}</div>
                          <div className="text-[9px] text-gray-400">عميل</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-0.5">
                            <ShoppingBag className="w-3 h-3" />
                          </div>
                          <div className="text-sm font-black text-gray-900">{business.ordersCount}</div>
                          <div className="text-[9px] text-gray-400">طلب</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mb-0.5">
                            <DollarSign className="w-3 h-3" />
                          </div>
                          <div className="text-sm font-black text-gray-900">{business.totalRevenue.toLocaleString()}</div>
                          <div className="text-[9px] text-gray-400">ر.س</div>
                        </div>
                      </div>

                      {business.subscriptionPackage && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">الباقة:</span>
                            <span className="font-bold text-gray-900">{business.subscriptionPackage}</span>
                            {business.subscriptionStatus === 'expired' && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-[9px]">
                                منتهية
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => {
                          setSelectedBusiness(business);
                          setShowBusinessDetails(true);
                        }}>
                          <Eye className="w-4 h-4 ml-2" />
                          عرض التفاصيل
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="w-4 h-4 ml-2" />
                          تعديل
                        </DropdownMenuItem>
                        {business.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleApprove(business.id)} className="text-emerald-600">
                              <CheckCircle className="w-4 h-4 ml-2" />
                              اعتماد
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReject(business.id)} className="text-red-600">
                              <XCircle className="w-4 h-4 ml-2" />
                              رفض
                            </DropdownMenuItem>
                          </>
                        )}
                        {business.status === 'approved' && (
                          <DropdownMenuItem onClick={() => handleSuspend(business.id)} className="text-red-600">
                            <Ban className="w-4 h-4 ml-2" />
                            تعطيل
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Business Details Dialog */}
        <Dialog open={showBusinessDetails} onOpenChange={setShowBusinessDetails}>
          <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل العمل</DialogTitle>
              <DialogDescription>
                {selectedBusiness?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedBusiness && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">اسم العمل</div>
                    <div className="text-sm font-bold">{selectedBusiness.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">النوع</div>
                    <div className="text-sm font-bold">{getTypeLabel(selectedBusiness.type)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">صاحب العمل</div>
                    <div className="text-sm font-bold">{selectedBusiness.ownerName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">رقم الهاتف</div>
                    <div className="text-sm font-bold">{selectedBusiness.ownerPhone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">الحالة</div>
                    <Badge className={getStatusBadge(selectedBusiness.status).color}>
                      {getStatusBadge(selectedBusiness.status).label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</div>
                    <div className="text-sm font-bold">{selectedBusiness.createdAt}</div>
                  </div>
                </div>
                {selectedBusiness.subscriptionPackage && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">معلومات الاشتراك</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">الباقة:</span>
                        <span className="text-sm font-bold">{selectedBusiness.subscriptionPackage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">الحالة:</span>
                        <Badge className={selectedBusiness.subscriptionStatus === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
                          {selectedBusiness.subscriptionStatus === 'active' ? 'نشط' : 'منتهي'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBusinessDetails(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

