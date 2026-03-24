// src/pages/ForgotPassword.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { API_URL } from "@/config/api";
import { useLanguage } from "@/contexts/LanguageContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: isRTL ? "خطأ" : "Error",
          description: data.message || (isRTL ? "فشل في إرسال رابط إعادة التعيين" : "Failed to send reset link"),
          variant: "destructive",
        });
        return;
      }

      setEmailSent(true);
      toast({
        title: isRTL ? "تم الإرسال!" : "Email Sent!",
        description: data.message || (isRTL ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني" : "Password reset link has been sent to your email"),
      });

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

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 sm:py-12 px-4 sm:px-6">
        <Card className="w-full max-w-md border-2 border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {isRTL ? "تحقق من بريدك الإلكتروني" : "Check Your Email"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              {isRTL 
                ? `لقد أرسلنا رابط إعادة تعيين كلمة المرور إلى ${email}`
                : `We've sent a password reset link to ${email}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 text-sm text-gray-700">
              <p className="font-semibold mb-2 text-xs sm:text-sm">{isRTL ? "الخطوات التالية:" : "Next steps:"}</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>{isRTL ? "افتح صندوق الوارد الخاص بك" : "Open your email inbox"}</li>
                <li>{isRTL ? "ابحث عن بريد إلكتروني من 3qaraty" : "Look for an email from 3qaraty"}</li>
                <li>{isRTL ? "انقر على رابط إعادة التعيين" : "Click the reset link"}</li>
                <li>{isRTL ? "أدخل كلمة مرورك الجديدة" : "Enter your new password"}</li>
              </ol>
            </div>
            <p className="text-xs text-gray-500 text-center">
              {isRTL 
                ? "لم تستلم البريد الإلكتروني؟ تحقق من مجلد الرسائل غير المرغوب فيها أو المهملات."
                : "Didn't receive the email? Check your spam or junk folder."
              }
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 px-4 sm:px-6 pb-6 sm:pb-8">
            <Button
              onClick={() => setEmailSent(false)}
              variant="outline"
              className="w-full border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {isRTL ? "إرسال مرة أخرى" : "Send Again"}
            </Button>
            <Link to="/login" className="w-full">
              <Button
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isRTL ? "العودة إلى تسجيل الدخول" : "Back to Login"}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 sm:py-12 px-4 sm:px-6">
      <Card className="w-full max-w-md border-2 border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            {isRTL ? "نسيت كلمة المرور؟" : "Forgot Password?"}
          </CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-600">
            {isRTL 
              ? "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور"
              : "Enter your email and we'll send you a password reset link"
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                {isRTL ? "البريد الإلكتروني" : "Email Address"}
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder={isRTL ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base"
                  required
                />
                <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </div>
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
                  <span>{isRTL ? "جاري الإرسال..." : "Sending..."}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{isRTL ? "إرسال رابط إعادة التعيين" : "Send Reset Link"}</span>
                </div>
              )}
            </Button>
            
            <Link to="/login" className="w-full">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-xl py-2.5 sm:py-3 text-sm sm:text-base"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {isRTL ? "العودة إلى تسجيل الدخول" : "Back to Login"}
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;