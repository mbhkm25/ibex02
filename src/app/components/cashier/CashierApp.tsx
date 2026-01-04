import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';

export function CashierApp() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [showQR, setShowQR] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentData, setPaymentData] = useState<any>(null);

  const storeName = 'سوبر ماركت الرحمة';

  const handleReceivePayment = () => {
    if (!amount) return;
    setShowQR(true);
    
    // Simulate QR scan after 2 seconds
    setTimeout(() => {
      simulateCustomerScan();
    }, 2000);
  };

  const simulateCustomerScan = () => {
    setShowQR(false);
    
    // Simulate customer data
    const customerBalance = 250; // Mock balance
    const paymentAmount = parseFloat(amount);
    const hasCreditApproval = customerBalance >= 0 || Math.abs(customerBalance) < 500;

    setPaymentData({
      customerName: 'محمد أحمد',
      customerBalance: customerBalance,
      amount: paymentAmount,
      paymentType: customerBalance >= paymentAmount ? 'نقدي' : hasCreditApproval ? 'آجل' : 'مرفوض',
      newBalance: customerBalance - paymentAmount,
    });

    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = () => {
    toast.success('تمت العملية بنجاح!');
    setShowPaymentDialog(false);
    setPaymentData(null);
    setAmount('');
  };

  const handleCancelPayment = () => {
    setShowPaymentDialog(false);
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl">تطبيق الكاشير</h1>
            <p className="text-sm text-muted-foreground mt-1">{storeName}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md space-y-6">
          {/* Amount Input */}
          <div>
            <Label htmlFor="amount">مبلغ العملية (ر.س)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 h-16 rounded-xl bg-input-background text-2xl text-center"
              placeholder="0.00"
              dir="ltr"
            />
          </div>

          {/* Receive Payment Button */}
          <Button
            onClick={handleReceivePayment}
            disabled={!amount || parseFloat(amount) <= 0}
            className="w-full h-14 rounded-xl text-lg"
          >
            <QrCode className="ml-2 w-6 h-6" />
            استلام الدفع
          </Button>

          {/* Info Card */}
          <Card className="p-4 border-border/50 bg-muted/30">
            <p className="text-sm text-muted-foreground text-center">
              بعد الضغط على "استلام الدفع"، سيظهر رمز QR للعميل لمسحه من جواله
            </p>
          </Card>
        </div>
      </div>

      {/* QR Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">رمز QR للدفع</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 p-4">
            <div className="w-64 h-64 bg-muted rounded-2xl flex items-center justify-center relative">
              <QrCode className="w-32 h-32 text-muted-foreground animate-pulse" />
            </div>
            <div className="text-center">
              <p className="font-medium text-lg">{amount} ر.س</p>
              <p className="text-sm text-muted-foreground mt-1">
                في انتظار مسح العميل للرمز...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">تأكيد العملية</DialogTitle>
          </DialogHeader>
          
          {paymentData && (
            <div className="space-y-4 p-4">
              {/* Payment Status Icon */}
              <div className="flex justify-center">
                {paymentData.paymentType === 'مرفوض' ? (
                  <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                    <XCircle className="w-8 h-8" />
                  </div>
                ) : paymentData.paymentType === 'آجل' ? (
                  <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                )}
              </div>

              {/* Customer Info */}
              <Card className="p-4 border-border/50">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">العميل:</span>
                    <span className="font-medium">{paymentData.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">المبلغ:</span>
                    <span className="font-medium">{paymentData.amount} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نوع الدفع:</span>
                    <span className={`font-medium ${
                      paymentData.paymentType === 'نقدي' ? 'text-green-600' :
                      paymentData.paymentType === 'آجل' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>
                      {paymentData.paymentType}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-muted-foreground">الرصيد الجديد:</span>
                    <span className={`font-medium ${paymentData.newBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {paymentData.newBalance >= 0 ? '+' : ''}{paymentData.newBalance} ر.س
                    </span>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 h-12 rounded-xl"
                  onClick={handleCancelPayment}
                >
                  إلغاء
                </Button>
                <Button
                  className="flex-1 h-12 rounded-xl"
                  onClick={handleConfirmPayment}
                  disabled={paymentData.paymentType === 'مرفوض'}
                >
                  تأكيد
                </Button>
              </div>

              {/* Warning for declined payment */}
              {paymentData.paymentType === 'مرفوض' && (
                <p className="text-sm text-red-600 text-center">
                  العميل ليس لديه رصيد كافٍ أو اعتماد للشراء الآجل
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
