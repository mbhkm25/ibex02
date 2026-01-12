/**
 * QR Code Scanner Component
 * 
 * Architecture: Mobile-first QR code scanner with resolution
 * 
 * Core Principle:
 * - QR = Pointer (points to entity)
 * - Scanner = Reader (reads QR code)
 * - Data API = Resolver (fetches metadata)
 * - UI = Navigator (routes to entity)
 * 
 * Features:
 * - Real-time QR code scanning using device camera
 * - QR code resolution via Data API
 * - Automatic routing based on entity_type
 * - Error handling for invalid/inactive QR codes
 * 
 * Security:
 * - Requires authentication (via ProtectedRoute)
 * - Validates QR code exists and is active
 * - User confirmation before navigation
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  QrCode, 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Package,
  ShoppingBag,
  Building2,
  CreditCard,
  User
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../../contexts/AuthContext';

interface QRCodeMetadata {
  id: string;
  entity_type: 'product' | 'service' | 'business' | 'payment' | 'customer';
  entity_id: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
}

const ENTITY_TYPE_ICONS = {
  product: Package,
  service: ShoppingBag,
  business: Building2,
  payment: CreditCard,
  customer: User,
};

const ENTITY_TYPE_LABELS = {
  product: 'منتج',
  service: 'خدمة',
  business: 'عمل',
  payment: 'دفعة',
  customer: 'عميل',
};

export function QRCodeScanner() {
  const navigate = useNavigate();
  const { logout, getAccessToken } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [qrMetadata, setQrMetadata] = useState<QRCodeMetadata | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Extract QR ID from scanned value
  // QR URL format: https://<domain>/q/<qr_id>
  function extractQrId(scannedText: string): string | null {
    try {
      // Try to extract from URL
      const urlMatch = scannedText.match(/\/q\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      if (urlMatch) {
        return urlMatch[1];
      }
      
      // Try direct UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(scannedText)) {
        return scannedText;
      }
      
      return null;
    } catch {
      return null;
    }
  }

  // Resolve QR code metadata from Data API
  async function resolveQRCode(qrId: string): Promise<QRCodeMetadata | null> {
    try {
      const token = await getAccessToken();
      if (!token) {
        logout();
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `https://ep-flat-hall-a7h51kjz.apirest.ap-southeast-2.aws.neon.tech/neondb/rest/v1/qr_codes?id=eq.${qrId}&select=id,entity_type,entity_id,business_id,is_active,created_at`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'apikey': token,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error('انتهت جلسة تسجيل الدخول');
        }
        throw new Error('فشل جلب بيانات QR code');
      }

      const results = await response.json();
      
      if (!Array.isArray(results) || results.length === 0) {
        return null;
      }

      return results[0];
    } catch (err: any) {
      console.error('QR resolution error:', err);
      
      if (err.message.includes('Not authenticated') || err.message.includes('Session expired')) {
        logout();
        throw new Error('انتهت جلسة تسجيل الدخول');
      }
      
      throw err;
    }
  }

  // Handle successful QR scan
  async function handleQRScan(scannedText: string) {
    try {
      setLoading(true);
      setError(null);

      // Extract QR ID
      const qrId = extractQrId(scannedText);
      if (!qrId) {
        setError('رمز QR غير صالح. يرجى التأكد من أنك تمسح QR code صحيح.');
        toast.error('رمز QR غير صالح');
        return;
      }

      // Resolve QR code
      const metadata = await resolveQRCode(qrId);
      if (!metadata) {
        setError('رمز QR غير موجود في النظام.');
        toast.error('رمز QR غير موجود');
        return;
      }

      // Check if QR is active
      if (!metadata.is_active) {
        setError('رمز QR غير نشط.');
        toast.error('رمز QR غير نشط');
        return;
      }

      // Stop scanning
      await stopScanning();

      // Show confirmation dialog
      setQrMetadata(metadata);
      setShowConfirmDialog(true);
    } catch (err: any) {
      console.error('QR scan error:', err);
      setError(err.message || 'فشل قراءة رمز QR');
      toast.error(err.message || 'فشل قراءة رمز QR');
    } finally {
      setLoading(false);
    }
  }

  // Start camera scanning
  async function startScanning() {
    try {
      setCameraError(null);
      setError(null);

      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Success callback
          handleQRScan(decodedText);
        },
        (errorMessage) => {
          // Error callback (ignore - scanning continues)
          // Only log if it's not a "not found" error
          if (!errorMessage.includes('No QR code found')) {
            // Silent - scanning continues
          }
        }
      );

      setScanning(true);
    } catch (err: any) {
      console.error('Camera start error:', err);
      setCameraError('فشل الوصول إلى الكاميرا. يرجى التأكد من السماح بالوصول إلى الكاميرا.');
      toast.error('فشل الوصول إلى الكاميرا');
    }
  }

  // Stop camera scanning
  async function stopScanning() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch (err) {
        console.error('Stop scanning error:', err);
      }
      scannerRef.current = null;
    }
    setScanning(false);
  }

  // Navigate based on entity type
  function handleNavigate() {
    if (!qrMetadata) return;

    const { entity_type, entity_id, business_id } = qrMetadata;

    switch (entity_type) {
      case 'business':
        navigate(`/business/${entity_id}/manage`);
        break;
      case 'product':
        navigate(`/wallet/${business_id}/products?product=${entity_id}`);
        break;
      case 'service':
        navigate(`/wallet/${business_id}/products?service=${entity_id}`);
        break;
      case 'payment':
        navigate(`/wallet/${business_id}/history?payment=${entity_id}`);
        break;
      case 'customer':
        navigate(`/business/${business_id}/customer/${entity_id}`);
        break;
      default:
        toast.error('نوع الكيان غير مدعوم');
    }

    setShowConfirmDialog(false);
    setQrMetadata(null);
  }

  // Initialize scanner on mount
  useEffect(() => {
    startScanning();

    return () => {
      stopScanning();
    };
  }, []);

  const EntityIcon = qrMetadata ? ENTITY_TYPE_ICONS[qrMetadata.entity_type] : null;
  const entityLabel = qrMetadata ? ENTITY_TYPE_LABELS[qrMetadata.entity_type] : '';

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopScanning();
              navigate(-1);
            }}
            className="h-9 w-9 rounded-xl text-white hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-white truncate">مسح QR Code</h1>
            <p className="text-xs text-gray-400">وجّه الكاميرا نحو رمز QR</p>
          </div>
        </div>
      </header>

      <main className="relative">
        {/* Camera View */}
        <div className="relative w-full" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Scanner Container */}
          <div id="qr-reader" className="w-full h-full"></div>

          {/* Overlay with scanning frame */}
          {scanning && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64">
                {/* Scanning frame */}
                <div className="absolute inset-0 border-4 border-blue-500 rounded-2xl">
                  {/* Corner indicators */}
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500 rounded-br-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500 rounded-bl-lg"></div>
                </div>
                
                {/* Scanning line animation */}
                <div className="absolute inset-x-0 h-1 bg-blue-500/80 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>
            </div>
          )}

          {/* Instructions overlay */}
          {scanning && !loading && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900/90 to-transparent p-6">
              <div className="text-center text-white">
                <p className="text-sm font-bold mb-1">وجّه الكاميرا نحو رمز QR</p>
                <p className="text-xs text-gray-300">تأكد من أن الرمز واضح ومضاء جيداً</p>
              </div>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-gray-900/80 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-3" />
                <p className="text-white font-bold">جاري قراءة رمز QR...</p>
              </div>
            </div>
          )}

          {/* Error overlay */}
          {error && !scanning && (
            <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center p-6">
              <Card className="p-6 border-2 border-red-200 rounded-xl bg-red-50 text-center max-w-sm">
                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <h3 className="text-base font-black text-red-900 mb-2">خطأ</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button
                  onClick={() => {
                    setError(null);
                    startScanning();
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 font-bold"
                >
                  المحاولة مرة أخرى
                </Button>
              </Card>
            </div>
          )}

          {/* Camera error overlay */}
          {cameraError && (
            <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center p-6">
              <Card className="p-6 border-2 border-amber-200 rounded-xl bg-amber-50 text-center max-w-sm">
                <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                <h3 className="text-base font-black text-amber-900 mb-2">خطأ في الكاميرا</h3>
                <p className="text-sm text-amber-600 mb-4">{cameraError}</p>
                <Button
                  onClick={() => {
                    setCameraError(null);
                    startScanning();
                  }}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white rounded-xl h-11 font-bold"
                >
                  المحاولة مرة أخرى
                </Button>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-gray-900">
              تم قراءة رمز QR بنجاح
            </DialogTitle>
            <DialogDescription>
              {qrMetadata && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    {EntityIcon && (
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <EntityIcon className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-600">نوع الكيان</p>
                      <p className="text-sm font-black text-gray-900">{entityLabel}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs font-bold text-gray-600 mb-1">معرف الكيان</p>
                    <p className="text-sm font-mono text-gray-900">{qrMetadata.entity_id}</p>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setQrMetadata(null);
                startScanning();
              }}
              className="flex-1 rounded-xl h-11 font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleNavigate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 font-black"
            >
              <CheckCircle className="w-4 h-4 ml-2" />
              الانتقال
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add CSS for scanning animation */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 0; }
          50% { top: 100%; }
        }
      `}</style>
    </div>
  );
}

