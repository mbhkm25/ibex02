import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, DollarSign, TrendingUp, Receipt } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';

export function CustomerProfile() {
  const navigate = useNavigate();
  const { storeId, customerId } = useParams();
  const [showAddBalance, setShowAddBalance] = useState(false);
  const [showCreditLimit, setShowCreditLimit] = useState(false);
  const [amount, setAmount] = useState('');
  const [creditLimit, setCreditLimit] = useState('');

  // Mock data
  const customer = {
    name: 'محمد أحمد',
    phone: '+966 501234567',
    balance: 250,
    status: 'نقدي',
    creditLimit: 0,
  };

  const transactions = [
    { id: '1', type: 'purchase', amount: -45, date: 'اليوم، 2:30 م', note: 'شراء مواد غذائية' },
    { id: '2', type: 'topup', amount: +300, date: 'أمس، 11:15 ص', note: 'إضافة رصيد' },
    { id: '3', type: 'purchase', amount: -50, date: '2 يناير، 4:20 م', note: 'شراء' },
  ];

  const handleAddBalance = () => {
    if (!amount) return;
    toast.success(`تم إضافة ${amount} ر.س للرصيد`);
    setShowAddBalance(false);
    setAmount('');
  };

  const handleSetCreditLimit = () => {
    if (!creditLimit) return;
    toast.success(`تم تحديد سقف الآجل إلى ${creditLimit} ر.س`);
    setShowCreditLimit(false);
    setCreditLimit('');
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate(-1)}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl">{customer.name}</h1>
            <p className="text-sm text-muted-foreground mt-1" dir="ltr">{customer.phone}</p>
          </div>
        </div>
      </div>

      {/* Balance Card */}
      <div className="p-6">
        <Card className="p-6 border-border/50 bg-gradient-to-br from-primary/5 to-primary/10">
          <p className="text-sm text-muted-foreground mb-2">الرصيد الحالي</p>
          <p className={`text-4xl font-medium mb-4 ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {customer.balance >= 0 ? '+' : ''}{customer.balance} ر.س
          </p>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 rounded-full bg-background/50">
              {customer.status}
            </span>
            {customer.creditLimit > 0 && (
              <span className="px-3 py-1 rounded-full bg-background/50">
                سقف الآجل: {customer.creditLimit} ر.س
              </span>
            )}
          </div>
        </Card>
      </div>

      {/* Actions */}
      <div className="px-6 grid grid-cols-2 gap-4 mb-6">
        <Dialog open={showAddBalance} onOpenChange={setShowAddBalance}>
          <DialogTrigger asChild>
            <Button className="h-12 rounded-xl">
              <DollarSign className="ml-2 w-5 h-5" />
              إضافة رصيد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>إضافة رصيد</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">المبلغ (ر.س)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-2 h-12 rounded-xl bg-input-background"
                  placeholder="0"
                  dir="ltr"
                />
              </div>
              <Button onClick={handleAddBalance} className="w-full h-12 rounded-xl">
                تأكيد
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showCreditLimit} onOpenChange={setShowCreditLimit}>
          <DialogTrigger asChild>
            <Button variant="outline" className="h-12 rounded-xl">
              <TrendingUp className="ml-2 w-5 h-5" />
              اعتماد آجل
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تحديد سقف الآجل</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="creditLimit">سقف الآجل (ر.س)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  className="mt-2 h-12 rounded-xl bg-input-background"
                  placeholder="0"
                  dir="ltr"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                سيتمكن العميل من الشراء بالآجل حتى يصل رصيده إلى -{creditLimit || 0} ر.س
              </p>
              <Button onClick={handleSetCreditLimit} className="w-full h-12 rounded-xl">
                تأكيد
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transaction History */}
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
                    <Receipt className="w-5 h-5" />
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
