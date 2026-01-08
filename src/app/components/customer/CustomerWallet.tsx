import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronRight, 
  Receipt, 
  MessageCircle, 
  TrendingUp, 
  Wallet,
  ShoppingBag,
  ArrowUp,
  Clock,
  Info,
  CheckCircle,
  FileText,
  HelpCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { DashboardLayout } from '../layout/DashboardLayout';
import { toast } from 'sonner';

export function CustomerWallet() {
  const navigate = useNavigate();
  const { storeId } = useParams();

  // Mock data
  const wallet = {
    storeName: 'سوبر ماركت الرحمة',
    storeLogo: '🏪',
    balance: 250,
    creditStatus: 'نقدي',
    creditLimit: 0,
    creditRequestStatus: null as 'pending' | 'approved' | 'rejected' | null,
    suggestedCreditLimit: 500,
  };

  const transactions = [
    { id: '1', type: 'purchase', amount: -45, date: 'اليوم، 2:30 م', note: 'شراء مواد غذائية', icon: ShoppingBag },
    { id: '2', type: 'topup', amount: +300, date: 'أمس، 11:15 ص', note: 'إضافة رصيد', icon: ArrowUp },
    { id: '3', type: 'purchase', amount: -50, date: '2 يناير، 4:20 م', note: 'شراء', icon: ShoppingBag },
  ];

  const getNextBestAction = () => {
    if (wallet.balance === 0) {
      return {
        title: 'ابدأ بمسح كود المتجر',
        description: 'قم بمسح كود المتجر للاشتراك وإضافة رصيد',
        action: () => navigate('/scan/store')
      };
    }
    return null;
  };

  const nextAction = getNextBestAction();

  const handleRequestCredit = () => {
    toast.info('جاري إرسال طلبك...');
    setTimeout(() => {
      toast.success('تم إرسال طلبك! سيتم مراجعته قريباً');
    }, 1500);
  };

  return (
    <DashboardLayout 
      title={wallet.storeName} 
      subtitle="إدارة رصيدك واشتراكاتك"
    >
      <div className="space-y-5">
        {/* Store Header - Professional */}
        <Card className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-2xl border border-gray-200">
              {wallet.storeLogo}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-0.5">{wallet.storeName}</h2>
              <p className="text-sm text-gray-500">متجرك المفضل</p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg">
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        {/* Balance Card - Professional Layout */}
        <Card className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Balance */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wallet className="w-4 h-4" />
                <span>رصيدك الحالي</span>
              </div>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${wallet.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                  {wallet.balance >= 0 ? '+' : ''}{wallet.balance}
                </p>
                <span className="text-lg font-medium text-gray-500">ر.س</span>
              </div>
            </div>

            {/* Right: Status */}
            <div className="flex flex-col justify-center space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                {wallet.creditStatus === 'نقدي' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-orange-600" />
                )}
                <div>
                  <p className="text-xs text-gray-500">حالة الحساب</p>
                  <p className="font-semibold text-gray-900">{wallet.creditStatus}</p>
                </div>
              </div>
              {wallet.creditLimit > 0 && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-xs text-gray-500">سقف الآجل</p>
                    <p className="font-semibold text-gray-900">{wallet.creditLimit} ر.س</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Combined Action & Credit Card - Professional & Dense */}
        {(nextAction || (wallet.creditLimit === 0 && wallet.balance >= 0)) && (
          <Card className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    {nextAction ? nextAction.title : 'الشراء بالآجل'}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {nextAction ? nextAction.description : 'اطلب اعتماد الشراء بالآجل من المتجر. الشراء بالآجل يخضع لموافقة إدارة المتجر.'}
                  </p>
                </div>
                {wallet.creditLimit === 0 && wallet.balance >= 0 && (
                  <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Info & Actions - Compact Row */}
              {wallet.creditLimit === 0 && wallet.balance >= 0 && (
                <>
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">السقف المقترح:</span>
                      <span className="font-semibold text-gray-900">{wallet.suggestedCreditLimit} ر.س</span>
                    </div>
                    {wallet.creditRequestStatus === 'pending' && (
                      <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700 text-xs">
                        قيد المراجعة
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button 
                      size="sm" 
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium h-9 px-4"
                      onClick={handleRequestCredit}
                      disabled={wallet.creditRequestStatus === 'pending'}
                    >
                      {wallet.creditRequestStatus === 'pending' ? 'قيد المراجعة' : 'طلب اعتماد'}
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900 h-9 px-3">
                          <Info className="w-3 h-3 ml-1" />
                          كيف يعمل؟
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="rounded-xl max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-base font-bold">الشراء بالآجل</DialogTitle>
                          <DialogDescription className="text-right leading-relaxed text-sm">
                            الشراء بالآجل يخضع لموافقة إدارة المتجر. يمكنك الشراء الآن والدفع لاحقاً حسب الاتفاق مع المتجر.
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </div>
                </>
              )}

              {/* Next Action Button */}
              {nextAction && (
                <div className="pt-3 border-t border-gray-100">
                  <Button 
                    size="sm" 
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium h-10"
                    onClick={nextAction.action}
                  >
                    {nextAction.title}
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="h-12 rounded-lg border border-gray-200 hover:bg-gray-50"
            onClick={() => navigate(`/wallet/${storeId}/products`)}
          >
            <Receipt className="ml-2 w-4 h-4" />
            <span className="font-medium">المنتجات والخدمات</span>
          </Button>
          <Button variant="outline" className="h-12 rounded-lg border border-gray-200 hover:bg-gray-50">
            <MessageCircle className="ml-2 w-4 h-4" />
            <span className="font-medium">تواصل</span>
          </Button>
        </div>

        {/* Transactions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">سجل العمليات</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 hover:text-gray-900"
              onClick={() => navigate(`/wallet/${storeId}/history`)}
            >
              عرض الكل
            </Button>
          </div>

          <div className="space-y-2">
            {transactions.slice(0, 3).map((transaction) => {
              const Icon = transaction.icon;
              const isPositive = transaction.amount > 0;
              
              return (
                <Card 
                  key={transaction.id} 
                  className="p-3 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors cursor-pointer bg-white"
                  onClick={() => navigate(`/wallet/${storeId}/history`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                        isPositive 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                          : 'bg-red-50 text-red-600 border-red-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-black text-sm text-gray-900 leading-tight">{transaction.note}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`font-black text-base leading-none ${
                        isPositive ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {isPositive ? '+' : ''}{transaction.amount} <span className="text-xs text-gray-500">ر.س</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Legal Transparency */}
        <Card className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-600 leading-relaxed">
                <strong className="text-gray-900">معلومة مهمة:</strong> المنصة لا تدير الأموال. الرصيد والاعتمادات تُدار مباشرة من قبل المتجر.
              </p>
              <div className="flex flex-wrap gap-4 pt-1">
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <FileText className="w-3 h-3 ml-1" />
                  كيف يعمل الرصيد؟
                </Button>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <FileText className="w-3 h-3 ml-1" />
                  سياسة الآجل
                </Button>
                <Button variant="link" className="p-0 h-auto text-xs text-gray-600 hover:text-gray-900">
                  <HelpCircle className="w-3 h-3 ml-1" />
                  الأسئلة الشائعة
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
