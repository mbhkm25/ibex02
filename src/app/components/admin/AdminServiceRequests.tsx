import { useState } from 'react';
import { 
  FileText, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Building2,
  Mail,
  Phone,
  MapPin,
  User
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AdminLayout } from './AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';

interface ServiceRequest {
  id: string;
  businessName: string;
  ownerName: string;
  contactInfo: string;
  address: string;
  managerPhone: string;
  email?: string;
  description: string;
  businessType: 'products' | 'services' | 'both';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  logo?: string;
}

export function AdminServiceRequests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Mock Data
  const requests: ServiceRequest[] = [
    {
      id: '1',
      businessName: 'سوبر ماركت النور',
      ownerName: 'محمد أحمد',
      contactInfo: '+966501234567',
      address: 'الرياض، حي النرجس',
      managerPhone: '+966507654321',
      email: 'mohammed@example.com',
      description: 'نريد خدمة إدارة العملاء لإدارة عملائنا وطلباتهم',
      businessType: 'both',
      status: 'pending',
      createdAt: '2024-01-20'
    },
    {
      id: '2',
      businessName: 'مطعم الشام',
      ownerName: 'فاطمة علي',
      contactInfo: '+966509876543',
      address: 'جدة، حي الزهراء',
      managerPhone: '+966501112233',
      description: 'نحتاج إلى نظام إدارة عملاء متكامل',
      businessType: 'both',
      status: 'pending',
      createdAt: '2024-01-18'
    },
    {
      id: '3',
      businessName: 'صالون الجمال',
      ownerName: 'سارة خالد',
      contactInfo: '+966505556677',
      address: 'الدمام، حي الفيصلية',
      managerPhone: '+966508889900',
      email: 'sara@example.com',
      description: 'طلب خدمة إدارة العملاء',
      businessType: 'services',
      status: 'approved',
      createdAt: '2024-01-15',
      reviewedAt: '2024-01-16',
      reviewedBy: 'مدير المنصة'
    },
    {
      id: '4',
      businessName: 'محل الأجهزة',
      ownerName: 'خالد سعيد',
      contactInfo: '+966504445566',
      address: 'الرياض، حي العليا',
      managerPhone: '+966507778899',
      description: 'نريد خدمة إدارة العملاء',
      businessType: 'products',
      status: 'rejected',
      createdAt: '2024-01-12',
      reviewedAt: '2024-01-13',
      reviewedBy: 'مدير المنصة'
    },
  ];

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.contactInfo.includes(searchQuery);
    const matchesTab = activeTab === 'all' || request.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: string) => {
    const statuses = {
      pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
      approved: { label: 'معتمد', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle },
      rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
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
    toast.success('تم اعتماد الطلب بنجاح');
    // Logic to approve request
  };

  const handleReject = (id: string) => {
    toast.error('تم رفض الطلب');
    // Logic to reject request
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <AdminLayout 
      title="طلبات الخدمات" 
      subtitle="مراجعة واعتماد طلبات خدمة إدارة العملاء"
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">إجمالي الطلبات</div>
            <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">قيد المراجعة</div>
            <div className="text-2xl font-black text-amber-600">{stats.pending}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">معتمدة</div>
            <div className="text-2xl font-black text-emerald-600">{stats.approved}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">مرفوضة</div>
            <div className="text-2xl font-black text-red-600">{stats.rejected}</div>
          </Card>
        </div>

        {/* Search */}
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
            <TabsTrigger value="rejected" className="rounded-lg text-xs font-bold">
              مرفوضة ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const StatusIcon = statusBadge.icon;
              
              return (
                <Card key={request.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 border-2 border-gray-200 shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-purple-600 text-white font-black">
                        <Building2 className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 truncate">{request.businessName}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{request.ownerName} • {request.contactInfo}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(request.businessType)}</p>
                        </div>
                        <Badge className={`text-[9px] px-2 py-0.5 ${statusBadge.color}`}>
                          <StatusIcon className="w-3 h-3 ml-1" />
                          {statusBadge.label}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                        <span>تاريخ الطلب: {request.createdAt}</span>
                        {request.reviewedAt && <span>تم المراجعة: {request.reviewedAt}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRequestDetails(true);
                        }}
                        className="h-8 rounded-lg border-2 border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5 ml-1.5" />
                        عرض
                      </Button>
                      {request.status === 'pending' && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="flex-1 h-8 rounded-lg border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="flex-1 h-8 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* Request Details Dialog */}
        <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل طلب الخدمة</DialogTitle>
              <DialogDescription>
                {selectedRequest?.businessName}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Building2 className="w-3.5 h-3.5" />
                      اسم العمل
                    </div>
                    <div className="text-sm font-bold">{selectedRequest.businessName}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <User className="w-3.5 h-3.5" />
                      صاحب العمل
                    </div>
                    <div className="text-sm font-bold">{selectedRequest.ownerName}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      رقم الاتصال
                    </div>
                    <div className="text-sm font-bold">{selectedRequest.contactInfo}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <Phone className="w-3.5 h-3.5" />
                      رقم المدير
                    </div>
                    <div className="text-sm font-bold">{selectedRequest.managerPhone}</div>
                  </div>
                  {selectedRequest.email && (
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Mail className="w-3.5 h-3.5" />
                        البريد الإلكتروني
                      </div>
                      <div className="text-sm font-bold">{selectedRequest.email}</div>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      العنوان
                    </div>
                    <div className="text-sm font-bold">{selectedRequest.address}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">النوع</div>
                    <div className="text-sm font-bold">{getTypeLabel(selectedRequest.businessType)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">الحالة</div>
                    <Badge className={getStatusBadge(selectedRequest.status).color}>
                      {getStatusBadge(selectedRequest.status).label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">الوصف</div>
                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedRequest.description}
                  </div>
                </div>
                {selectedRequest.reviewedAt && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">معلومات المراجعة</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">تاريخ المراجعة:</span>
                        <span className="font-bold">{selectedRequest.reviewedAt}</span>
                      </div>
                      {selectedRequest.reviewedBy && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">تمت المراجعة بواسطة:</span>
                          <span className="font-bold">{selectedRequest.reviewedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedRequest?.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (selectedRequest) handleReject(selectedRequest.id);
                      setShowRequestDetails(false);
                    }}
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedRequest) handleApprove(selectedRequest.id);
                      setShowRequestDetails(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    اعتماد
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={() => setShowRequestDetails(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

