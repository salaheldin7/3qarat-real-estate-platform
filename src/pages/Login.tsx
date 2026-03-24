import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Lock, LogIn } from "lucide-react";
import { login } from "@/utils/auth";
import { API_URL } from "@/config/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { GuestOnlyGuard } from '@/components/GuestOnlyGuard';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const Login = () => {
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const getIdentifierType = (identifier) => {
    if (identifier.includes('@')) return 'email';
    if (/^\+?\d+$/.test(identifier.replace(/\s/g, ''))) return 'phone';
    return 'username';
  };

  const getPlaceholderText = () => {
    return isRTL ? "اسم المستخدم، البريد الإلكتروني، أو رقم الهاتف" : "Username, email, or phone number";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const identifierType = getIdentifierType(loginIdentifier);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ 
          [identifierType]: loginIdentifier,
          password 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Login failed",
          description: data.message || "Invalid credentials",
          variant: "destructive",
        });
        return;
      }

      // Store auth token and user data using session-based auth
      login(data.token, data.user);

      toast({
        title: "Welcome back!",
        description: `Signed in successfully as ${data.user.name}`,
      });

      // Redirect based on role hierarchy: founder > admin > seller
      // Use window.location.href for hard refresh to update navigation state
      if (data.user.is_founder || data.user.is_admin) {
        window.location.href = "/admin";
      } else if (data.user.is_seller) {
        window.location.href = "/seller";
      } else {
        window.location.href = "/profile";
      }
    } catch (error) {
      toast({
        title: isRTL ? "خطأ في الاتصال" : "Connection Error",
        description: isRTL ? "فشل الاتصال بالخادم. يرجى المحاولة مرة أخرى." : "Failed to connect to server. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestOnlyGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 sm:py-12 px-4 sm:px-6">
        <Card className="w-full max-w-md border-2 border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {isRTL ? "مرحباً بعودتك" : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              {isRTL ? "سجل دخولك إلى حسابك في عقاراتي" : "Sign in to your 3qaraty account"}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="loginIdentifier" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "اسم المستخدم، البريد الإلكتروني، أو الهاتف" : "Username, Email, or Phone"}
                </Label>
                <div className="relative">
                  <Input
                    id="loginIdentifier"
                    type="text"
                    placeholder={getPlaceholderText()}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {loginIdentifier && (
                    <span>
                      {isRTL ? "تم الكشف: " : "Detected: "}<span className="font-medium capitalize">{getIdentifierType(loginIdentifier)}</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">{isRTL ? "كلمة المرور" : "Password"}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? "أدخل كلمة المرور" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <Label htmlFor="remember" className="text-xs sm:text-sm text-gray-600">
                    {isRTL ? "تذكرني" : "Remember me"}
                  </Label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-300"
                >
                  {isRTL ? "نسيت كلمة المرور؟" : "Forgot password?"}
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-6 sm:pb-8">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isRTL ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{isRTL ? "تسجيل الدخول" : "Sign In"}</span>
                  </div>
                )}
              </Button>
              
              <div className="text-center space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  {isRTL ? "ليس لديك حساب؟ " : "Don't have an account? "}
                  <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-300">
                    {isRTL ? "سجل هنا" : "Create one here"}
                  </Link>
                </p>
                
                <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs text-gray-500">
                  <span>✓ {isRTL ? "تسجيل الدخول باسم المستخدم" : "Username login"}</span>
                  <span>✓ {isRTL ? "تسجيل الدخول بالبريد الإلكتروني" : "Email login"}</span>
                  <span>✓ {isRTL ? "تسجيل الدخول بالهاتف" : "Phone login"}</span>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </GuestOnlyGuard>
  );
};

export default Login;