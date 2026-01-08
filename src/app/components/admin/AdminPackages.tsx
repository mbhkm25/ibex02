import { useState } from 'react';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Filter
} from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { AdminLayout } from './AdminLayout';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';

interface SubscriptionPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'SAR' | 'YER' | 'USD';
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  maxCustomers?: number;
  maxProducts?: number;
  maxTransactions?: number;
  status: 'active' | 'inactive' | 'archived';
  subscribersCount: number;
  createdAt: string;
}

export function AdminPackages() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<SubscriptionPackage | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    currency: 'SAR' as 'SAR' | 'YER' | 'USD',
    billingCycle: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    features: [] as string[],
    maxCustomers: '',
    maxProducts: '',
    maxTransactions: '',
    status: 'active' as 'active' | 'inactive' | 'archived'
  });
  const [newFeature, setNewFeature] = useState('');

  // Mock Data
  const packages: SubscriptionPackage[] = [
    {
      id: '1',
      name: 'باقة أساسية',
      description: 'مناسبة للمتاجر الصغيرة',
      price: 500,
      currency: 'SAR',
      billingCycle: 'monthly',
      features: ['حتى 100 عميل', 'حتى 500 منتج', 'معاملات غير محدودة', 'دعم فني'],
      maxCustomers: 100,
      maxProducts: 500,
      status: 'active',
      subscribersCount: 45,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'باقة متوسطة',
      description: 'مناسبة للمتاجر المتوسطة',
      price: 1000,
      currency: 'SAR',
      billingCycle: 'monthly',
      features: ['حتى 500 عميل', 'حتى 2000 منتج', 'معاملات غير محدودة', 'دعم فني أولوية', 'تقارير متقدمة'],
      maxCustomers: 500,
      maxProducts: 2000,
      status: 'active',
      subscribersCount: 23,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'باقة احترافية',
      description: 'مناسبة للمتاجر الكبيرة',
      price: 2000,
      currency: 'SAR',
      billingCycle: 'monthly',
      features: ['عملاء غير محدودين', 'منتجات غير محدودة', 'معاملات غير محدودة', 'دعم فني 24/7', 'تقارير متقدمة', 'API مخصص'],
      status: 'active',
      subscribersCount: 8,
      createdAt: '2024-01-01'
    },
  ];

  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (selectedPackage) {
      toast.success('تم تحديث الباقة بنجاح');
    } else {
      toast.success('تم إضافة الباقة بنجاح');
    }

    setShowAddDialog(false);
    setShowEditDialog(false);
    setSelectedPackage(null);
    // Reset form
    setFormData({
      name: '',
      description: '',
      price: '',
      currency: 'SAR',
      billingCycle: 'monthly',
      features: [],
      maxCustomers: '',
      maxProducts: '',
      maxTransactions: '',
      status: 'active'
    });
  };

  const handleEdit = (pkg: SubscriptionPackage) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      currency: pkg.currency,
      billingCycle: pkg.billingCycle,
      features: pkg.features,
      maxCustomers: pkg.maxCustomers?.toString() || '',
      maxProducts: pkg.maxProducts?.toString() || '',
      maxTransactions: pkg.maxTransactions?.toString() || '',
      status: pkg.status
    });
    setShowEditDialog(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الباقة؟')) {
      toast.success('تم حذف الباقة');
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    const cycles = {
      monthly: 'شهري',
      quarterly: 'ربع سنوي',
      yearly: 'سنوي'
    };
    return cycles[cycle as keyof typeof cycles] || cycle;
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'SAR': return 'ر.س';
      case 'YER': return 'ر.ي';
      case 'USD': return '$';
      default: return 'ر.س';
    }
  };

  return (
    <AdminLayout 
      title="إدارة الباقات" 
      subtitle="إنشاء وإدارة باقات الاشتراك للمتاجر"
    >
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Card className="flex-1 p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن باقة..."
                  className="pr-10 h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                />
              </div>
              <Button variant="outline" className="h-11 rounded-xl border-2 border-gray-200">
                <Filter className="w-4 h-4 ml-2" />
                فلترة
              </Button>
            </div>
          </Card>
          <Button
            onClick={() => {
              setSelectedPackage(null);
              setFormData({
                name: '',
                description: '',
                price: '',
                currency: 'SAR',
                billingCycle: 'monthly',
                features: [],
                maxCustomers: '',
                maxProducts: '',
                maxTransactions: '',
                status: 'active'
              });
              setShowAddDialog(true);
            }}
            className="h-11 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة باقة جديدة
          </Button>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-black text-gray-900">{pkg.name}</h3>
                    <Badge className={`text-[9px] px-2 py-0.5 ${
                      pkg.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                        : 'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                      {pkg.status === 'active' ? 'نشطة' : 'غير نشطة'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{pkg.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">السعر</span>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-black text-gray-900">
                      {pkg.price.toLocaleString()} {getCurrencySymbol(pkg.currency)}
                    </div>
                    <div className="text-[10px] text-gray-500">
                      / {getBillingCycleLabel(pkg.billingCycle)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-blue-600">المشتركين</span>
                  </div>
                  <div className="text-base font-black text-blue-900">
                    {pkg.subscribersCount}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-700 mb-1">المميزات:</div>
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                      <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {pkg.features.length > 3 && (
                    <div className="text-xs text-gray-400">+{pkg.features.length - 3} مميزات أخرى</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(pkg)}
                  className="flex-1 h-9 rounded-lg border-2 border-gray-200"
                >
                  <Edit className="w-3.5 h-3.5 ml-1.5" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(pkg.id)}
                  className="h-9 w-9 rounded-lg border-2 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
          if (!open) {
            setShowAddDialog(false);
            setShowEditDialog(false);
            setSelectedPackage(null);
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-black">
                {selectedPackage ? 'تعديل الباقة' : 'إضافة باقة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {selectedPackage ? 'قم بتعديل بيانات الباقة' : 'أدخل بيانات الباقة الجديدة'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">اسم الباقة *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: باقة أساسية"
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">دورة الفوترة</Label>
                  <Select value={formData.billingCycle} onValueChange={(v) => setFormData({ ...formData, billingCycle: v as typeof formData.billingCycle })}>
                    <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">شهري</SelectItem>
                      <SelectItem value="quarterly">ربع سنوي</SelectItem>
                      <SelectItem value="yearly">سنوي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف الباقة..."
                  className="rounded-xl border-2 border-gray-200 focus:border-red-400"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">السعر *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">العملة</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v as typeof formData.currency })}>
                    <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SAR">ريال سعودي (ر.س)</SelectItem>
                      <SelectItem value="YER">ريال يمني (ر.ي)</SelectItem>
                      <SelectItem value="USD">دولار أمريكي ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">الحد الأقصى للعملاء</Label>
                  <Input
                    type="number"
                    value={formData.maxCustomers}
                    onChange={(e) => setFormData({ ...formData, maxCustomers: e.target.value })}
                    placeholder="غير محدود"
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">الحد الأقصى للمنتجات</Label>
                  <Input
                    type="number"
                    value={formData.maxProducts}
                    onChange={(e) => setFormData({ ...formData, maxProducts: e.target.value })}
                    placeholder="غير محدود"
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                  />
                </div>
                <div>
                  <Label className="text-sm font-bold text-gray-700 mb-2 block">الحد الأقصى للمعاملات</Label>
                  <Input
                    type="number"
                    value={formData.maxTransactions}
                    onChange={(e) => setFormData({ ...formData, maxTransactions: e.target.value })}
                    placeholder="غير محدود"
                    className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">المميزات</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                      placeholder="أضف مميزة جديدة"
                      className="h-10 rounded-xl border-2 border-gray-200 focus:border-red-400"
                    />
                    <Button
                      type="button"
                      onClick={handleAddFeature}
                      className="h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-700">{feature}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFeature(index)}
                          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-bold text-gray-700 mb-2 block">الحالة</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as typeof formData.status })}>
                  <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 focus:border-red-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشطة</SelectItem>
                    <SelectItem value="inactive">غير نشطة</SelectItem>
                    <SelectItem value="archived">مؤرشفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false);
                  setShowEditDialog(false);
                  setSelectedPackage(null);
                }}
                className="rounded-xl"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black"
              >
                {selectedPackage ? 'حفظ التعديلات' : 'إضافة الباقة'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

