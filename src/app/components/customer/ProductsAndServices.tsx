import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Search,
  Package,
  Wrench,
  Trash2,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: 'product' | 'service';
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export function ProductsAndServices() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // TODO: Fetch store data from API
  const [storeData, setStoreData] = useState<{ name: string; logo: string; currency?: string }>({ name: 'المتجر', logo: '🏪', currency: 'SAR' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch store data from API based on storeId
    setLoading(false);
  }, [storeId]);

  // TODO: Fetch products from API
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    // TODO: Fetch products from API based on storeId
    setProducts([]);
  }, [storeId]);

  // Empty products array - no mock data
  const emptyProducts: Product[] = [
    {
      id: '1',
      name: 'أرز بسمتي',
      description: 'أرز بسمتي عالي الجودة 5 كيلو',
      price: 45,
      category: 'product',
      inStock: true
    },
    {
      id: '2',
      name: 'زيت عباد الشمس',
      description: 'زيت عباد الشمس 5 لتر',
      price: 35,
      category: 'product',
      inStock: true
    },
    {
      id: '3',
      name: 'شاي أحمر',
      description: 'شاي أحمر ممتاز 500 جرام',
      price: 25,
      category: 'product',
      inStock: true
    },
    {
      id: '4',
      name: 'خدمة توصيل',
      description: 'توصيل الطلبات للمنزل',
      price: 15,
      category: 'service',
      inStock: true
    },
    {
      id: '5',
      name: 'تغليف هدايا',
      description: 'خدمة تغليف الهدايا',
      price: 10,
      category: 'service',
      inStock: true
    },
    {
      id: '6',
      name: 'سكر أبيض',
      description: 'سكر أبيض ناعم 2 كيلو',
      price: 18,
      category: 'product',
      inStock: false
    }
  ];

  // Use empty array - no mock data
  const actualProducts: Product[] = [];

  const filteredProducts = products.filter(p => 
    p.name.includes(searchQuery) || p.description.includes(searchQuery)
  );

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`تم إضافة ${product.name} إلى السلة`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
    toast.info('تم حذف المنتج من السلة');
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
          return null;
        }
        return { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean) as CartItem[]);
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error('السلة فارغة');
      return;
    }
    setShowCheckout(true);
  };

  const handleConfirmOrder = () => {
    toast.success('تم إرسال الطلب بنجاح!');
    setShowCheckout(false);
    setCart([]);
    setShowCart(false);
    setTimeout(() => {
      navigate(`/wallet/${storeId}`);
    }, 1500);
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <DashboardLayout 
      title="المنتجات والخدمات" 
      subtitle={`تصفح واطلب من ${storeData.name}`}
    >
      <div className="space-y-6">
        {/* Header with Cart Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث عن منتج أو خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 rounded-lg border-gray-200"
            />
          </div>
          {cart.length > 0 && (
            <Button
              onClick={() => setShowCart(true)}
              className="relative bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-11 px-4 shadow-md"
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              <span className="font-bold">السلة</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white font-black">
                  {cartItemsCount}
                </span>
              )}
            </Button>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card 
              key={product.id} 
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all bg-white"
            >
              <div className="space-y-3">
                {/* Product Image/Icon */}
                <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                  {product.category === 'product' ? (
                    <Package className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Wrench className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-sm">{product.name}</h3>
                    <Badge 
                      variant={product.category === 'product' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {product.category === 'product' ? 'منتج' : 'خدمة'}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-lg text-gray-900">
                      {product.price} <span className="text-sm text-gray-500">ر.س</span>
                    </span>
                    {product.inStock ? (
                      <Button
                        size="sm"
                        onClick={() => addToCart(product)}
                        className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-8 px-3"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-400">
                        غير متوفر
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">لا توجد نتائج للبحث</p>
          </div>
        )}

        {/* Floating Cart Button - Mobile */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
            <Button
              onClick={() => setShowCart(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-14 shadow-xl flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full text-xs flex items-center justify-center text-white font-black">
                    {cartItemsCount}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300">إجمالي السلة</p>
                  <p className="font-black text-base">{getTotal()} ر.س</p>
                </div>
              </div>
              <span className="text-sm font-bold">عرض السلة</span>
            </Button>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-gray-700" />
              سلة الطلبات
            </DialogTitle>
            <DialogDescription className="text-right">
              راجع طلبك قبل الإتمام ({cartItemsCount} {cartItemsCount === 1 ? 'عنصر' : 'عناصر'})
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">السلة فارغة</p>
                <p className="text-xs text-gray-400 mt-2">ابدأ بإضافة المنتجات إلى السلة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <Card key={item.id} className="p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shrink-0">
                        {item.category === 'product' ? (
                          <Package className="w-7 h-7 text-gray-600" />
                        ) : (
                          <Wrench className="w-7 h-7 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-sm text-gray-900 mb-0.5">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.price} ر.س للوحدة</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                          <div className="flex items-center gap-2 border-2 border-gray-200 rounded-xl">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-gray-100"
                              onClick={() => updateQuantity(item.id, -1)}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-10 text-center font-black text-sm text-gray-900">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-gray-100"
                              onClick={() => updateQuantity(item.id, 1)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-left">
                            <span className="font-black text-base text-gray-900">
                              {item.price * item.quantity} ر.س
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <DialogFooter className="flex-col gap-3 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl">
                <span className="font-bold text-base text-gray-700">الإجمالي:</span>
                <span className="font-black text-2xl text-gray-900">{getTotal()} ر.س</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl h-12 font-black text-base shadow-md"
              >
                <CreditCard className="w-5 h-5 ml-2" />
                إتمام الطلب والدفع
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowCart(false)}
                className="w-full rounded-xl h-10 text-sm"
              >
                متابعة التسوق
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">تأكيد الطلب</DialogTitle>
            <DialogDescription>
              تأكد من تفاصيل طلبك قبل الإتمام
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">ملخص الطلب:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {item.price * item.quantity} ر.س
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">الإجمالي:</span>
                <span className="font-bold text-xl text-gray-900">{getTotal()} ر.س</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col gap-3">
            <Button
              onClick={handleConfirmOrder}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12"
            >
              <CreditCard className="w-5 h-5 ml-2" />
              تأكيد ودفع
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCheckout(false)}
              className="w-full rounded-lg h-10"
            >
              إلغاء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

