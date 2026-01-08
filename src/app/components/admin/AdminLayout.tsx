import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  FileText,
  BarChart3,
  Settings, 
  LogOut,
  Bell,
  Menu,
  Shield,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AdminLayout({ children, title, subtitle }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-red-600" />
        </div>
        <span className="text-xl font-bold text-gray-800">لوحة التحكم</span>
      </div>

      <nav className="space-y-2 flex-1">
        <NavItem 
          icon={<LayoutDashboard />} 
          label="نظرة عامة" 
          active={isActive('/admin/dashboard')} 
          onClick={() => navigate('/admin/dashboard')} 
        />
        <NavItem 
          icon={<Users />} 
          label="المستخدمين" 
          active={isActive('/admin/users')} 
          onClick={() => navigate('/admin/users')} 
        />
        <NavItem 
          icon={<Building2 />} 
          label="المتاجر والأعمال" 
          active={isActive('/admin/businesses')} 
          onClick={() => navigate('/admin/businesses')} 
        />
        <NavItem 
          icon={<Package />} 
          label="إدارة الباقات" 
          active={isActive('/admin/packages')} 
          onClick={() => navigate('/admin/packages')} 
        />
        <NavItem 
          icon={<FileText />} 
          label="طلبات الخدمات" 
          active={isActive('/admin/service-requests')} 
          onClick={() => navigate('/admin/service-requests')} 
        />
        <NavItem 
          icon={<BarChart3 />} 
          label="الإحصائيات" 
          active={isActive('/admin/analytics')} 
          onClick={() => navigate('/admin/analytics')} 
        />
        <NavItem 
          icon={<Settings />} 
          label="الإعدادات" 
          active={isActive('/admin/settings')} 
          onClick={() => navigate('/admin/settings')} 
        />
      </nav>

      <div className="mt-auto">
         <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 gap-3" onClick={() => navigate('/login')}>
           <LogOut className="w-5 h-5" />
           <span>تسجيل الخروج</span>
         </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F9FA]" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-l border-gray-100 hidden lg:flex flex-col p-4 lg:p-6 sticky top-0 h-screen">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-4 sm:p-6">
                <NavContent />
              </SheetContent>
            </Sheet>

            <div className="flex-1 sm:flex-initial">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">{subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="icon" className="rounded-full relative text-gray-500 hover:bg-gray-100 hidden sm:flex">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-r border-gray-200 mr-2">
              <div className="text-left hidden sm:block">
                <p className="text-xs sm:text-sm font-semibold">مدير المنصة</p>
                <p className="text-[10px] sm:text-xs text-gray-400">Admin</p>
              </div>
              <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-sm cursor-pointer">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
      active ? 'text-gray-900 bg-gray-100 font-medium' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
    }`}>
      <div className={`w-5 h-5 ${active ? 'text-gray-900' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
      {active && <div className="mr-auto w-1 h-6 bg-red-600 rounded-full" />}
    </div>
  );
}

