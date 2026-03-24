import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { ChatNotification } from "@/components/ChatNotification";
import { 
  Menu, 
  User, 
  LogOut, 
  Shield, 
  Home, 
  Building, 
  Plus, 
  List, 
  Globe, 
  Building2,
  ChevronDown,
  X,
  Info,
  Mail,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  initializeSession, 
  isAuthenticated, 
  getUser, 
  logout as authLogout,
  setupAuthSync,
  refreshSession,
  getAuthToken
} from "@/utils/auth";
import { API_URL } from "@/config/api";

const Navigation = () => {
  const { t } = useTranslation();
  const { language, isRTL, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [isFounder, setIsFounder] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Optimized auth check with session management
  const checkAuth = useCallback(() => {
    try {
      initializeSession();
      
      if (isAuthenticated()) {
        const userData = getUser();
        if (userData) {
          setUser(userData);
          setIsFounder(userData.is_founder || false);
          setIsAdmin(userData.is_admin || userData.is_founder || false);
          setIsSeller(userData.role === 'seller' || userData.is_seller || false);
          setAuthLoaded(true);
          return;
        }
      }
      
      setUser(null);
      setIsAdmin(false);
      setIsSeller(false);
      setIsFounder(false);
    } catch (error) {
      console.error('Auth check error:', error);
      authLogout(false);
      setUser(null);
      setIsAdmin(false);
      setIsSeller(false);
      setIsFounder(false);
    } finally {
      setAuthLoaded(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const cleanupAuthSync = setupAuthSync(
      () => checkAuth(),
      () => {
        setUser(null);
        setIsAdmin(false);
        setIsSeller(false);
        setIsFounder(false);
        navigate('/');
      }
    );

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element)?.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshSession();
        checkAuth();
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      cleanupAuthSync();
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [checkAuth, navigate]);

  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    }

    authLogout(true);
    setUser(null);
    setIsAdmin(false);
    setIsSeller(false);
    setShowUserMenu(false);
    navigate('/');
    
    toast({
      title: t('nav.logout'),
      description: "You have been logged out successfully.",
    });
  };

  const navItems = [
    { name: t('nav.home'), path: "/", icon: Home },
    { name: t('nav.marketplace'), path: "/marketplace", icon: Building },
    { name: t('nav.about'), path: "/about", icon: Info },
    { name: t('nav.contact'), path: "/contact", icon: Mail },
  ];

  const sellerItems = [
    { name: t('nav.sellerPanel'), path: "/seller-panel", icon: List },
    { name: t('nav.myAds'), path: "/my-ads", icon: List },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-lg shadow-md' 
            : 'bg-white/90 backdrop-blur-md shadow-sm'
        }`} 
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between h-16 gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            
            {/* Logo */}
            <Link 
              to="/" 
              className={`flex items-center gap-2 group ${isRTL ? 'flex-row-reverse' : ''} flex-shrink-0`}
            >
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {isRTL ? 'عقاراتي' : '3qaraty'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-1 justify-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group relative text-sm font-medium px-4 py-2 rounded-lg transition-all ${
                    location.pathname === item.path 
                      ? 'text-white bg-gradient-to-r from-emerald-500 to-teal-600 shadow-md' 
                      : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50'
                  } ${isRTL ? 'flex-row-reverse' : ''} flex items-center gap-2`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Desktop Right Actions */}
            <div className={`hidden lg:flex items-center gap-3 flex-shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
              
              {authLoaded && user && (isSeller || isAdmin) && (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse border-r border-gray-200 pr-3 mr-3' : 'border-l border-gray-200 pl-3 ml-3'}`}>
                  {sellerItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                        location.pathname === item.path 
                          ? 'text-emerald-700 bg-emerald-50' 
                          : 'text-gray-600 hover:text-emerald-600 hover:bg-gray-50'
                      } flex items-center gap-2`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="h-9 px-3 text-sm font-medium rounded-lg hover:bg-gray-100"
              >
                <Globe className="w-4 h-4 mr-2" />
                {language === 'en' ? 'العربية' : 'English'}
              </Button>

              {authLoaded && user && <ChatNotification />}

              {authLoaded ? (
                user ? (
                  <div className="relative user-menu-container">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowUserMenu(!showUserMenu);
                      }}
                      className={`h-10 px-3 rounded-lg hover:bg-gray-100 ${isRTL ? 'flex-row-reverse' : ''} flex items-center gap-2`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <span className="text-sm font-medium text-gray-700 max-w-24 truncate">{user.name}</span>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                    </Button>

                    {showUserMenu && (
                      <div className={`absolute top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50 ${isRTL ? 'right-0' : 'left-0'}`}>
                        <Link
                          to="/profile"
                          onClick={() => setShowUserMenu(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <User className="w-4 h-4" />
                          <span>{t('nav.profile')}</span>
                        </Link>
                        
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin"
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              <Shield className="w-4 h-4" />
                              <span>{t('nav.admin')}</span>
                            </Link>
                            <Link
                              to="/admin/properties"
                              onClick={() => setShowUserMenu(false)}
                              className={`flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                            >
                              <Home className="w-4 h-4" />
                              <span>{isRTL ? "إدارة العقارات" : "Properties"}</span>
                            </Link>
                          </>
                        )}
                        
                        <div className="border-t border-gray-100 my-2"></div>
                        
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Link to="/login">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-9 px-4 text-sm font-medium rounded-lg hover:bg-gray-100"
                      >
                        {t('nav.login')}
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button 
                        size="sm" 
                        className="h-9 px-4 text-sm font-medium rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md"
                      >
                        {t('nav.register')}
                      </Button>
                    </Link>
                  </div>
                )
              ) : (
                <div className="w-32 h-9 bg-gray-200 animate-pulse rounded-lg"></div>
              )}
            </div>

            {/* Mobile Actions */}
            <div className={`flex lg:hidden items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {/* Mobile Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100"
              >
                <Globe className="w-5 h-5 text-gray-600" />
              </Button>

              {/* Mobile Chat */}
              {authLoaded && user && (
                <div className="flex items-center">
                  <ChatNotification />
                </div>
              )}

              {/* Mobile Menu Button */}
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0 rounded-lg hover:bg-gray-100"
                  >
                    <Menu className="w-5 h-5 text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
  side={isRTL ? "left" : "right"} 
  className="w-full max-w-sm bg-gradient-to-b from-white to-gray-50 p-0 border-0 overflow-hidden flex flex-col [&>button]:hidden" 
  dir={isRTL ? 'rtl' : 'ltr'}
  style={{ maxHeight: '80vh', height: '80vh' }}
>
  {/* Accessibility elements - hidden but required */}
  <div className="sr-only">
    <h2>{isRTL ? 'القائمة الرئيسية' : 'Main Menu'}</h2>
    <p>{isRTL ? 'قائمة التنقل الرئيسية للموقع' : 'Main navigation menu'}</p>
  </div>

  {/* Header with Close Button */}
  <div className={`relative flex items-center justify-between px-6 py-5 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 shadow-xl ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="relative">
                        <div className="w-11 h-11 bg-white/30 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <span className="font-bold text-white text-xl block leading-tight">
                          {isRTL ? 'عقاراتي' : '3qaraty'}
                        </span>
                        <span className="text-emerald-50 text-xs font-medium">
                          {isRTL ? 'القائمة الرئيسية' : 'Main Menu'}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-10 w-10 p-0 rounded-xl hover:bg-white/20 transition-all duration-200 active:scale-95"
                    >
                      <X className="w-5 h-5 text-white" />
                    </Button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
                    
                    {/* User Info */}
                    {authLoaded && user && (
                      <div className={`relative bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-4 border-2 border-emerald-100 shadow-sm ${isRTL ? 'text-right' : ''}`}>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0 shadow-lg">
                              {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                              <span className="text-xs">
                                {isFounder ? '👑' : isAdmin ? '⚡' : isSeller ? '🏪' : '👤'}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-base text-gray-800 truncate">{user.name || 'User'}</p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                            <span className="text-xs text-emerald-700 font-semibold px-2 py-0.5 bg-emerald-100 rounded-lg inline-block mt-1">
                              {isFounder ? 'Founder' : isAdmin ? 'Admin' : isSeller ? 'Seller' : 'User'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Main Navigation */}
                    <div className="space-y-1.5">
                      <h3 className={`text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-3 ${isRTL ? 'text-right' : ''}`}>
                        {isRTL ? 'التنقل' : 'Navigation'}
                      </h3>
                      {navItems.map((item, index) => (
                        <Link
                          key={item.name}
                          to={item.path}
                          className={`group flex items-center gap-3 text-sm font-semibold py-3 px-3.5 rounded-xl transition-all duration-200 ${
                            location.pathname === item.path 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200' 
                              : 'text-gray-700 hover:bg-white hover:shadow-md active:scale-[0.98]'
                          } ${isRTL ? 'flex-row-reverse' : ''}`}
                          onClick={() => setIsOpen(false)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            location.pathname === item.path ? 'bg-white/25 scale-110' : 'bg-gradient-to-br from-emerald-50 to-teal-50 group-hover:scale-110'
                          }`}>
                            <item.icon className={`w-4.5 h-4.5 ${location.pathname === item.path ? 'text-white' : 'text-emerald-600'}`} />
                          </div>
                          <span className="flex-1">{item.name}</span>
                          {location.pathname === item.path && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                          )}
                        </Link>
                      ))}
                    </div>

                    {/* Seller Section */}
                    {authLoaded && user && (isSeller || isAdmin) && (
                      <div className="space-y-1.5 pt-3">
                        <h3 className={`text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2 px-3 ${isRTL ? 'text-right' : ''}`}>
                          {isRTL ? '🏪 البائع' : '🏪 Seller'}
                        </h3>
                        {sellerItems.map((item, index) => (
                          <Link
                            key={item.name}
                            to={item.path}
                            className={`group flex items-center gap-3 text-sm font-semibold py-3 px-3.5 rounded-xl transition-all duration-200 ${
                              location.pathname === item.path 
                                ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200 shadow-sm' 
                                : 'text-gray-700 hover:bg-white hover:shadow-md active:scale-[0.98]'
                            } ${isRTL ? 'flex-row-reverse' : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                              location.pathname === item.path ? 'bg-emerald-100 scale-110' : 'bg-gray-100 group-hover:scale-110'
                            }`}>
                              <item.icon className="w-4.5 h-4.5 text-emerald-600" />
                            </div>
                            <span className="flex-1">{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Admin Section */}
                    {authLoaded && user && isAdmin && (
                      <div className="space-y-1.5 pt-3">
                        <h3 className={`text-[11px] font-bold text-purple-600 uppercase tracking-wider mb-2 px-3 ${isRTL ? 'text-right' : ''}`}>
                          {isRTL ? '⚡ الإدارة' : '⚡ Admin'}
                        </h3>
                        <Link
                          to="/admin"
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center gap-3 text-sm font-semibold py-3 px-3.5 rounded-xl transition-all duration-200 ${
                            location.pathname === '/admin' 
                              ? 'bg-purple-50 text-purple-700 border-2 border-purple-200 shadow-sm' 
                              : 'text-gray-700 hover:bg-white hover:shadow-md active:scale-[0.98]'
                          } ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            location.pathname === '/admin' ? 'bg-purple-100 scale-110' : 'bg-gray-100 group-hover:scale-110'
                          }`}>
                            <Shield className="w-4.5 h-4.5 text-purple-600" />
                          </div>
                          <span className="flex-1">{t('nav.admin')}</span>
                        </Link>
                        <Link
                          to="/admin/properties"
                          onClick={() => setIsOpen(false)}
                          className={`group flex items-center gap-3 text-sm font-semibold py-3 px-3.5 rounded-xl transition-all duration-200 ${
                            location.pathname === '/admin/properties' 
                              ? 'bg-purple-50 text-purple-700 border-2 border-purple-200 shadow-sm' 
                              : 'text-gray-700 hover:bg-white hover:shadow-md active:scale-[0.98]'
                          } ${isRTL ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                            location.pathname === '/admin/properties' ? 'bg-purple-100 scale-110' : 'bg-gray-100 group-hover:scale-110'
                          }`}>
                            <Home className="w-4.5 h-4.5 text-purple-600" />
                          </div>
                          <span className="flex-1">{isRTL ? "إدارة العقارات" : "Properties"}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Bottom Actions */}
                  <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-2.5 shadow-lg">
                    {authLoaded ? (
                      user ? (
                        <>
                          <Link to="/profile" onClick={() => setIsOpen(false)}>
                            <Button 
                              variant="outline" 
                              className="w-full h-11 text-sm font-semibold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98] shadow-sm"
                            >
                              <User className="w-4.5 h-4.5 mr-2" />
                              {t('nav.profile')}
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            className="w-full h-11 text-sm font-semibold rounded-xl border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all active:scale-[0.98] shadow-sm"
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                          >
                            <LogOut className="w-4.5 h-4.5 mr-2" />
                            {t('nav.logout')}
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-2.5">
                          <Link to="/login" onClick={() => setIsOpen(false)} className="block">
                            <Button 
                              variant="outline" 
                              className="w-full h-11 text-sm font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all active:scale-[0.98] shadow-sm"
                            >
                              {t('nav.login')}
                            </Button>
                          </Link>
                          <Link to="/register" onClick={() => setIsOpen(false)} className="block">
                            <Button 
                              className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                            >
                              {t('nav.register')}
                            </Button>
                          </Link>
                        </div>
                      )
                    ) : (
                      <div className="space-y-2.5">
                        <div className="w-full h-11 bg-gray-200 animate-pulse rounded-xl"></div>
                        <div className="w-full h-11 bg-gray-200 animate-pulse rounded-xl"></div>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Spacer */}
      <div className="h-16"></div>
    </>
  );
};

export default Navigation;