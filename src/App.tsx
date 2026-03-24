import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { ChatPanel } from "./components/ChatPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import AdminPropertyApproval from "./pages/AdminPropertyApproval";
import Index from "./pages/Index";
import About from "./pages/About";
import Marketplace from "./pages/Marketplace";
import PropertyDetail from "./pages/PropertyDetail";
import SellerPanel from "./pages/SellerPanel";
import MyAds from "./pages/MyAds";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import { useEffect, useState, Component, ReactNode } from "react"; // ✅ Added useState here
import UserProfile from '@/pages/UserProfile';
import { useBanCheck } from '@/hooks/useBanCheck';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Error Boundary Component
class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              An error occurred while loading the application.
            </p>
            <pre className="text-left bg-gray-100 p-4 rounded mb-4 text-xs overflow-auto">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simplified Route Guard Component (no useState needed)
const RouteGuard = ({ children }: { children: ReactNode }) => {
  // No state needed - just render children
  return <>{children}</>;
};

const AppContent = () => {
  const { language, isRTL } = useLanguage();

  useEffect(() => {
    try {
      // Update document direction and language
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
      
      // Add RTL class to body for additional styling
      if (isRTL) {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    } catch (error) {
      console.error('Language setup error:', error);
    }
  }, [language, isRTL]);

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/property/:id" element={<PropertyDetail />} />
            <Route path="/profile/:username" element={<UserProfile />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            {/* Protected Routes - require authentication */}
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Admin & Founder Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/properties" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminPropertyApproval />
                </ProtectedRoute>
              } 
            />
            
            {/* Seller Routes - accessible by sellers, admins, and founders */}
            <Route 
              path="/seller" 
              element={
                <ProtectedRoute requireSeller>
                  <SellerPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/seller-panel" 
              element={
                <ProtectedRoute requireSeller>
                  <SellerPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/my-ads" 
              element={
                <ProtectedRoute requireSeller>
                  <MyAds />
                </ProtectedRoute>
              } 
            />
            
            {/* Chat Routes - require authentication */}
            <Route 
              path="/chats" 
              element={
                <ProtectedRoute>
                  <ChatPanel />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/chats/:userId" 
              element={
                <ProtectedRoute>
                  <ChatPanel />
                </ProtectedRoute>
              } 
            />
            
            <Route path="*" element={<NotFound />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <TooltipProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;