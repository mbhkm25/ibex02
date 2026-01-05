import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Upload, 
  Lock, 
  FileText,
  Package,
  Wrench,
  X,
  CheckCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { DashboardLayout } from '../layout/DashboardLayout';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface FormData {
  businessName: string;
  contactInfo: string;
  address: string;
  logo: File | null;
  managerPhone: string;
  email: string;
  password: string;
  description: string;
  businessType: 'products' | 'services' | 'both';
}

export function BusinessServiceRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    contactInfo: '',
    address: '',
    logo: null,
    managerPhone: '',
    email: '',
    password: '',
    description: '',
    businessType: 'both'
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessDialog(true);
      toast.success('تم إرسال طلبك بنجاح! سيتم مراجعته من قبل المسؤول');
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    navigate('/dashboard');
  };

  return (
    <DashboardLayout 
      title="طلب خدمة إدارة العملاء" 
      subtitle="أكمل البيانات التالية لطلب خدمة إدارة العملاء"
    >
      <div className="max-w-3xl mx-auto">
        <Card className="p-10 border-2 border-gray-300 rounded-2xl bg-white shadow-lg">
          <div className="mb-8 pb-6 border-b-2 border-gray-200">
            <h2 className="text-2xl font-black text-gray-900 mb-2">طلب خدمة إدارة العملاء</h2>
            <p className="text-gray-600">أكمل جميع الحقول المطلوبة لإرسال طلبك</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-semibold text-gray-900">
                اسم العمل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
                placeholder="أدخل اسم العمل"
                required
              />
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <Label htmlFor="contactInfo" className="text-sm font-semibold text-gray-900">
                معلومات التواصل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contactInfo"
                type="text"
                value={formData.contactInfo}
                onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
                placeholder="رقم الهاتف، الموقع الإلكتروني، إلخ"
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-semibold text-gray-900">
                العنوان <span className="text-red-500">*</span>
              </Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
                placeholder="العنوان الكامل للعمل"
                required
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-sm font-semibold text-gray-900">
                لوقو العمل <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="h-11 rounded-lg border-gray-200"
                    required
                  />
                </div>
                {logoPreview && (
                  <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden">
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            {/* Manager Phone */}
            <div className="space-y-2">
              <Label htmlFor="managerPhone" className="text-sm font-semibold text-gray-900">
                جوال التواصل مع مدير العمل <span className="text-red-500">*</span>
              </Label>
              <Input
                id="managerPhone"
                type="tel"
                dir="ltr"
                value={formData.managerPhone}
                onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
                placeholder="+966 5XXXXXXXX"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                البريد الإلكتروني
              </Label>
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
                placeholder="example@email.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-900">
                كلمة المرور <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-11 rounded-lg border-gray-200"
                placeholder="كلمة مرور قوية"
                required
                minLength={8}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-semibold text-gray-900">
                توصيف العمل <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-24 rounded-lg border-gray-200"
                placeholder="اكتب وصفاً مختصراً عن عملك"
                required
              />
            </div>

            {/* Business Type */}
            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-semibold text-gray-900">
                ما يقدمه العمل <span className="text-red-500">*</span>
              </Label>
              <Select 
                value={formData.businessType} 
                onValueChange={(value: 'products' | 'services' | 'both') => 
                  setFormData({ ...formData, businessType: value })
                }
              >
                <SelectTrigger className="h-11 rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="products">منتجات فقط</SelectItem>
                  <SelectItem value="services">خدمات فقط</SelectItem>
                  <SelectItem value="both">منتجات وخدمات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-200">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-14 font-black text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl h-14 border-2 border-gray-300 font-semibold"
              >
                إلغاء
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              تم إرسال طلبك بنجاح
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              سيتم مراجعة طلبك من قبل المسؤول. سيتم إشعارك عند الموافقة على الطلب.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleCloseSuccess}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-11"
            >
              العودة للوحة التحكم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

