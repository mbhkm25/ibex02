import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUp,
  ArrowDown,
  Wallet,
  ShoppingBag
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface Transaction {
  id: string;
  type: 'purchase' | 'topup' | 'payment' | 'refund';
  amount: number;
  date: string;
  time: string;
  description: string;
  orderId?: string;
}

export function CustomerTransactionHistory() {
  const navigate = useNavigate();
  const { businessId, customerId } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'purchase' | 'topup' | 'payment' | 'refund'>('all');

  // Mock data
  const customer = {
    id: customerId || '1',
    name: 'أحمد محمد',
    phone: '+966501234567',
    balance: 250
  };

  const transactions: Transaction[] = [
    { id: '1', type: 'purchase', amount: -45, date: '15 يناير 2024', time: '2:30 م', description: 'شراء مواد غذائية', orderId: '#1234' },
    { id: '2', type: 'topup', amount: +300, date: '14 يناير 2024', time: '11:15 ص', description: 'إضافة رصيد' },
    { id: '3', type: 'purchase', amount: -50, date: '13 يناير 2024', time: '4:20 م', description: 'شراء', orderId: '#1233' },
    { id: '4', type: 'payment', amount: -25, date: '12 يناير 2024', time: '3:45 م', description: 'دفع فاتورة' },
    { id: '5', type: 'refund', amount: +30, date: '11 يناير 2024', time: '1:20 م', description: 'استرجاع مبلغ', orderId: '#1232' },
  ];

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.includes(searchQuery) || t.orderId?.includes(searchQuery);
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingBag className="w-4 h-4" />;
      case 'topup':
        return <ArrowUp className="w-4 h-4" />;
      case 'payment':
        return <Wallet className="w-4 h-4" />;
      case 'refund':
        return <ArrowDown className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-emerald-600 bg-emerald-50';
    if (type === 'purchase') return 'text-red-600 bg-red-50';
    if (type === 'payment') return 'text-orange-600 bg-orange-50';
    return 'text-gray-600 bg-gray-50';
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
            <h1 className="text-lg font-black text-gray-900 truncate">سجل العمليات</h1>
            <p className="text-xs text-gray-500">{customer.name}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="pb-4">
        <div className="p-4 space-y-3">
          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="ابحث في السجل..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-11 rounded-xl border-2 border-gray-200 text-sm focus:border-blue-400"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {(['all', 'purchase', 'topup', 'payment', 'refund'] as const).map((type) => (
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
                  {type === 'all' ? 'الكل' : 
                   type === 'purchase' ? 'مشتريات' :
                   type === 'topup' ? 'إضافة رصيد' :
                   type === 'payment' ? 'مدفوعات' : 'استرجاع'}
                </Button>
              ))}
            </div>
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => {
              const isPositive = transaction.amount > 0;
              const iconColor = getTransactionColor(transaction.type, transaction.amount);
              
              return (
                <Card
                  key={transaction.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-black text-gray-900 mb-0.5">{transaction.description}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{transaction.date}</span>
                            <span>•</span>
                            <span>{transaction.time}</span>
                            {transaction.orderId && (
                              <>
                                <span>•</span>
                                <span>{transaction.orderId}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className={`text-base font-black ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{transaction.amount} ر.س
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="p-4 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 mb-1">إجمالي العمليات</div>
                <div className="text-lg font-black text-gray-900">{filteredTransactions.length}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">الرصيد الحالي</div>
                <div className="text-lg font-black text-emerald-600">{customer.balance} ر.س</div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

