import { 
  LayoutDashboard, 
  Store, 
  Search, 
  Wallet,
  Settings, 
  QrCode,
  LogOut,
  Bell,
  Menu,
  Building2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/scan') {
      return location.pathname.startsWith('/scan');
    }
    if (path === '/business') {
      return location.pathname.startsWith('/business');
    }
    return location.pathname === path;
  };

  const NavContent = () => (
    <>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
          <Wallet className="w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-gray-800">محفظتي</span>
      </div>

      <nav className="space-y-2 flex-1">
        <NavItem 
          icon={<LayoutDashboard />} 
          label="نظرة عامة" 
          active={isActive('/dashboard')} 
          onClick={() => navigate('/dashboard')} 
        />
        <NavItem 
          icon={<Building2 />} 
          label="أعمالي" 
          active={isActive('/business')} 
          onClick={() => navigate('/business')} 
        />
        <NavItem 
          icon={<Store />} 
          label="إنشاء متجر" 
          active={isActive('/create-store')} 
          onClick={() => navigate('/create-store')} 
        />
        <NavItem 
          icon={<Search />} 
          label="استعراض الأعمال" 
          active={isActive('/explore')} 
          onClick={() => navigate('/explore')} 
        />
        <NavItem 
          icon={<Wallet />} 
          label="اشتراكاتي" 
          active={isActive('/subscriptions')} 
          onClick={() => navigate('/subscriptions')} 
        />
        <NavItem 
          icon={<QrCode />} 
          label="مسح QR" 
          active={isActive('/scan')} 
          onClick={() => navigate('/scan/store')} 
        />
        <NavItem 
          icon={<Settings />} 
          label="الإعدادات" 
          active={isActive('/settings')} 
          onClick={() => {}} 
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
                    <p className="text-xs sm:text-sm font-semibold">أحمد محمد</p>
                    <p className="text-[10px] sm:text-xs text-gray-400">عميل مميز</p>
                  </div>
                  <Avatar className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white shadow-sm cursor-pointer">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>AM</AvatarFallback>
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
      {active && <div className="mr-auto w-1 h-6 bg-primary rounded-full" />}
    </div>
  );
}
