import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Receipt, MessageCircle, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

export function CustomerWallet() {
  const navigate = useNavigate();
  const { storeId } = useParams();

  // Mock data
  const wallet = {
    storeName: 'سوبر ماركت الرحمة',
    balance: 250,
    creditStatus: 'نقدي',
    creditLimit: 0,
  };

  const transactions = [
    { id: '1', type: 'purchase', amount: -45, date: 'اليوم، 2:30 م', note: 'شراء مواد غذائية' },
    { id: '2', type: 'topup', amount: +300, date: 'أمس، 11:15 ص', note: 'إضافة رصيد' },
    { id: '3', type: 'purchase', amount: -50, date: '2 يناير، 4:20 م', note: 'شراء' },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl">{wallet.storeName}</h1>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-6">
        <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <p className="text-sm text-muted-foreground mb-2">رصيدك الحالي</p>
          <p className={`text-5xl font-medium mb-4 ${wallet.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {wallet.balance >= 0 ? '+' : ''}{wallet.balance}
            <span className="text-2xl mr-2">ر.س</span>
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={wallet.balance >= 0 ? 'default' : 'destructive'} className="rounded-full">
              {wallet.creditStatus}
            </Badge>
            {wallet.creditLimit > 0 && (
              <Badge variant="outline" className="rounded-full">
                سقف الآجل: {wallet.creditLimit} ر.س
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-6">
        <Button variant="outline" className="h-12 rounded-xl">
          <Receipt className="ml-2 w-5 h-5" />
          الطلبات
        </Button>
        <Button variant="outline" className="h-12 rounded-xl">
          <MessageCircle className="ml-2 w-5 h-5" />
          تواصل
        </Button>
      </div>

      {/* Request Credit */}
      {wallet.creditLimit === 0 && wallet.balance >= 0 && (
        <div className="px-6 mb-6">
          <Card className="p-4 border-border/50 bg-orange-50 border-orange-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">هل تحتاج للشراء بالآجل؟</p>
                <p className="text-xs text-muted-foreground mt-1">
                  يمكنك طلب اعتماد الشراء بالآجل من المتجر
                </p>
              </div>
              <Button size="sm" variant="outline" className="shrink-0">
                طلب آجل
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Transactions */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg">سجل العمليات</h2>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-4 border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    transaction.amount >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {transaction.amount >= 0 ? <DollarSign className="w-5 h-5" /> : <Receipt className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.note}</p>
                    <p className="text-sm text-muted-foreground mt-1">{transaction.date}</p>
                  </div>
                </div>
                <div className={`font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount >= 0 ? '+' : ''}{transaction.amount} ر.س
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
