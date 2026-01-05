import { useState } from 'react';
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

  // Mock store data - In real app, this would be fetched based on storeId
  // This should match the store data from CustomerWallet
  const getStoreData = (id: string | undefined) => {
    // Mock stores database - In real app, this would be an API call
    const stores: Record<string, { name: string; logo: string }> = {
      '1': { name: 'سوبر ماركت الرحمة', logo: '🏪' },
      'store-123': { name: 'سوبر ماركت الرحمة', logo: '🏪' },
      'store-abc123xyz': { name: 'مطعم البيك', logo: '🍔' },
    };
    
    return stores[id || '1'] || { name: 'المتجر', logo: '🏪' };
  };

  const storeData = getStoreData(storeId);

  // Mock data - Products and Services
  const products: Product[] = [
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

  return (
    <DashboardLayout 
      title="المنتجات والخدمات" 
      subtitle={`تصفح واطلب من ${storeData.name}`}
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="ابحث عن منتج أو خدمة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 rounded-lg border-gray-200"
          />
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

        {/* Floating Cart Button */}
        {cart.length > 0 && (
          <div className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-80 z-50">
            <Button
              onClick={() => setShowCart(true)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-14 shadow-lg flex items-center justify-between px-6"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-white">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-300">إجمالي السلة</p>
                  <p className="font-bold">{getTotal()} ر.س</p>
                </div>
              </div>
              <span className="text-sm font-medium">عرض السلة</span>
            </Button>
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">سلة الطلبات</DialogTitle>
            <DialogDescription>
              راجع طلبك قبل الإتمام
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {cart.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">السلة فارغة</p>
              </div>
            ) : (
              cart.map((item) => (
                <Card key={item.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      {item.category === 'product' ? (
                        <Package className="w-6 h-6 text-gray-400" />
                      ) : (
                        <Wrench className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-sm text-gray-900">{item.name}</h4>
                          <p className="text-xs text-gray-500">{item.price} ر.س</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-red-600"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <span className="font-bold text-gray-900">
                          {item.price * item.quantity} ر.س
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <DialogFooter className="flex-col gap-3 pt-4 border-t">
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-gray-700">الإجمالي:</span>
                <span className="font-bold text-xl text-gray-900">{getTotal()} ر.س</span>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-12"
              >
                <CreditCard className="w-5 h-5 ml-2" />
                إتمام الطلب والدفع
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

