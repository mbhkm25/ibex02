import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';

interface CustomerCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  currentCategory?: string;
}

export function CustomerCategoryDialog({ open, onOpenChange, customerName, currentCategory }: CustomerCategoryDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState(currentCategory || '');

  const categories = [
    { id: 'vip', name: 'عميل مميز', description: 'عملاء متميزون بشراء متكرر' },
    { id: 'regular', name: 'عميل عادي', description: 'عملاء عاديون' },
    { id: 'new', name: 'عميل جديد', description: 'عملاء جدد' },
    { id: 'inactive', name: 'عميل غير نشط', description: 'عملاء لم يتعاملوا مؤخراً' },
    { id: 'credit', name: 'عميل آجل', description: 'عملاء لديهم اعتماد شراء بالآجل' },
  ];

  const handleSave = () => {
    if (!selectedCategory) {
      toast.error('يرجى اختيار فئة للعميل');
      return;
    }
    const categoryName = categories.find(c => c.id === selectedCategory)?.name;
    toast.success(`تم تصنيف ${customerName} كـ ${categoryName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-black flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600" />
            تصنيف فئة حساب العميل
          </DialogTitle>
          <DialogDescription className="text-right text-sm text-gray-600 mt-2">
            اختر فئة حساب للعميل <strong>{customerName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-700">الفئة</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                <SelectValue placeholder="اختر فئة العميل" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div>
                      <div className="font-bold">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCategory && (
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
              <div className="text-xs text-blue-700">
                <strong>ملاحظة:</strong> {categories.find(c => c.id === selectedCategory)?.description}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2">
          <Button
            onClick={handleSave}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 font-black text-sm"
          >
            حفظ التصنيف
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

