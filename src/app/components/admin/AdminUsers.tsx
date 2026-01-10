import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  MoreVertical,
  Ban,
  CheckCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AdminLayout } from './AdminLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'merchant' | 'admin';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastActive: string;
  businessesCount?: number;
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // TODO: Fetch users from API
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch users from API
    setLoading(false);
    setUsers([]);
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.phone.includes(searchQuery)
  );

  const getRoleBadge = (role: string) => {
    const roles = {
      customer: { label: 'عميل', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      merchant: { label: 'تاجر', color: 'bg-purple-100 text-purple-700 border-purple-200' },
      admin: { label: 'مدير', color: 'bg-red-100 text-red-700 border-red-200' },
    };
    return roles[role as keyof typeof roles] || roles.customer;
  };

  const getStatusBadge = (status: string) => {
    const statuses = {
      active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
      suspended: { label: 'معلق', color: 'bg-red-100 text-red-700 border-red-200' },
      pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-700 border-amber-200' },
    };
    return statuses[status as keyof typeof statuses] || statuses.active;
  };

  return (
    <AdminLayout 
      title="إدارة المستخدمين" 
      subtitle="عرض وإدارة جميع مستخدمي المنصة"
    >
      <div className="space-y-4">
        {/* Search and Filters */}
        <Card className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم أو رقم الهاتف..."
                className="pr-10 h-11 rounded-xl border-2 border-gray-200 focus:border-red-400"
              />
            </div>
            <Button variant="outline" className="h-11 rounded-xl border-2 border-gray-200">
              <Filter className="w-4 h-4 ml-2" />
              فلترة
            </Button>
          </div>
        </Card>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            const statusBadge = getStatusBadge(user.status);
            
            return (
              <Card key={user.id} className="p-4 bg-white border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 border-2 border-gray-200 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-black">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-gray-900 truncate">{user.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{user.phone}</p>
                        {user.email && <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={`text-[9px] px-2 py-0.5 ${roleBadge.color}`}>
                          {roleBadge.label}
                        </Badge>
                        <Badge className={`text-[9px] px-2 py-0.5 ${statusBadge.color}`}>
                          {statusBadge.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <span>انضم: {user.joinDate}</span>
                      <span>آخر نشاط: {user.lastActive}</span>
                      {user.businessesCount && <span>أعمال: {user.businessesCount}</span>}
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => {
                        setSelectedUser(user);
                        setShowUserDetails(true);
                      }}>
                        <Eye className="w-4 h-4 ml-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 ml-2" />
                        تعديل
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        {user.status === 'active' ? (
                          <>
                            <Ban className="w-4 h-4 ml-2" />
                            تعطيل الحساب
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 ml-2" />
                            تفعيل الحساب
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </Card>
            );
          })}
        </div>

        {/* User Details Dialog */}
        <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle>تفاصيل المستخدم</DialogTitle>
              <DialogDescription>
                {selectedUser?.name}
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">الاسم</div>
                    <div className="text-sm font-bold">{selectedUser.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">رقم الهاتف</div>
                    <div className="text-sm font-bold">{selectedUser.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">الدور</div>
                    <Badge className={getRoleBadge(selectedUser.role).color}>
                      {getRoleBadge(selectedUser.role).label}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">الحالة</div>
                    <Badge className={getStatusBadge(selectedUser.status).color}>
                      {getStatusBadge(selectedUser.status).label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowUserDetails(false)}>
                إغلاق
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

