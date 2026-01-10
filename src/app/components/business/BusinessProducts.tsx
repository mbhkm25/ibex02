import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Package,
  Image as ImageIcon,
  X,
  Share2,
  Printer,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Folder,
  FolderOpen,
  Filter,
  MoreVertical,
  TrendingUp,
  Eye,
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
import { ProductImages } from './ProductImages';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'product' | 'service';
  categoryId: string;
  image?: string;
  inStock: boolean;
  active: boolean;
  createdAt: string;
}

interface ProductCategory {
  id: string;
  name: string;
  products: Product[];
}

export function BusinessProducts() {
  const navigate = useNavigate();
  const { businessId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'product' | 'service'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'product' as 'product' | 'service',
    categoryId: '',
    inStock: true,
    active: true,
    image: null as File | null
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // TODO: Fetch products from API
  // This feature requires business activation
  // All data must come from database via API
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasActiveBusiness, setHasActiveBusiness] = useState(false);

  useEffect(() => {
    // TODO: Check if business is activated and fetch products
    // For now, assume no active business
    setHasActiveBusiness(false);
    setCategories([]);
    setLoading(false);
  }, []);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showProductActions, setShowProductActions] = useState<string | null>(null);

  const allProducts = categories.flatMap(cat => cat.products);
  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.includes(searchQuery) || p.description.includes(searchQuery);
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Statistics
  const totalProducts = allProducts.length;
  const activeProducts = allProducts.filter(p => p.active).length;
  const inStockProducts = allProducts.filter(p => p.inStock).length;
  const totalCategories = categories.length;

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
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

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsDialog(true);
  };

  const handleShare = (product: Product) => {
    const shareText = `${product.name} - ${product.price} ر.س\n${product.description}`;
    const shareUrl = `${window.location.origin}/wallet/${businessId}/products?product=${product.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: shareText,
        url: shareUrl
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم نسخ الرابط');
  };

  const toggleStock = (productId: string) => {
    toast.success('تم تحديث حالة المخزون');
  };

  const toggleActiveStatus = (productId: string) => {
    toast.success('تم تحديث حالة المنتج');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'product',
      categoryId: categories[0]?.id || '',
      inStock: true,
      active: true,
      image: null
    });
    setImagePreview(null);
    setShowAddDialog(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      categoryId: product.categoryId,
      inStock: product.inStock,
      active: product.active,
      image: null
    });
    setImagePreview(product.image || null);
    setShowAddDialog(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('يرجى إدخال جميع الحقول المطلوبة');
      return;
    }

    if (editingProduct) {
      toast.success('تم تحديث المنتج بنجاح');
    } else {
      toast.success('تم إضافة المنتج بنجاح');
    }
    
    setShowAddDialog(false);
    setEditingProduct(null);
  };

  const handleDelete = (productId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      toast.success('تم حذف المنتج بنجاح');
    }
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast.error('يرجى إدخال اسم الفئة');
      return;
    }
    toast.success('تم إضافة الفئة بنجاح');
    setNewCategoryName('');
    setShowCategoryDialog(false);
  };

  // Show empty state if business is not activated
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveBusiness) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
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
              <h1 className="text-lg font-black text-gray-900 truncate">المنتجات والخدمات</h1>
              <p className="text-xs text-gray-500">إدارة منتجاتك وخدماتك</p>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Card className="p-8 border-2 border-gray-200 rounded-xl bg-white text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900 mb-2">العمل غير مفعّل</h2>
            <p className="text-sm text-gray-600 mb-6">
              هذه الميزة متاحة فقط بعد تفعيل عملك.<br />
              يرجى الانتظار حتى يتم اعتماد طلبك وتفعيل العمل من قبل المسؤول.
            </p>
            <Button
              onClick={() => navigate('/business/my-requests')}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-11 px-6 font-black"
            >
              عرض طلباتي
            </Button>
          </Card>
        </main>
      </div>
    );
  }

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
            <h1 className="text-lg font-black text-gray-900 truncate">المنتجات والخدمات</h1>
            <p className="text-xs text-gray-500">إدارة منتجاتك وخدماتك</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleOpenAdd}
            className="h-9 w-9 rounded-xl"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="pb-4">
        {/* Quick Stats */}
        <div className="p-4 pb-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="p-3 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Package className="w-3.5 h-3.5 text-blue-700" />
                <span className="text-[10px] font-bold text-blue-700 uppercase">المنتجات</span>
              </div>
              <div className="text-lg font-black text-blue-900">{totalProducts}</div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-emerald-50 to-emerald-100/50 border border-emerald-200/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-[10px] font-bold text-emerald-700 uppercase">نشط</span>
              </div>
              <div className="text-lg font-black text-emerald-900">{activeProducts}</div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-amber-50 to-amber-100/50 border border-amber-200/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Package className="w-3.5 h-3.5 text-amber-700" />
                <span className="text-[10px] font-bold text-amber-700 uppercase">متوفر</span>
              </div>
              <div className="text-lg font-black text-amber-900">{inStockProducts}</div>
            </Card>
            <Card className="p-3 bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200/50 rounded-2xl">
              <div className="flex items-center gap-2 mb-1.5">
                <Folder className="w-3.5 h-3.5 text-purple-700" />
                <span className="text-[10px] font-bold text-purple-700 uppercase">الفئات</span>
              </div>
              <div className="text-lg font-black text-purple-900">{totalCategories}</div>
            </Card>
          </div>
        </div>

        <div className="space-y-3 px-4">
          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث عن منتج أو خدمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                <SelectTrigger className="flex-1 h-10 rounded-xl border-2 border-gray-200 text-sm">
                  <Filter className="w-4 h-4 ml-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="product">منتجات</SelectItem>
                  <SelectItem value="service">خدمات</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-2 border-gray-200"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
              </Button>
              <Button
                onClick={handlePrint}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-2 border-gray-200"
              >
                <Printer className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowCategoryDialog(true)}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-xl border-2 border-gray-200"
              >
                <Folder className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products View */}
          {viewMode === 'grid' ? (
            // Grid View
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => {
                const category = categories.find(cat => cat.id === product.categoryId);
                return (
                  <Card
                    key={product.id}
                    className="p-3 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 transition-all cursor-pointer overflow-hidden"
                    onClick={() => handleOpenDetails(product)}
                  >
                    <div className="relative mb-2">
                      <div className="w-full h-32 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <div className="absolute top-2 left-2 flex gap-1">
                        <Badge 
                          className={`text-[9px] font-bold px-1.5 py-0.5 ${
                            product.active ? 'bg-emerald-500 text-white' : 'bg-gray-500 text-white'
                          }`}
                        >
                          {product.active ? 'نشط' : 'معطل'}
                        </Badge>
                        {product.category === 'product' && (
                          <Badge 
                            className={`text-[9px] font-bold px-1.5 py-0.5 ${
                              product.inStock ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                            }`}
                          >
                            {product.inStock ? 'متوفر' : 'غير متوفر'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="font-black text-sm text-gray-900 line-clamp-1">{product.name}</h3>
                      <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                      <div className="flex items-center justify-between pt-1">
                        <div className="text-base font-black text-gray-900">{product.price} ر.س</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowProductActions(showProductActions === product.id ? null : product.id);
                          }}
                          className="h-7 w-7 p-0 rounded-lg"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {showProductActions === product.id && (
                      <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(product);
                            setShowProductActions(null);
                          }}
                          className="w-full h-8 justify-start text-xs font-semibold"
                        >
                          <Edit className="w-3.5 h-3.5 ml-1.5" />
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(product);
                            setShowProductActions(null);
                          }}
                          className="w-full h-8 justify-start text-xs font-semibold"
                        >
                          <Share2 className="w-3.5 h-3.5 ml-1.5" />
                          مشاركة
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(product.id);
                            setShowProductActions(null);
                          }}
                          className="w-full h-8 justify-start text-xs font-semibold text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5 ml-1.5" />
                          حذف
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            // List View with Categories
            <div className="space-y-2">
              {categories.map((category) => {
                const isExpanded = expandedCategories.has(category.id);
                const categoryProducts = category.products.filter(p => {
                  const matchesSearch = p.name.includes(searchQuery) || p.description.includes(searchQuery);
                  const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
                  return matchesSearch && matchesCategory;
                });

                if (categoryProducts.length === 0 && searchQuery) return null;

                return (
                  <Card key={category.id} className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <FolderOpen className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Folder className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="font-black text-sm text-gray-900">{category.name}</span>
                        <Badge className="text-[10px] font-bold bg-gray-200 text-gray-700">{categoryProducts.length}</Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-600" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="divide-y divide-gray-100">
                        {categoryProducts.map((product) => (
                          <div
                            key={product.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                            onClick={() => handleOpenDetails(product)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
                                {product.image ? (
                                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-black text-base text-gray-900 mb-1">{product.name}</div>
                                    <div className="text-xs text-gray-600 line-clamp-2">{product.description}</div>
                                  </div>
                                  <div className="text-right shrink-0">
                                    <div className="font-black text-lg text-gray-900">{product.price} ر.س</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge 
                                    variant={product.category === 'product' ? 'default' : 'secondary'}
                                    className="text-[10px] font-bold"
                                  >
                                    {product.category === 'product' ? 'منتج' : 'خدمة'}
                                  </Badge>
                                  {product.category === 'product' && (
                                    <Badge 
                                      className={`text-[10px] font-bold ${
                                        product.inStock 
                                          ? 'bg-emerald-100 text-emerald-700' 
                                          : 'bg-red-100 text-red-700'
                                      }`}
                                    >
                                      {product.inStock ? 'متوفر' : 'غير متوفر'}
                                    </Badge>
                                  )}
                                  <Badge 
                                    className={`text-[10px] font-bold ${
                                      product.active 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}
                                  >
                                    {product.active ? 'نشط' : 'معطل'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <Card className="p-8 bg-white border border-gray-200 rounded-2xl text-center">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600 mb-1">لا توجد منتجات</p>
              <p className="text-xs text-gray-500">ابدأ بإضافة منتج جديد</p>
            </Card>
          )}
        </div>
      </main>

      {/* Product Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">{selectedProduct?.name}</DialogTitle>
            <DialogDescription>{selectedProduct?.description}</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4 py-4">
              <div className="w-full h-48 rounded-lg bg-gray-100 flex items-center justify-center">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-1">السعر</div>
                  <div className="text-lg font-black text-gray-900">{selectedProduct.price} ر.س</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-1">النوع</div>
                  <Badge variant={selectedProduct.category === 'product' ? 'default' : 'secondary'}>
                    {selectedProduct.category === 'product' ? 'منتج' : 'خدمة'}
                  </Badge>
                </div>
                {selectedProduct.category === 'product' && (
                  <div>
                    <div className="text-xs font-bold text-gray-600 mb-1">المخزون</div>
                    <div className={`text-sm font-bold ${selectedProduct.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedProduct.inStock ? 'متوفر' : 'غير متوفر'}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-xs font-bold text-gray-600 mb-1">الحالة</div>
                  <div className={`text-sm font-bold ${selectedProduct.active ? 'text-green-600' : 'text-gray-600'}`}>
                    {selectedProduct.active ? 'نشط' : 'معطل'}
                  </div>
                </div>
              </div>
              
              {/* Product Images Section */}
              {businessId && (
                <div className="pt-4 border-t border-gray-200">
                  <ProductImages productId={selectedProduct.id} businessId={businessId} />
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => selectedProduct && handleShare(selectedProduct)}
              className="flex-1 sm:flex-initial rounded-lg h-10 font-bold"
            >
              <Share2 className="w-4 h-4 ml-2" />
              مشاركة
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct) {
                  handleOpenEdit(selectedProduct);
                  setShowDetailsDialog(false);
                }
              }}
              className="flex-1 sm:flex-initial bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-black"
            >
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black">إضافة فئة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">اسم الفئة</Label>
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="h-10 rounded-lg border-2 border-gray-300"
                placeholder="مثال: الحلويات"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCategoryDialog(false)}
              className="rounded-lg h-10 font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAddCategory}
              className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-black"
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl rounded-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-black">
              {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">الفئة <span className="text-red-500">*</span></Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger className="h-10 rounded-lg border-2 border-gray-300">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">صورة المنتج</Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="h-10 rounded-lg border-2 border-gray-300"
                  />
                </div>
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-lg border-2 border-gray-300 overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: null });
                      }}
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">اسم المنتج/الخدمة <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10 rounded-lg border-2 border-gray-300"
                placeholder="أدخل اسم المنتج"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold">الوصف <span className="text-red-500">*</span></Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-20 rounded-lg border-2 border-gray-300"
                placeholder="أدخل وصف المنتج"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm font-bold">النوع <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: 'product' | 'service') => 
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger className="h-10 rounded-lg border-2 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">منتج</SelectItem>
                    <SelectItem value="service">خدمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold">السعر (ر.س) <span className="text-red-500">*</span></Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="h-10 rounded-lg border-2 border-gray-300"
                  placeholder="0.00"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {formData.category === 'product' && (
              <div className="space-y-2">
                <Label className="text-sm font-bold">حالة المخزون</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 rounded border-2 border-gray-300"
                  />
                  <span className="text-sm font-semibold">متوفر في المخزون</span>
                </label>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-bold">حالة النشر</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 rounded border-2 border-gray-300"
                />
                <span className="text-sm font-semibold">نشط (يظهر للعملاء)</span>
              </label>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="flex-1 sm:flex-initial rounded-lg h-10 font-bold"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 sm:flex-initial bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 font-black"
            >
              {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
