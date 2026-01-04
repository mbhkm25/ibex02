import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, Camera } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { DashboardLayout } from '../layout/DashboardLayout';

export function QRScanner() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);

  const handleScanComplete = () => {
    setScanning(false);
    
    // Simulate successful scan
    setTimeout(() => {
      const storeId = 'store-' + Math.random().toString(36).substr(2, 9);
      toast.success('تم الاشتراك في المتجر بنجاح!');
      navigate(`/wallet/${storeId}`);
    }, 1500);
  };

  return (
    <DashboardLayout title="مسح رمز QR" subtitle="امسح الرمز للدفع أو الاشتراك">
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
                <div className="absolute inset-x-0 h-1 bg-primary/80 shadow-[0_0_20px_rgba(var(--primary),0.8)] animate-[scan_2s_ease-in-out_infinite] top-0"></div>
                
                {/* Corners */}
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-xl"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">جاري المسح...</h3>
                <p className="text-gray-500">
                  وجّه الكاميرا نحو رمز QR الخاص بالمتجر لإتمام العملية
                </p>
                
                {/* Demo Button */}
                <Button
                  onClick={handleScanComplete}
                  className="mt-6 w-full h-12 rounded-xl"
                  variant="secondary"
                >
                  محاكاة مسح ناجح
                </Button>
              </div>
            </>
          ) : (
            <div className="py-10 animate-in fade-in zoom-in duration-300">
              <div className="w-24 h-24 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">تم بنجاح!</h2>
              <p className="text-gray-500">
                جاري تحويلك إلى حسابك في المتجر...
              </p>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
