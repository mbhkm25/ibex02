/**
 * MyServiceRequests Component
 * 
 * Architecture: User-facing view of their own service requests
 * 
 * Features:
 * - View all user's service requests
 * - See request status with proper state-based UI
 * - View rejection reasons
 * - Resubmit rejected requests
 * - Access activated businesses
 * 
 * State Management:
 * - Uses ServiceRequest state machine for UI rendering
 * - Shows appropriate actions based on state
 * - Prevents invalid actions
 * 
 * UX Principles:
 * - Clear status indicators
 * - Trustworthy, business-grade appearance
 * - Mobile-first design
 * - Low cognitive load
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Building2,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { ServiceRequest, ServiceRequestStatus } from '../../types/serviceRequest';
import { 
  getStateConfig, 
  canUserResubmit,
  getStatusMessage
} from '../../utils/serviceRequestStateMachine';
import { toast } from 'sonner';

// Mock data - In production, this comes from API
const mockUserRequests: ServiceRequest[] = [
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
    submittedAt: '2024-01-20'
  },
  {
    id: '2',
    userId: 'user-1',
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
    rejectionReason: 'المعلومات غير مكتملة. يرجى إضافة المزيد من التفاصيل في الوصف.'
  },
  {
    id: '3',
    userId: 'user-1',
    requestNumber: 'REQ-2024-003',
    status: 'activated',
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
    approvedAt: '2024-01-16',
    activatedAt: '2024-01-17',
    businessProfileId: 'business-1'
  }
];

export function MyServiceRequests() {
  const navigate = useNavigate();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const getStatusBadge = (status: ServiceRequestStatus) => {
    const config = getStateConfig(status);
    const icons = {
      draft: FileText,
      submitted: Clock,
      reviewed: Clock,
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

  const handleResubmit = (request: ServiceRequest) => {
    // Navigate to request form with pre-filled data
    navigate('/business/request', { 
      state: { 
        resubmit: true,
        previousRequest: request 
      } 
    });
  };

  const handleViewBusiness = (businessProfileId: string) => {
    navigate(`/business/${businessProfileId}/manage`);
  };

  const statusMessage = selectedRequest ? getStatusMessage(
    selectedRequest.status,
    selectedRequest.rejectionReason
  ) : null;

  return (
    <DashboardLayout 
      title="طلباتي" 
      subtitle="عرض ومتابعة طلبات خدمة إدارة العملاء"
    >
      <div className="space-y-4">
        {mockUserRequests.length === 0 ? (
          <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-black text-gray-900 mb-1">لا توجد طلبات</h3>
            <p className="text-sm text-gray-600 mb-4">لم تقم بإنشاء أي طلبات بعد</p>
            <Button
              onClick={() => navigate('/business/request')}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 px-6 font-black"
            >
              إنشاء طلب جديد
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {mockUserRequests.map((request) => {
              const statusBadge = getStatusBadge(request.status);
              const StatusIcon = statusBadge.icon;
              const config = getStateConfig(request.status);
              
              return (
                <Card 
                  key={request.id} 
                  className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-black text-gray-900 truncate">
                            {request.businessName}
                          </h3>
                          <Badge className={`text-[9px] px-2 py-0.5 ${statusBadge.color}`}>
                            <StatusIcon className="w-3 h-3 ml-1" />
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{request.requestNumber}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDetails(true);
                        }}
                        className="h-8 rounded-lg border-2 border-gray-200 shrink-0"
                      >
                        عرض التفاصيل
                      </Button>
                    </div>

                    {/* Status Message */}
                    {config.showStatusMessage && (
                      <div className={`p-3 rounded-xl border-2 ${
                        request.status === 'rejected' 
                          ? 'bg-red-50 border-red-200' 
                          : request.status === 'activated'
                          ? 'bg-emerald-50 border-emerald-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}>
                        <p className="text-xs font-bold text-gray-900 mb-1">
                          {statusMessage?.title}
                        </p>
                        <p className="text-xs text-gray-600">
                          {statusMessage?.description}
                        </p>
                        {request.status === 'rejected' && request.rejectionReason && (
                          <div className="mt-2 pt-2 border-t border-red-200">
                            <p className="text-xs font-bold text-red-700 mb-1">سبب الرفض:</p>
                            <p className="text-xs text-red-600">{request.rejectionReason}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      {config.showResubmitButton && canUserResubmit(request.status) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleResubmit(request)}
                          className="flex-1 h-9 rounded-lg border-2 border-gray-300 font-bold text-sm"
                        >
                          <RefreshCw className="w-4 h-4 ml-2" />
                          إعادة الإرسال
                        </Button>
                      )}
                      {config.showBusinessAccess && request.businessProfileId && (
                        <Button
                          onClick={() => handleViewBusiness(request.businessProfileId!)}
                          className="flex-1 h-9 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-black text-sm"
                        >
                          <Building2 className="w-4 h-4 ml-2" />
                          الذهاب إلى العمل
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Request Details Dialog */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تفاصيل الطلب</DialogTitle>
              <DialogDescription>
                {selectedRequest?.businessName} • {selectedRequest?.requestNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-4 py-4">
                {/* Status */}
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-600">الحالة:</span>
                    <Badge className={getStatusBadge(selectedRequest.status).color}>
                      {getStatusBadge(selectedRequest.status).label}
                    </Badge>
                  </div>
                  {statusMessage && (
                    <p className="text-xs text-gray-600 mt-2">{statusMessage.description}</p>
                  )}
                  {selectedRequest.rejectionReason && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-bold text-red-700 mb-1">سبب الرفض:</p>
                      <p className="text-xs text-red-600">{selectedRequest.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Request Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">اسم العمل:</span>
                    <span className="font-bold text-gray-900">{selectedRequest.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الاتصال:</span>
                    <span className="font-bold text-gray-900">{selectedRequest.contactInfo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم المدير:</span>
                    <span className="font-bold text-gray-900">{selectedRequest.managerPhone}</span>
                  </div>
                  {selectedRequest.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">البريد الإلكتروني:</span>
                      <span className="font-bold text-gray-900">{selectedRequest.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">العنوان:</span>
                    <span className="font-bold text-gray-900 text-left">{selectedRequest.address}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <span className="text-gray-600 text-xs block mb-1">الوصف:</span>
                    <p className="text-sm text-gray-700">{selectedRequest.description}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-600 mb-2">التواريخ:</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">تاريخ الإنشاء:</span>
                      <span className="font-bold">{new Date(selectedRequest.createdAt).toLocaleDateString('ar-SA')}</span>
                    </div>
                    {selectedRequest.submittedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">تاريخ الإرسال:</span>
                        <span className="font-bold">{new Date(selectedRequest.submittedAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                    {selectedRequest.reviewedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">تاريخ المراجعة:</span>
                        <span className="font-bold">{new Date(selectedRequest.reviewedAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                    {selectedRequest.approvedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">تاريخ الاعتماد:</span>
                        <span className="font-bold">{new Date(selectedRequest.approvedAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                    {selectedRequest.activatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">تاريخ التفعيل:</span>
                        <span className="font-bold">{new Date(selectedRequest.activatedAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="flex-col gap-2">
              {selectedRequest && (
                <>
                  {getStateConfig(selectedRequest.status).showResubmitButton && 
                   canUserResubmit(selectedRequest.status) && (
                    <Button
                      onClick={() => {
                        setShowDetails(false);
                        handleResubmit(selectedRequest);
                      }}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 font-black"
                    >
                      <RefreshCw className="w-4 h-4 ml-2" />
                      إعادة الإرسال
                    </Button>
                  )}
                  {getStateConfig(selectedRequest.status).showBusinessAccess && 
                   selectedRequest.businessProfileId && (
                    <Button
                      onClick={() => {
                        setShowDetails(false);
                        handleViewBusiness(selectedRequest.businessProfileId!);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-black"
                    >
                      <Building2 className="w-4 h-4 ml-2" />
                      الذهاب إلى العمل
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDetails(false)}
                    className="w-full rounded-xl h-10"
                  >
                    إغلاق
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

