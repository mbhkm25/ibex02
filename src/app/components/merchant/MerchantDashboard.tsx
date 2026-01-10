import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, Users, DollarSign, TrendingUp, QrCode, Receipt, Settings, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DashboardLayout } from '../layout/DashboardLayout';

export function MerchantDashboard() {
  const navigate = useNavigate();
  const { storeId } = useParams();
  const [showQR, setShowQR] = useState(false);

  // TODO: Fetch store data from API
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Fetch store data from API based on storeId
    setLoading(false);
    setStoreData(null);
  }, [storeId]);

  // TODO: Fetch customers from API
  const [customers, setCustomers] = useState<any[]>([]);
  
  useEffect(() => {
    // TODO: Fetch customers from API
    setCustomers([]);
  }, [storeId]);

  // TODO: Fetch transactions from API
  const [transactions, setTransactions] = useState<any[]>([]);
  
  useEffect(() => {
    // TODO: Fetch transactions from API
    setTransactions([]);
  }, [storeId]);

  return (
    <DashboardLayout 
      title={storeData.name} 
      subtitle="لوحة تحكم التاجر"
    >
        {/* Header Actions */}
        <div className="flex justify-end mb-6">
            <Dialog open={showQR} onOpenChange={setShowQR}>
              <DialogTrigger asChild>
                <Button className="rounded-xl gap-2 bg-blue-600 hover:bg-blue-700">
                  <QrCode className="w-5 h-5" />
                  عرض رمز المتجر
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-center">رمز QR الخاص بالمتجر</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 p-4">
                  <div className="w-64 h-64 bg-muted rounded-2xl flex items-center justify-center">
                    <QrCode className="w-32 h-32 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-center text-muted-foreground">
                    اطلب من العملاء مسح هذا الرمز للاشتراك في متجرك
                  </p>
                </div>
              </DialogContent>
            </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            icon={<Users className="w-5 h-5" />}
            title="العملاء"
            value={storeData.customersCount.toString()}
            color="bg-blue-100 text-blue-600"
          />
          <StatsCard
            icon={<DollarSign className="w-5 h-5" />}
            title="إجمالي الأرصدة"
            value={`${storeData.totalBalance} ر.س`}
            color="bg-green-100 text-green-600"
          />
          <StatsCard
            icon={<TrendingUp className="w-5 h-5" />}
            title="إجمالي الآجل"
            value={`${storeData.totalCredit} ر.س`}
            color="bg-orange-100 text-orange-600"
          />
          <StatsCard
            icon={<Receipt className="w-5 h-5" />}
            title="عمليات اليوم"
            value="24"
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-12 rounded-xl bg-white border border-gray-100 p-1 mb-6">
            <TabsTrigger value="customers" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">العملاء</TabsTrigger>
            <TabsTrigger value="transactions" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">العمليات</TabsTrigger>
            <TabsTrigger value="cashiers" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">الكاشير</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-3">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">قائمة العملاء</h3>
              <div className="space-y-2">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                    onClick={() => navigate(`/merchant/${storeId}/customer/${customer.id}`)}
                  >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-800">{customer.name}</p>
                            <p className="text-sm text-gray-400">{customer.status}</p>
                        </div>
                    </div>
                    <div className={`font-bold ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {customer.balance >= 0 ? '+' : ''}{customer.balance} ر.س
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-3">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100/50">
                <h3 className="font-semibold text-lg text-gray-800 mb-4">سجل العمليات</h3>
                <div className="space-y-2">
                    {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                <ShoppingCart className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">{transaction.customer}</p>
                                <p className="text-sm text-gray-400">{transaction.date}</p>
                            </div>
                        </div>
                        <div className={`font-bold ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.amount >= 0 ? '+' : ''}{transaction.amount} ر.س
                        </div>
                    </div>
                    ))}
                </div>
            </div>
          </TabsContent>

          <TabsContent value="cashiers">
             <Card className="p-8 border-0 shadow-sm rounded-3xl bg-white text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Receipt className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-lg text-gray-800 mb-2">نقطة البيع</h3>
              <p className="text-gray-400 mb-6">يمكنك فتح واجهة الكاشير لتسجيل المبيعات</p>
              <Button onClick={() => navigate(`/cashier/${storeId}`)} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700">
                فتح تطبيق الكاشير
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 border-0 shadow-sm rounded-3xl bg-white">
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start h-14 rounded-xl border-gray-200 hover:bg-gray-50 hover:text-blue-600" size="lg">
                  <Settings className="ml-2 w-5 h-5" />
                  إعدادات المتجر
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
    </DashboardLayout>
  );
}

function StatsCard({ icon, title, value, color }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="p-4 border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-400">{title}</p>
      <p className="text-xl font-bold text-gray-800 mt-1">{value}</p>
    </Card>
  );
}
