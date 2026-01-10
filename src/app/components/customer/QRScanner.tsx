import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, Camera, Store, MapPin, Star, Users, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { toast } from 'sonner';
import { DashboardLayout } from '../layout/DashboardLayout';

export function QRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [storeData, setStoreData] = useState<any>(null);

  const handleScanComplete = () => {
    setScanning(false);
    
    // TODO: Parse QR data and fetch store data from API
    // In real app, this would parse QR data containing: storeId
    // Then fetch store data from API
    // For now, show error or empty state
    toast.error('يجب ربط هذا المكون بـ API لجلب بيانات المتجر');
  };

  const handleSubscribe = () => {
    toast.success('جاري الاشتراك في المتجر...');
    setTimeout(() => {
      toast.success('تم الاشتراك بنجاح!');
      setShowStoreDetails(false);
      navigate(`/wallet/${storeData.id}`);
    }, 1500);
  };

  const handleBrowse = () => {
    setShowStoreDetails(false);
    navigate(`/wallet/${storeData.id}`);
  };

  const handleClose = () => {
    setShowStoreDetails(false);
    setScanning(true);
  };

  return (
    <DashboardLayout title="مسح كود المتجر" subtitle="امسح كود المتجر للاشتراك أو التصفح">
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
                <div className="absolute inset-x-0 h-1 bg-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
                
                {/* Corners */}
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">جاري قراءة كود المتجر...</h3>
                <p className="text-gray-500">
                  وجّه الكاميرا نحو رمز QR الخاص بالمتجر
                </p>
                
                {/* Demo Button */}
                <Button
                  onClick={handleScanComplete}
                  className="mt-6 w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                  variant="default"
                >
                  محاكاة قراءة كود المتجر
                </Button>
              </div>
            </>
          ) : (
            <div className="py-10 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم قراءة الكود!</h2>
              <p className="text-gray-500">
                جاري تحميل معلومات المتجر...
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Store Details Dialog */}
      <Dialog open={showStoreDetails} onOpenChange={setShowStoreDetails}>
        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-right">معلومات المتجر</DialogTitle>
            <DialogDescription className="text-right text-gray-500">
              اختر الإجراء المناسب
            </DialogDescription>
          </DialogHeader>
          
          {storeData && (
            <div className="space-y-4 px-6 pb-6">
              {/* Store Image */}
              <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center overflow-hidden">
                <Store className="w-24 h-24 text-blue-600 opacity-50" />
              </div>

              {/* Store Info */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{storeData.name}</h3>
                  <p className="text-gray-500 text-sm">{storeData.description}</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{storeData.address}</span>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700">{storeData.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">{storeData.subscribers} مشترك</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl border-gray-200 hover:bg-gray-50"
                  onClick={handleBrowse}
                >
                  <ArrowLeft className="w-5 h-5 ml-2" />
                  زيارة وتصفح
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700"
                  onClick={handleSubscribe}
                >
                  <QrCode className="w-5 h-5 ml-2" />
                  اشتراك
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
