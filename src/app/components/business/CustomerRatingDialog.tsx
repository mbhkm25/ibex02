import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';

interface CustomerRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
}

export function CustomerRatingDialog({ open, onOpenChange, customerName }: CustomerRatingDialogProps) {
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [recommendation, setRecommendation] = useState<'positive' | 'negative' | null>(null);

  const handleSave = () => {
    if (rating === 0) {
      toast.error('يرجى اختيار تقييم للعميل');
      return;
    }
    toast.success(`تم حفظ تقييم العميل ${customerName}`);
    onOpenChange(false);
    setRating(0);
    setNotes('');
    setRecommendation(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-600" />
            تقييم العميل
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-600 mt-2">
            تقييم خاص للعميل <strong>{customerName}</strong> (لا يرى هذا التقييم إلا أصحاب الأعمال)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">التقييم</Label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center text-xs text-gray-500 mt-1">
                {rating === 5 && 'ممتاز'}
                {rating === 4 && 'جيد جداً'}
                {rating === 3 && 'جيد'}
                {rating === 2 && 'مقبول'}
                {rating === 1 && 'ضعيف'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">التوصية</Label>
            <div className="flex gap-2">
              <Button
                variant={recommendation === 'positive' ? 'default' : 'outline'}
                onClick={() => setRecommendation('positive')}
                className={`flex-1 h-11 rounded-xl font-bold ${
                  recommendation === 'positive'
                    ? 'bg-emerald-600 text-white border-0'
                    : 'border-2 border-gray-200'
                }`}
              >
                <ThumbsUp className="w-4 h-4 ml-1.5" />
                إيجابي
              </Button>
              <Button
                variant={recommendation === 'negative' ? 'default' : 'outline'}
                onClick={() => setRecommendation('negative')}
                className={`flex-1 h-11 rounded-xl font-bold ${
                  recommendation === 'negative'
                    ? 'bg-red-600 text-white border-0'
                    : 'border-2 border-gray-200'
                }`}
              >
                <ThumbsDown className="w-4 h-4 ml-1.5" />
                سلبي
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">ملاحظات (اختياري)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-24 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
              placeholder="أضف ملاحظاتك عن العميل..."
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={handleSave}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 font-black text-sm"
          >
            حفظ التقييم
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

