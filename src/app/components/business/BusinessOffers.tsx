import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Megaphone,
  Image as ImageIcon,
  X,
  Share2,
  Printer,
  ChevronLeft,
  Filter,
  MoreVertical,
  TrendingUp,
  Eye,
  Calendar,
  Clock,
  Tag,
  Percent,
  Users,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Grid3x3,
  List
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

interface Offer {
  id: string;
  title: string;
  description: string;
  type: 'discount' | 'bogo' | 'free_shipping' | 'cashback' | 'special';
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired' | 'draft';
  targetAudience: 'all' | 'new' | 'vip' | 'specific';
  image?: string;
  views: number;
  clicks: number;
  conversions: number;
  createdAt: string;
}

export function BusinessOffers() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'scheduled' | 'expired' | 'draft'>('all');
  const [filterType, setFilterType] = useState<'all' | 'discount' | 'bogo' | 'free_shipping' | 'cashback' | 'special'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'discount' as Offer['type'],
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    status: 'draft' as Offer['status'],
    targetAudience: 'all' as Offer['targetAudience'],
    image: null as File | null
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Mock data
  const offers: Offer[] = [
    {
      id: '1',
      title: 'خصم 20% على جميع المنتجات',
      description: 'عرض خاص لفترة محدودة - خصم 20% على جميع المنتجات',
      type: 'discount',
      discountType: 'percentage',
      discountValue: 20,
      minPurchase: 100,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      status: 'active',
      targetAudience: 'all',
      views: 1250,
      clicks: 320,
      conversions: 85,
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      title: 'اشتري واحد واحصل على الثاني مجاناً',
      description: 'عرض خاص على منتجات مختارة',
      type: 'bogo',
      discountType: 'percentage',
      discountValue: 50,
      startDate: '2024-01-20',
      endDate: '2024-02-20',
      status: 'scheduled',
      targetAudience: 'vip',
      views: 0,
      clicks: 0,
      conversions: 0,
      createdAt: '2024-01-18'
    },
    {
      id: '3',
      title: 'شحن مجاني للطلبات فوق 200 ر.س',
      description: 'استمتع بشحن مجاني على جميع الطلبات التي تتجاوز 200 ريال',
      type: 'free_shipping',
      discountType: 'fixed',
      discountValue: 0,
      minPurchase: 200,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      status: 'active',
      targetAudience: 'all',
      views: 2100,
      clicks: 450,
      conversions: 120,
      createdAt: '2023-12-28'
    },
    {
      id: '4',
      title: 'استرجاع نقدي 5%',
      description: 'احصل على 5% استرجاع نقدي على مشترياتك',
      type: 'cashback',
      discountType: 'percentage',
      discountValue: 5,
      startDate: '2024-01-10',
      endDate: '2024-03-10',
      status: 'active',
      targetAudience: 'all',
      views: 890,
      clicks: 180,
      conversions: 45,
      createdAt: '2024-01-05'
    },
    {
      id: '5',
      title: 'عرض خاص للعملاء الجدد',
      description: 'خصم 15% حصري للعملاء الجدد',
      type: 'discount',
      discountType: 'percentage',
      discountValue: 15,
      minPurchase: 50,
      startDate: '2024-01-25',
      endDate: '2024-02-25',
      status: 'draft',
      targetAudience: 'new',
      views: 0,
      clicks: 0,
      conversions: 0,
      createdAt: '2024-01-22'
    }
  ];

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.title.includes(searchQuery) || offer.description.includes(searchQuery);
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    const matchesType = filterType === 'all' || offer.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeOffers = offers.filter(o => o.status === 'active').length;
  const scheduledOffers = offers.filter(o => o.status === 'scheduled').length;
  const totalViews = offers.reduce((sum, o) => sum + o.views, 0);
  const totalConversions = offers.reduce((sum, o) => sum + o.conversions, 0);

  const getStatusBadge = (status: Offer['status']) => {
    const styles = {
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
      expired: 'bg-gray-100 text-gray-700 border-gray-200',
      draft: 'bg-amber-100 text-amber-700 border-amber-200'
    };
    const labels = {
      active: 'نشط',
      scheduled: 'مجدول',
      expired: 'منتهي',
      draft: 'مسودة'
    };
    return (
      <Badge className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${styles[status]}`}>
        {labels[status]}
      </Badge>
    );
  };

  const getTypeIcon = (type: Offer['type']) => {
    switch (type) {
      case 'discount':
        return <Percent className="w-4 h-4" />;
      case 'bogo':
        return <Tag className="w-4 h-4" />;
      case 'free_shipping':
        return <TrendingUp className="w-4 h-4" />;
      case 'cashback':
        return <Users className="w-4 h-4" />;
      case 'special':
        return <Megaphone className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: Offer['type']) => {
    const labels = {
      discount: 'خصم',
      bogo: 'اشتري واحد احصل على الثاني',
      free_shipping: 'شحن مجاني',
      cashback: 'استرجاع نقدي',
      special: 'عرض خاص'
    };
    return labels[type];
  };

  const handleAddOffer = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      description: '',
      type: 'discount',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      startDate: '',
      endDate: '',
      status: 'draft',
      targetAudience: 'all',
      image: null
    });
    setImagePreview(null);
    setShowAddDialog(true);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      type: offer.type,
      discountType: offer.discountType,
      discountValue: offer.discountValue.toString(),
      minPurchase: offer.minPurchase?.toString() || '',
      maxDiscount: offer.maxDiscount?.toString() || '',
      startDate: offer.startDate,
      endDate: offer.endDate,
      status: offer.status,
      targetAudience: offer.targetAudience,
      image: null
    });
    setImagePreview(offer.image || null);
    setShowAddDialog(true);
  };

  const handleSaveOffer = () => {
    if (!formData.title || !formData.description) {
      toast.error('يرجى إدخال العنوان والوصف');
      return;
    }
    if (editingOffer) {
      toast.success('تم تحديث العرض بنجاح');
    } else {
      toast.success('تم إنشاء العرض بنجاح');
    }
    setShowAddDialog(false);
  };

  const handleDeleteOffer = (id: string) => {
    toast.success('تم حذف العرض');
  };

  const handleShare = async (offer: Offer) => {
    const shareData = {
      title: offer.title,
      text: offer.description,
      url: window.location.href
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('تم نسخ الرابط');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/business/${businessId}/manage`)}
            className="h-9 w-9 rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-black text-gray-900 truncate">العروض والإعلانات</h1>
            <p className="text-xs text-gray-500">إدارة عروضك الترويجية</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="h-9 w-9 rounded-xl"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3x3 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrint}
              className="h-9 w-9 rounded-xl"
            >
              <Printer className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="pb-4">
        <div className="p-4 space-y-3">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                  <span className="text-[10px] font-bold text-emerald-700">نشط</span>
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-emerald-900 leading-none">{activeOffers}</div>
                  <div className="text-[9px] font-bold text-emerald-600 mt-0.5">عرض</div>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-700" />
                  <span className="text-[10px] font-bold text-blue-700">مجدول</span>
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-blue-900 leading-none">{scheduledOffers}</div>
                  <div className="text-[9px] font-bold text-blue-600 mt-0.5">عرض</div>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-purple-700" />
                  <span className="text-[10px] font-bold text-purple-700">مشاهدات</span>
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-purple-900 leading-none">{totalViews.toLocaleString()}</div>
                  <div className="text-[9px] font-bold text-purple-600 mt-0.5">إجمالي</div>
                </div>
              </div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-amber-700" />
                  <span className="text-[10px] font-bold text-amber-700">تحويلات</span>
                </div>
                <div className="text-left">
                  <div className="text-xl font-black text-amber-900 leading-none">{totalConversions}</div>
                  <div className="text-[9px] font-bold text-amber-600 mt-0.5">عملاء</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث في العروض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap ${
                  filterStatus === 'all'
                    ? 'bg-gray-900 text-white border-0'
                    : 'border-2 border-gray-200'
                }`}
              >
                جميع الحالات
              </Button>
              {(['active', 'scheduled', 'expired', 'draft'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap ${
                    filterStatus === status
                      ? 'bg-gray-900 text-white border-0'
                      : 'border-2 border-gray-200'
                  }`}
                >
                  {status === 'active' ? 'نشط' :
                   status === 'scheduled' ? 'مجدول' :
                   status === 'expired' ? 'منتهي' : 'مسودة'}
                </Button>
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <Button
                variant={filterType === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterType('all')}
                className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap ${
                  filterType === 'all'
                    ? 'bg-gray-900 text-white border-0'
                    : 'border-2 border-gray-200'
                }`}
              >
                جميع الأنواع
              </Button>
              {(['discount', 'bogo', 'free_shipping', 'cashback', 'special'] as const).map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? 'default' : 'outline'}
                  onClick={() => setFilterType(type)}
                  className={`h-9 px-4 rounded-xl text-xs font-bold whitespace-nowrap ${
                    filterType === type
                      ? 'bg-gray-900 text-white border-0'
                      : 'border-2 border-gray-200'
                  }`}
                >
                  {getTypeLabel(type)}
                </Button>
              ))}
            </div>
          </div>

          {/* Add Button */}
          <Button
            onClick={handleAddOffer}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-sm shadow-sm"
          >
            <Plus className="w-5 h-5 ml-2" />
            إنشاء عرض جديد
          </Button>

          {/* Offers List/Grid */}
          {filteredOffers.length === 0 ? (
            <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-black text-gray-900 mb-1">لا توجد عروض</h3>
              <p className="text-sm text-gray-600 mb-4">ابدأ بإنشاء عرض ترويجي جديد</p>
              <Button
                onClick={handleAddOffer}
                className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-10 px-5 font-bold"
              >
                إنشاء عرض جديد
              </Button>
            </Card>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 gap-3">
              {filteredOffers.map((offer) => (
                <Card
                  key={offer.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="space-y-2">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            {getTypeIcon(offer.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-gray-900 truncate">{offer.title}</h3>
                            <p className="text-[10px] text-gray-500">{getTypeLabel(offer.type)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {getStatusBadge(offer.status)}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-600 line-clamp-2">{offer.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-600">{offer.views}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-gray-400" />
                        <span className="text-[10px] text-gray-600">{offer.conversions}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>حتى {offer.endDate}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOffer(offer)}
                        className="flex-1 h-8 text-[10px] font-bold rounded-lg border-gray-200"
                      >
                        <Edit className="w-3 h-3 ml-1" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(offer)}
                        className="flex-1 h-8 text-[10px] font-bold rounded-lg border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Share2 className="w-3 h-3 ml-1" />
                        مشاركة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="h-8 w-8 p-0 text-[10px] font-bold rounded-lg border-red-200 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOffers.map((offer) => (
                <Card
                  key={offer.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shrink-0">
                      {getTypeIcon(offer.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 mb-0.5">{offer.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-1">{offer.description}</p>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {offer.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {offer.conversions}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          حتى {offer.endDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOffer(offer)}
                        className="h-7 w-7 p-0 rounded-lg border-gray-200"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(offer)}
                        className="h-7 w-7 p-0 rounded-lg border-blue-200 text-blue-700"
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteOffer(offer.id)}
                        className="h-7 w-7 p-0 rounded-lg border-red-200 text-red-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Offer Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {editingOffer ? 'تعديل العرض' : 'إنشاء عرض جديد'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">عنوان العرض</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="مثال: خصم 20% على جميع المنتجات"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">الوصف</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-24 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="وصف تفصيلي للعرض..."
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">نوع العرض</Label>
              <Select
                value={formData.type}
                onValueChange={(value: Offer['type']) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">خصم</SelectItem>
                  <SelectItem value="bogo">اشتري واحد احصل على الثاني</SelectItem>
                  <SelectItem value="free_shipping">شحن مجاني</SelectItem>
                  <SelectItem value="cashback">استرجاع نقدي</SelectItem>
                  <SelectItem value="special">عرض خاص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(formData.type === 'discount' || formData.type === 'cashback') && (
              <>
                <div>
                  <Label className="text-xs font-bold text-gray-700 mb-2 block">نوع الخصم</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">نسبة مئوية (%)</SelectItem>
                      <SelectItem value="fixed">مبلغ ثابت (ر.س)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-gray-700 mb-2 block">
                    قيمة الخصم {formData.discountType === 'percentage' ? '(%)' : '(ر.س)'}
                  </Label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                    placeholder="0"
                  />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">الحد الأدنى للشراء (ر.س) - اختياري</Label>
              <Input
                type="number"
                value={formData.minPurchase}
                onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">الحد الأقصى للخصم (ر.س) - اختياري</Label>
              <Input
                type="number"
                value={formData.maxDiscount}
                onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs font-bold text-gray-700 mb-2 block">تاريخ البدء</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                />
              </div>
              <div>
                <Label className="text-xs font-bold text-gray-700 mb-2 block">تاريخ الانتهاء</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Offer['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">الفئة المستهدفة</Label>
              <Select
                value={formData.targetAudience}
                onValueChange={(value: Offer['targetAudience']) => setFormData({ ...formData, targetAudience: value })}
              >
                <SelectTrigger className="h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع العملاء</SelectItem>
                  <SelectItem value="new">العملاء الجدد فقط</SelectItem>
                  <SelectItem value="vip">العملاء المميزين فقط</SelectItem>
                  <SelectItem value="specific">عملاء محددين</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-bold text-gray-700 mb-2 block">صورة العرض - اختياري</Label>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute top-2 left-2 h-7 w-7 rounded-lg bg-white/90 hover:bg-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <label className="flex items-center justify-center gap-2 h-11 rounded-xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors">
                  <ImageIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-600">اختر صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2">
            <Button
              onClick={handleSaveOffer}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-sm"
            >
              {editingOffer ? 'حفظ التعديلات' : 'إنشاء العرض'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAddDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Offer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-sm rounded-2xl border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">تفاصيل العرض</DialogTitle>
          </DialogHeader>
          {selectedOffer && (
            <div className="space-y-4 py-4">
              <div>
                <h3 className="text-base font-black text-gray-900 mb-1">{selectedOffer.title}</h3>
                <p className="text-sm text-gray-600">{selectedOffer.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-gray-50 rounded-xl">
                  <div className="text-[10px] text-gray-500 mb-1">المشاهدات</div>
                  <div className="text-lg font-black text-gray-900">{selectedOffer.views.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <div className="text-[10px] text-gray-500 mb-1">النقرات</div>
                  <div className="text-lg font-black text-gray-900">{selectedOffer.clicks.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <div className="text-[10px] text-gray-500 mb-1">التحويلات</div>
                  <div className="text-lg font-black text-gray-900">{selectedOffer.conversions.toLocaleString()}</div>
                </div>
                <div className="p-2 bg-gray-50 rounded-xl">
                  <div className="text-[10px] text-gray-500 mb-1">معدل التحويل</div>
                  <div className="text-lg font-black text-gray-900">
                    {selectedOffer.views > 0 ? ((selectedOffer.conversions / selectedOffer.views) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-2">
            <Button
              variant="ghost"
              onClick={() => setShowDetailsDialog(false)}
              className="w-full rounded-xl h-10 text-sm"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

