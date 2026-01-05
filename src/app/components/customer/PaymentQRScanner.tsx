import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, Camera, CreditCard, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { DashboardLayout } from '../layout/DashboardLayout';

export function PaymentQRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);

  const handleScanComplete = () => {
    setScanning(false);
    
    // Simulate payment QR scan result
    // In real app, this would parse QR data containing: cashierId, storeId, invoiceTotal, invoiceRef
    setTimeout(() => {
      const mockPaymentData = {
        storeId: 'store-123',
        storeName: 'سوبر ماركت الرحمة',
        cashierId: 'cashier-456',
        cashierName: 'أحمد الكاشير',
        invoiceTotal: 125.50,
        invoiceRef: 'INV-2025-001234',
        timestamp: new Date().toISOString()
      };
      
      setPaymentData(mockPaymentData);
      setShowPaymentDetails(true);
      toast.success('تم قراءة كود الدفع بنجاح');
    }, 1500);
  };

  const handleConfirmPayment = () => {
    toast.success('جاري معالجة الدفع...');
    setTimeout(() => {
      toast.success('تم الدفع بنجاح!');
      setShowPaymentDetails(false);
      navigate('/dashboard');
    }, 2000);
  };

  const handleCancel = () => {
    setShowPaymentDetails(false);
    setScanning(true);
  };

  return (
    <DashboardLayout title="دفع فوري" subtitle="امسح كود الدفع لإتمام عملية الشراء">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 border-0 shadow-sm rounded-3xl bg-white text-center">
          {scanning ? (
            <>
              {/* Scanner Frame */}
              <div className="relative aspect-square w-full max-w-[280px] mx-auto mb-8 bg-gray-900 rounded-3xl overflow-hidden">
                <div className="absolute inset-0 opacity-50 flex items-center justify-center">
                    <Camera className="w-16 h-16 text-white" />
                </div>
                {/* Scanning Animation Line */}
                <div className="absolute inset-x-0 h-1 bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
                
                {/* Corners */}
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">جاري قراءة كود الدفع...</h3>
                <p className="text-gray-500">
                  وجّه الكاميرا نحو كود الدفع الموجود على الفاتورة
                </p>
                
                {/* Demo Button */}
                <Button
                  onClick={handleScanComplete}
                  className="mt-6 w-full h-12 rounded-xl bg-green-600 hover:bg-green-700"
                  variant="default"
                >
                  محاكاة قراءة كود الدفع
                </Button>
              </div>
            </>
          ) : (
            <div className="py-10 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم قراءة الكود!</h2>
              <p className="text-gray-500">
                جاري تحميل تفاصيل الفاتورة...
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Payment Details Dialog */}
      <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 text-right">تفاصيل الفاتورة</DialogTitle>
            <DialogDescription className="text-right text-gray-500">
              راجع التفاصيل قبل تأكيد الدفع
            </DialogDescription>
          </DialogHeader>
          
          {paymentData && (
            <div className="space-y-6 mt-6">
              {/* Store Info */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">المتجر</span>
                  <span className="font-bold text-gray-900">{paymentData.storeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">الكاشير</span>
                  <span className="font-medium text-gray-700">{paymentData.cashierName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">الرقم المرجعي</span>
                  <span className="font-mono text-sm text-gray-600">{paymentData.invoiceRef}</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border-2 border-blue-100">
                <span className="text-lg font-bold text-gray-900">المبلغ الإجمالي</span>
                <span className="text-2xl font-bold text-blue-600">{paymentData.invoiceTotal} ر.س</span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50"
                  onClick={handleCancel}
                >
                  <X className="w-5 h-5 ml-2" />
                  إلغاء
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700"
                  onClick={handleConfirmPayment}
                >
                  <CreditCard className="w-5 h-5 ml-2" />
                  تأكيد الدفع
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

