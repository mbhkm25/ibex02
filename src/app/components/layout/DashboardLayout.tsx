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
  Building2,
  Download
} from 'lucide-react';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  // Capture PWA install event
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setCanInstall(false);
      setDeferredPrompt(null);
    }
  };

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
        <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white">
          <Wallet className="w-5 h-5" />
        </div>
        <span className="text-xl font-black text-gray-900">محفظتي</span>
      </div>

      <nav className="space-y-1 flex-1">
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
          active={isActive('/scan/qr') || isActive('/scan')} 
          onClick={() => navigate('/scan/qr')} 
        />
        <NavItem 
          icon={<Settings />} 
          label="الإعدادات" 
          active={isActive('/settings')} 
          onClick={() => {}} 
        />
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-100">
         <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 gap-3 font-medium h-12" onClick={() => logout()}>
           <LogOut className="w-5 h-5" />
           <span>تسجيل الخروج</span>
         </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="w-72 bg-white border-l border-gray-100 hidden lg:flex flex-col p-6 sticky top-0 h-screen shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-[1600px] mx-auto w-full">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Mobile Menu Trigger */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl bg-white border border-gray-200">
                      <Menu className="w-5 h-5 text-gray-700" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 p-6">
                    <NavContent />
                  </SheetContent>
                </Sheet>

                <div className="flex-1 sm:flex-initial">
                  <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
                  <p className="text-sm text-gray-500 font-medium mt-1">{subtitle}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {canInstall && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleInstallClick}
                    className="h-10 rounded-xl border-2 border-gray-200 text-xs font-bold gap-2 hidden sm:inline-flex"
                  >
                    <Download className="w-4 h-4" />
                    تثبيت التطبيق
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hidden sm:flex relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 left-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </Button>
                
                <div className="flex items-center gap-3 pr-2 sm:border-r border-gray-200 sm:mr-2">
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-bold text-gray-900">{user?.name || 'مستخدم'}</p>
                    <p className="text-xs text-gray-500 font-medium truncate max-w-[120px]">{user?.email}</p>
                  </div>
                  <Avatar className="w-10 h-10 border-2 border-white shadow-sm cursor-pointer bg-gray-100">
                    <AvatarImage src={user?.picture} />
                    <AvatarFallback className="font-bold text-gray-700">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </AvatarFallback>
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
      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-200 group ${
      active ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
    }`}>
      <div className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-900 transition-colors'}`}>
        {icon}
      </div>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}
