import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, DollarSign, TrendingUp, ShoppingCart, Bell } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

type NotificationType = 'debit' | 'credit' | 'topup' | 'request';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  store: string;
  amount?: number;
  time: string;
  read: boolean;
}

export function NotificationsScreen() {
  const navigate = useNavigate();

  // TODO: Fetch notifications from API
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // TODO: Fetch notifications from API
    setLoading(false);
    setNotifications([]);
  }, []);

  // Empty notifications - no mock data
  const emptyNotifications: Notification[] = [
    {
      id: '1',
      type: 'debit',
      title: 'عملية شراء',
      message: 'تم خصم مبلغ من رصيدك',
      store: 'سوبر ماركت الرحمة',
      amount: -45,
      time: 'منذ 5 دقائق',
      read: false,
    },
    {
      id: '2',
      type: 'credit',
      title: 'إضافة رصيد',
      message: 'تم إضافة رصيد إلى حسابك',
      store: 'مطعم البيك',
      amount: 200,
      time: 'منذ ساعة',
      read: false,
    },
    {
      id: '3',
      type: 'debit',
      title: 'عملية آجلة',
      message: 'تم الشراء بالآجل',
      store: 'صيدلية النهدي',
      amount: -120,
      time: 'منذ 3 ساعات',
      read: true,
    },
    {
      id: '4',
      type: 'request',
      title: 'طلب آجل جديد',
      message: 'طلب جديد للشراء بالآجل من عميل',
      store: 'سوبر ماركت الرحمة',
      time: 'أمس',
      read: true,
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <div className="flex-1">
            <h1 className="text-2xl">الإشعارات</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} إشعار جديد
              </p>
            )}
          </div>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm">
              تحديد الكل كمقروء
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-6 space-y-3">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <NotificationCard key={notification.id} notification={notification} />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا توجد إشعارات</p>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationCard({ notification }: { notification: Notification }) {
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'debit':
        return <ShoppingCart className="w-5 h-5" />;
      case 'credit':
        return <DollarSign className="w-5 h-5" />;
      case 'topup':
        return <DollarSign className="w-5 h-5" />;
      case 'request':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getColor = (type: NotificationType) => {
    switch (type) {
      case 'debit':
        return 'bg-red-100 text-red-600';
      case 'credit':
      case 'topup':
        return 'bg-green-100 text-green-600';
      case 'request':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-blue-100 text-blue-600';
    }
  };

  return (
    <Card className={`p-4 border-border/50 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${getColor(notification.type)}`}>
          {getIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className="font-medium">{notification.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {notification.message}
              </p>
            </div>
            {notification.amount && (
              <div className={`font-medium shrink-0 ${notification.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {notification.amount >= 0 ? '+' : ''}{notification.amount} ر.س
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs rounded-full">
              {notification.store}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {notification.time}
            </span>
          </div>
        </div>

        {/* Unread Indicator */}
        {!notification.read && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0"></div>
        )}
      </div>
    </Card>
  );
}
