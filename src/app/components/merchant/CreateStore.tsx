import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Coffee, ShoppingBag, Package, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { toast } from 'sonner';
import { DashboardLayout } from '../layout/DashboardLayout';

const storeTypes = [
  { id: 'restaurant', label: 'مطعم', icon: Coffee },
  { id: 'grocery', label: 'بقالة', icon: ShoppingBag },
  { id: 'pharmacy', label: 'صيدلية', icon: Package },
  { id: 'service', label: 'خدمة', icon: Store },
];

export function CreateStore() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    phone: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate store creation
    const storeId = 'store-' + Math.random().toString(36).substr(2, 9);
    
    toast.success('تم إنشاء المتجر بنجاح!');
    
    // Navigate to merchant dashboard
    setTimeout(() => {
      navigate(`/merchant/${storeId}`);
    }, 1000);
  };

  return (
    <DashboardLayout title="إنشاء متجر جديد" subtitle="ابدأ رحلتك في التجارة الإلكترونية">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 md:p-8 border-0 shadow-sm rounded-3xl bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
                <div>
                <Label htmlFor="name" className="text-base">اسم المتجر</Label>
                <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                    placeholder="مثال: سوبر ماركت الرحمة"
                    required
                />
                </div>

                <div>
                <Label className="text-base">نوع النشاط</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                    {storeTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                        <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, type: type.id })}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center gap-2 ${
                            formData.type === type.id
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-gray-100 bg-gray-50 text-gray-500 hover:bg-white hover:border-gray-200'
                        }`}
                        >
                        <Icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{type.label}</span>
                        </button>
                    );
                    })}
                </div>
                </div>

                <div>
                <Label htmlFor="phone" className="text-base">رقم التواصل</Label>
                <Input
                    id="phone"
                    type="tel"
                    dir="ltr"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors text-right"
                    placeholder="+966 5XXXXXXXX"
                    required
                />
                </div>

                <div>
                <Label htmlFor="address" className="text-base">العنوان</Label>
                <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-2 h-12 rounded-xl bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                    placeholder="المدينة، الحي، الشارع"
                    required
                />
                </div>
            </div>

            <Button 
                type="submit" 
                className="w-full h-12 rounded-xl mt-8 text-base font-medium"
                disabled={!formData.type}
            >
                إنشاء المتجر
            </Button>
            </form>

            <div className="mt-6 p-4 rounded-2xl bg-blue-50 text-blue-700 text-sm">
                بعد إنشاء المتجر، ستحصل على رمز QR خاص يمكن للعملاء مسحه للاشتراك في متجرك
            </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
