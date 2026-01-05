import React, { useState } from 'react';
import { CreditCard, TrendingUp, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';

interface CustomerCreditApprovalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  currentLimit?: number;
}

export function CustomerCreditApprovalDialog({ open, onOpenChange, customerName, currentLimit }: CustomerCreditApprovalDialogProps) {
  const [creditLimit, setCreditLimit] = useState(currentLimit?.toString() || '');
  const [paymentTerms, setPaymentTerms] = useState('30');

  const handleApprove = () => {
    if (!creditLimit || parseFloat(creditLimit) <= 0) {
      toast.error('يرجى إدخال سقف اعتماد صحيح');
      return;
    }
    toast.success(`تم اعتماد ميزة الشراء بالآجل للعميل ${customerName} بسقف ${creditLimit} ر.س`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            اعتماد ميزة الشراء بالآجل
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-600 mt-2">
            إعدادات اعتماد الشراء بالآجل للعميل <strong>{customerName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">سقف الاعتماد (ر.س)</Label>
            <Input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              className="h-12 rounded-xl border-2 border-gray-200 text-base font-bold text-center focus:border-emerald-400"
              placeholder="0.00"
              min="0"
            />
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Info className="w-3 h-3" />
              <span>المبلغ الأقصى الذي يمكن للعميل الشراء به بالآجل</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">مدة السداد (يوم)</Label>
            <div className="grid grid-cols-3 gap-2">
              {['15', '30', '45', '60', '90'].map((days) => (
                <Button
                  key={days}
                  variant={paymentTerms === days ? 'default' : 'outline'}
                  onClick={() => setPaymentTerms(days)}
                  className={`h-10 rounded-xl font-bold text-sm ${
                    paymentTerms === days
                      ? 'bg-gray-900 text-white border-0'
                      : 'border-2 border-gray-200'
                  }`}
                >
                  {days}
                </Button>
              ))}
            </div>
          </div>

          {creditLimit && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-700">ملخص الاعتماد</span>
              </div>
              <div className="text-xs text-emerald-700">
                سقف: <strong>{creditLimit} ر.س</strong> • مدة السداد: <strong>{paymentTerms} يوم</strong>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={handleApprove}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 font-black text-sm"
          >
            اعتماد الميزة
          </Button>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full rounded-xl h-10 text-sm"
          >
            إلغاء
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

