import React, { useState } from 'react';
import { Ban, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';

interface CustomerSuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  isSuspended?: boolean;
}

export function CustomerSuspendDialog({ open, onOpenChange, customerName, isSuspended }: CustomerSuspendDialogProps) {
  const [reason, setReason] = useState('');

  const handleSuspend = () => {
    if (!reason.trim()) {
      toast.error('يرجى إدخال سبب إيقاف الحساب');
      return;
    }
    toast.success(`تم ${isSuspended ? 'تفعيل' : 'إيقاف'} حساب ${customerName}`);
    onOpenChange(false);
    setReason('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <Ban className={`w-5 h-5 ${isSuspended ? 'text-emerald-600' : 'text-red-600'}`} />
            {isSuspended ? 'تفعيل الحساب' : 'إيقاف الحساب'}
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-600 mt-2">
            {isSuspended 
              ? `تفعيل حساب العميل ${customerName}`
              : `إيقاف حساب العميل ${customerName} مؤقتاً`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!isSuspended && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-700">
                <strong>تحذير:</strong> سيتم منع العميل من إجراء أي عمليات حتى يتم تفعيل الحساب مرة أخرى.
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">
              {isSuspended ? 'ملاحظات (اختياري)' : 'سبب الإيقاف'}
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-24 rounded-xl border-2 border-gray-200 text-sm focus:border-red-400"
              placeholder={isSuspended ? 'ملاحظات حول تفعيل الحساب...' : 'اذكر سبب إيقاف الحساب...'}
              required={!isSuspended}
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={handleSuspend}
            className={`w-full rounded-xl h-11 font-black text-sm ${
              isSuspended
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isSuspended ? 'تفعيل الحساب' : 'إيقاف الحساب'}
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

