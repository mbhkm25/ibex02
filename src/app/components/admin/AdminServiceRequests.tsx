/**
 * AdminServiceRequests Component
 * 
 * Architecture: Admin interface for reviewing and managing service requests
 * 
 * Features:
 * - View all service requests with filtering by status
 * - Review request details
 * - Approve/Reject requests with proper state transitions
 * - View template suggestions (read-only, backend-driven)
 * - Mandatory rejection reason
 * 
 * State Management:
 * - Uses ServiceRequest state machine for valid transitions
 * - Enforces admin-only actions
 * - Tracks review history
 * 
 * UX Principles:
 * - Clear status indicators
 * - Trustworthy, business-grade appearance
 * - Mobile-first design
 * - No template selection UI (templates are backend-driven)
 */

import { useState } from 'react';
import { 
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
  User,
  FileText,
  Sparkles
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AdminLayout } from './AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { toast } from 'sonner';
import { 
  ServiceRequest, 
  ServiceRequestStatus, 
  BusinessType,
  Template,
  TemplateMatchScore
} from '../../types/serviceRequest';
import { 
  getStateConfig, 
  canAdminApprove, 
  canAdminReject,
  canAdminActivate,
  getStatusMessage
} from '../../utils/serviceRequestStateMachine';
import { activateBusinessFromRequest } from '../../api/adminServiceRequests';

// Mock data - In production, this comes from API
const mockRequests: ServiceRequest[] = [
  {
    id: '1',
    userId: 'user-1',
    requestNumber: 'REQ-2024-001',
    status: 'submitted',
    businessName: 'سوبر ماركت النور',
    contactInfo: '+966501234567',
    address: 'الرياض، حي النرجس',
    managerPhone: '+966507654321',
    email: 'mohammed@example.com',
    description: 'نريد خدمة إدارة العملاء لإدارة عملائنا وطلباتهم',
    businessType: 'both',
    createdAt: '2024-01-20',
    submittedAt: '2024-01-20',
    suggestedTemplateIds: ['template-1', 'template-2'],
    templateMatchScores: [
      { templateId: 'template-1', score: 85, reasons: ['Keywords matched', 'Business type matched'] },
      { templateId: 'template-2', score: 72, reasons: ['Category matched'] }
    ]
  },
  {
    id: '2',
    userId: 'user-2',
    requestNumber: 'REQ-2024-002',
    status: 'submitted',
    businessName: 'مطعم الشام',
    contactInfo: '+966509876543',
    address: 'جدة، حي الزهراء',
    managerPhone: '+966501112233',
    description: 'نحتاج إلى نظام إدارة عملاء متكامل',
    businessType: 'both',
    createdAt: '2024-01-18',
    submittedAt: '2024-01-18'
  },
  {
    id: '3',
    userId: 'user-3',
    requestNumber: 'REQ-2024-003',
    status: 'approved',
    businessName: 'صالون الجمال',
    contactInfo: '+966505556677',
    address: 'الدمام، حي الفيصلية',
    managerPhone: '+966508889900',
    email: 'sara@example.com',
    description: 'طلب خدمة إدارة العملاء',
    businessType: 'services',
    createdAt: '2024-01-15',
    submittedAt: '2024-01-15',
    reviewedAt: '2024-01-16',
    reviewedBy: 'admin-1',
    approvedAt: '2024-01-16',
    approvedBy: 'admin-1',
    selectedTemplateId: 'template-1'
  },
  {
    id: '4',
    userId: 'user-4',
    requestNumber: 'REQ-2024-004',
    status: 'rejected',
    businessName: 'محل الأجهزة',
    contactInfo: '+966504445566',
    address: 'الرياض، حي العليا',
    managerPhone: '+966507778899',
    description: 'نريد خدمة إدارة العملاء',
    businessType: 'products',
    createdAt: '2024-01-12',
    submittedAt: '2024-01-12',
    reviewedAt: '2024-01-13',
    reviewedBy: 'admin-1',
    rejectionReason: 'المعلومات غير مكتملة'
  },
];

// Mock templates - In production, this comes from API
const mockTemplates: Template[] = [
  {
    id: 'template-1',
    name: 'Retail Store Template',
    slug: 'retail-store',
    version: '1.0.0',
    category: 'retail',
    businessTypes: ['products', 'both'],
    tags: ['grocery', 'supermarket', 'retail'],
    matchingRules: {
      keywords: ['grocery', 'supermarket', 'retail'],
      businessTypes: ['products', 'both'],
      weight: 85
    },
    configuration: {
      features: {
        customerManagement: true,
        orderManagement: true,
        inventoryManagement: true,
        paymentProcessing: true,
        reporting: true
      },
      defaultSettings: {
        allowCreditPurchases: true,
        defaultCurrency: 'SAR',
        paymentMethods: ['cash', 'card']
      },
      uiConfig: {
        defaultSections: ['customers', 'orders', 'products'],
        defaultPermissions: ['view', 'edit', 'delete']
      }
    },
    isActive: true,
    isDefault: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
];

export function AdminServiceRequests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'reviewed' | 'approved' | 'rejected'>('all');

  // Filter requests
  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = 
      request.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.contactInfo.includes(searchQuery);
    
    const matchesTab = 
      activeTab === 'all' || 
      request.status === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const getStatusBadge = (status: ServiceRequestStatus) => {
    const config = getStateConfig(status);
    const icons = {
      draft: Clock,
      submitted: Clock,
      reviewed: Eye,
      approved: CheckCircle,
      rejected: XCircle,
      activated: CheckCircle
    };
    const Icon = icons[status];
    
    return {
      label: config.label,
      color: config.color,
      icon: Icon
    };
  };

  const getTypeLabel = (type: BusinessType) => {
    const types = {
      products: 'منتجات',
      services: 'خدمات',
      both: 'منتجات وخدمات',
    };
    return types[type] || type;
  };

  const handleApprove = async (request: ServiceRequest) => {
    if (!canAdminApprove(request.status)) {
      toast.error('لا يمكن اعتماد هذا الطلب في حالته الحالية');
      return;
    }

    // Simulate API call
    try {
      // In production: await approveServiceRequest(request.id)
      toast.success('تم اعتماد الطلب بنجاح');
      setShowRequestDetails(false);
      // Refresh requests list
    } catch (error) {
      toast.error('حدث خطأ أثناء اعتماد الطلب');
    }
  };

  const handleReject = async (request: ServiceRequest) => {
    if (!canAdminReject(request.status)) {
      toast.error('لا يمكن رفض هذا الطلب في حالته الحالية');
      return;
    }

    if (!rejectionReason.trim()) {
      toast.error('يجب إدخال سبب الرفض');
      return;
    }

    // Simulate API call
    try {
      // In production: await rejectServiceRequest(request.id, rejectionReason)
      toast.success('تم رفض الطلب');
      setShowRequestDetails(false);
      setShowRejectDialog(false);
      setRejectionReason('');
      // Refresh requests list
    } catch (error) {
      toast.error('حدث خطأ أثناء رفض الطلب');
    }
  };

  const handleActivate = async (request: ServiceRequest) => {
    if (!canAdminActivate(request.status)) {
      toast.error('لا يمكن تفعيل هذا الطلب في حالته الحالية');
      return;
    }

    if (!request.businessModel) {
      toast.error('الطلب لا يحتوي على نموذج عمل. لا يمكن التفعيل.');
      return;
    }

    try {
      const result = await activateBusinessFromRequest(request.id);
      toast.success(`تم تفعيل العمل "${result.businessProfile.name}" بنجاح!`);
      setShowRequestDetails(false);
      // Refresh requests list
      // In production: refetch requests from API
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تفعيل العمل');
    }
  };

  const stats = {
    total: mockRequests.length,
    submitted: mockRequests.filter(r => r.status === 'submitted').length,
    reviewed: mockRequests.filter(r => r.status === 'reviewed').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length,
  };

  const getSuggestedTemplates = (request: ServiceRequest): Template[] => {
    if (!request.suggestedTemplateIds) return [];
    return mockTemplates.filter(t => request.suggestedTemplateIds?.includes(t.id));
  };

  return (
    <AdminLayout 
      title="طلبات الخدمات" 
      subtitle="مراجعة واعتماد طلبات خدمة إدارة العملاء"
    >
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">إجمالي الطلبات</div>
            <div className="text-2xl font-black text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">مُرسلة</div>
            <div className="text-2xl font-black text-blue-600">{stats.submitted}</div>
          </Card>
          <Card className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="text-xs text-gray-500 mb-1">قيد المراجعة</div>
            <div className="text-2xl font-black text-amber-600">{stats.reviewed}</div>
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
                placeholder="ابحث برقم الطلب أو اسم العمل..."
                className="pr-10 h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
              />
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 rounded-xl bg-gray-100 p-1 h-11">
            <TabsTrigger value="all" className="rounded-lg text-xs font-bold">
              الكل ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="submitted" className="rounded-lg text-xs font-bold">
              مُرسلة ({stats.submitted})
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="rounded-lg text-xs font-bold">
              قيد المراجعة ({stats.reviewed})
            </TabsTrigger>
            <TabsTrigger value="approved" className="rounded-lg text-xs font-bold">
              معتمدة ({stats.approved})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="rounded-lg text-xs font-bold">
              مرفوضة ({stats.rejected})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-3">
            {filteredRequests.length === 0 ? (
              <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base font-black text-gray-900 mb-1">لا توجد طلبات</h3>
                <p className="text-sm text-gray-600">لا توجد طلبات تطابق معايير البحث</p>
              </Card>
            ) : (
              filteredRequests.map((request) => {
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
                            <p className="text-xs text-gray-500 mt-0.5">{request.requestNumber} • {request.contactInfo}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{getTypeLabel(request.businessType)}</p>
                          </div>
                          <Badge className={`text-[9px] px-2 py-0.5 ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3 ml-1" />
                            {statusBadge.label}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{request.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                          <span>تاريخ الطلب: {new Date(request.createdAt).toLocaleDateString('ar-SA')}</span>
                          {request.submittedAt && (
                            <span>تم الإرسال: {new Date(request.submittedAt).toLocaleDateString('ar-SA')}</span>
                          )}
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
                        {(canAdminApprove(request.status) || canAdminReject(request.status) || canAdminActivate(request.status)) && (
                          <div className="flex gap-1">
                            {canAdminApprove(request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApprove(request)}
                                className="flex-1 h-8 rounded-lg border-2 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {canAdminReject(request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectDialog(true);
                                }}
                                className="flex-1 h-8 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {canAdminActivate(request.status) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleActivate(request)}
                                className="flex-1 h-8 rounded-lg border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5 ml-1.5" />
                                تفعيل
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Request Details Dialog */}
        <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
          <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل طلب الخدمة</DialogTitle>
              <DialogDescription>
                {selectedRequest?.businessName} • {selectedRequest?.requestNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                {/* Status Badge */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-600">الحالة:</span>
                    <Badge className={getStatusBadge(selectedRequest.status).color}>
                      {getStatusBadge(selectedRequest.status).label}
                    </Badge>
                  </div>
                  {selectedRequest.rejectionReason && (
                    <div className="text-xs text-red-600 font-bold">
                      سبب الرفض: {selectedRequest.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Business Information */}
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
                  <div className="md:col-span-2">
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
                </div>

                {/* Description */}
                <div>
                  <div className="text-xs text-gray-500 mb-1">الوصف</div>
                  <div className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedRequest.description}
                  </div>
                </div>

                {/* Template Suggestions (Read-only) */}
                {selectedRequest.templateMatchScores && selectedRequest.templateMatchScores.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <h4 className="text-sm font-black text-blue-900">اقتراحات القوالب (تلقائية)</h4>
                    </div>
                    <div className="space-y-2">
                      {selectedRequest.templateMatchScores.map((match, index) => {
                        const template = mockTemplates.find(t => t.id === match.templateId);
                        return (
                          <div key={match.templateId} className="p-3 bg-white rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-bold text-gray-900">
                                {index + 1}. {template?.name || 'Template'}
                              </span>
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[9px]">
                                {match.score}% تطابق
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              {match.reasons.map((reason, i) => (
                                <div key={i} className="flex items-center gap-1">
                                  <span className="w-1 h-1 bg-blue-400 rounded-full" />
                                  {reason}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      ملاحظة: القوالب يتم اختيارها تلقائياً من قبل النظام. يمكنك اختيار قالب مختلف عند الاعتماد.
                    </p>
                  </div>
                )}

                {/* Review History */}
                {(selectedRequest.reviewedAt || selectedRequest.approvedAt) && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500 mb-2">معلومات المراجعة</div>
                    <div className="space-y-1 text-sm">
                      {selectedRequest.reviewedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ المراجعة:</span>
                          <span className="font-bold">{new Date(selectedRequest.reviewedAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                      {selectedRequest.approvedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">تاريخ الاعتماد:</span>
                          <span className="font-bold">{new Date(selectedRequest.approvedAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              {selectedRequest && (
                <>
                  {canAdminReject(selectedRequest.status) && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowRequestDetails(false);
                        setShowRejectDialog(true);
                      }}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 ml-2" />
                      رفض
                    </Button>
                  )}
                  {canAdminApprove(selectedRequest.status) && (
                    <Button
                      onClick={() => handleApprove(selectedRequest)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      اعتماد
                    </Button>
                  )}
                  {canAdminActivate(selectedRequest.status) && (
                    <Button
                      onClick={() => handleActivate(selectedRequest)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 ml-2" />
                      تفعيل
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowRequestDetails(false)}>
                    إغلاق
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>رفض طلب الخدمة</DialogTitle>
              <DialogDescription>
                يرجى إدخال سبب الرفض (مطلوب)
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejectionReason" className="text-sm font-bold text-gray-900">
                  سبب الرفض <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-24 rounded-xl border-2 border-gray-200 focus:border-red-400"
                  placeholder="أدخل سبب رفض الطلب..."
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={() => selectedRequest && handleReject(selectedRequest)}
                disabled={!rejectionReason.trim()}
                className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                <XCircle className="w-4 h-4 ml-2" />
                رفض الطلب
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
