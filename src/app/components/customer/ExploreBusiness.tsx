import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, Coffee, ShoppingBag, Package, MapPin, Star, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DashboardLayout } from '../layout/DashboardLayout';

const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'restaurant', label: 'مطاعم', icon: Coffee },
  { id: 'grocery', label: 'بقالة', icon: ShoppingBag },
  { id: 'pharmacy', label: 'صيدلية', icon: Package },
  { id: 'service', label: 'خدمات', icon: Store },
];

const businesses = [
  {
    id: '1',
    name: 'سوبر ماركت الرحمة',
    category: 'grocery',
    description: 'مواد غذائية طازجة وخضروات يومية',
    address: 'حي النسيم، شارع الملك فهد',
    rating: 4.8,
    offers: 'خصم 10% للعملاء الجدد',
    subscribers: 245,
  },
  {
    id: '2',
    name: 'مطعم البيك',
    category: 'restaurant',
    description: 'وجبات سريعة لذيذة بأسعار مناسبة',
    address: 'حي العزيزية، طريق الملك عبدالله',
    rating: 4.9,
    offers: 'وجبة مجانية عند الاشتراك',
    subscribers: 532,
  },
  {
    id: '3',
    name: 'صيدلية النهدي',
    category: 'pharmacy',
    description: 'أدوية ومستلزمات طبية',
    address: 'حي الروضة، شارع التحلية',
    rating: 4.7,
    offers: null,
    subscribers: 189,
  },
];

export function ExploreBusiness() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBusinesses = businesses.filter(business => {
    const matchesCategory = selectedCategory === 'all' || business.category === selectedCategory;
    const matchesSearch = business.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <DashboardLayout title="استعراض الأعمال" subtitle="اكتشف متاجر وخدمات جديدة حولك">
      <div className="space-y-6">
        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pr-10 rounded-2xl bg-white border-gray-100 focus:bg-white shadow-sm"
                placeholder="ابحث عن متجر..."
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {categories.map((category) => {
                const Icon = category.icon;
                return (
                <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl whitespace-nowrap transition-all border ${
                    selectedCategory === category.id
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'
                    }`}
                >
                    {Icon && <Icon className="w-4 h-4" />}
                    <span className="text-sm font-medium">{category.label}</span>
                </button>
                );
            })}
            </div>
        </div>

        {/* Businesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
            ))}
        </div>

        {filteredBusinesses.length === 0 && (
            <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Store className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب البحث بكلمات مختلفة أو تغيير التصنيف</p>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function BusinessCard({ business }: { business: any }) {
  const navigate = useNavigate();

  return (
    <Card className="p-6 border-0 shadow-sm rounded-3xl bg-white hover:shadow-md transition-all group">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{business.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{business.description}</p>
          </div>
          <div className="flex items-center gap-1 text-sm bg-yellow-50 text-yellow-700 px-2 py-1 rounded-lg">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{business.rating}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-400">
          <MapPin className="w-4 h-4" />
          <span>{business.address}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-lg bg-gray-100 text-gray-600 font-normal">
            {business.subscribers} مشترك
          </Badge>
          {business.offers && (
            <Badge variant="outline" className="rounded-lg border-green-200 bg-green-50 text-green-700 font-normal">
              {business.offers}
            </Badge>
          )}
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-50">
          <Button 
            className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
            onClick={() => navigate(`/wallet/${business.id}`)}
          >
            الدخول
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
          >
            اشتراك
          </Button>
        </div>
      </div>
    </Card>
  );
}
