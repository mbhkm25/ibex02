/**
 * QR Code Resolver Component
 * 
 * Architecture: Resolves QR code from URL and redirects to entity
 * 
 * Route: /q/:qrId
 * 
 * Core Principle:
 * - QR URL points to this resolver
 * - Resolver fetches QR metadata
 * - Resolver redirects to appropriate entity page
 * 
 * Flow:
 * 1. Extract qrId from URL params
 * 2. Fetch QR metadata from Data API
 * 3. Validate QR is active
 * 4. Redirect to entity page based on entity_type
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { getAccessToken } from '../../services/auth';
import { useAuth } from '../../contexts/AuthContext';

interface QRCodeMetadata {
  id: string;
  entity_type: 'product' | 'service' | 'business' | 'payment' | 'customer';
  entity_id: string;
  business_id: string;
  is_active: boolean;
  created_at: string;
}

export function QRCodeResolver() {
  const { qrId } = useParams<{ qrId: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resolveQR = async () => {
      if (!qrId) {
        setError('معرف QR code غير موجود');
        setLoading(false);
        return;
      }

      try {
        const token = getAccessToken();
        if (!token) {
          // Redirect to login if not authenticated
          navigate('/login');
          return;
        }

        // Fetch QR metadata
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

        if (response.status === 401) {
          logout();
          navigate('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('فشل جلب بيانات QR code');
        }

        const results = await response.json();
        
        if (!Array.isArray(results) || results.length === 0) {
          setError('رمز QR غير موجود في النظام');
          setLoading(false);
          return;
        }

        const metadata: QRCodeMetadata = results[0];

        // Check if QR is active
        if (!metadata.is_active) {
          setError('رمز QR غير نشط');
          setLoading(false);
          return;
        }

        // Redirect based on entity type
        const { entity_type, entity_id, business_id } = metadata;

        switch (entity_type) {
          case 'business':
            navigate(`/business/${entity_id}/manage`, { replace: true });
            break;
          case 'product':
            navigate(`/wallet/${business_id}/products?product=${entity_id}`, { replace: true });
            break;
          case 'service':
            navigate(`/wallet/${business_id}/products?service=${entity_id}`, { replace: true });
            break;
          case 'payment':
            navigate(`/wallet/${business_id}/history?payment=${entity_id}`, { replace: true });
            break;
          case 'customer':
            navigate(`/business/${business_id}/customer/${entity_id}`, { replace: true });
            break;
          default:
            setError('نوع الكيان غير مدعوم');
            setLoading(false);
        }
      } catch (err: any) {
        console.error('QR resolution error:', err);
        setError(err.message || 'فشل حل رمز QR');
        setLoading(false);
      }
    };

    resolveQR();
  }, [qrId, navigate, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-black text-gray-900 mb-2">جاري حل رمز QR...</h3>
          <p className="text-sm text-gray-600">يرجى الانتظار</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <Card className="p-8 border-2 border-red-200 rounded-xl bg-red-50 text-center max-w-md">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-black text-red-900 mb-2">خطأ</h3>
          <p className="text-sm text-red-600 mb-6">{error}</p>
          <Button
            onClick={() => navigate('/scan/qr')}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl h-11 px-6 font-black"
          >
            مسح QR Code آخر
          </Button>
        </Card>
      </div>
    );
  }

  return null; // Will redirect before rendering
}

