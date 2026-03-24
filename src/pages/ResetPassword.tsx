import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react";
import { API_URL } from "@/config/api";

interface FormData {
  token: string;
  password: string;
  password_confirmation: string;
  showPassword: boolean;
  showPasswordConfirm: boolean;
}

const ResetPassword = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    token: searchParams.get("token") || "",
    password: "",
    password_confirmation: "",
    showPassword: false,
    showPasswordConfirm: false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.token.trim()) {
      newErrors.token = "Reset code is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one number";
    }

    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Please confirm your password";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/reset-password-with-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: formData.token,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setSuccess(true);
      toast({
        title: "Success",
        description: "Your password has been reset successfully",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to reset password";
      setErrors({ general: errorMessage });
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardContent className="p-8 text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isRTL ? 'تم إعادة تعيين كلمة المرور' : 'Password Reset Successfully'}
            </h1>
            <p className="text-gray-600 mb-6">
              {isRTL ? 'سيتم إعادة توجيهك إلى صفحة تسجيل الدخول' : 'You will be redirected to login page...'}
            </p>
            <Loader2 className="w-6 h-6 animate-spin text-blue-500 mx-auto" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">
            {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Reset Code */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                {isRTL ? 'كود إعادة التعيين' : 'Reset Code'}
              </Label>
              <Input
                type="text"
                value={formData.token}
                onChange={(e) => setFormData({ ...formData, token: e.target.value.toUpperCase() })}
                placeholder={isRTL ? 'أدخل الكود المرسل إليك' : 'Enter the code sent to you'}
                className={`mt-2 border-2 focus:border-blue-500 rounded-lg text-center font-mono font-bold text-lg tracking-widest ${
                  errors.token ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.token && <p className="text-red-600 text-sm mt-1">{errors.token}</p>}
            </div>

            {/* Password */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                {isRTL ? 'كلمة المرور الجديدة' : 'New Password'}
              </Label>
              <div className="relative mt-2">
                <Input
                  type={formData.showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                  className={`pr-10 border-2 focus:border-blue-500 rounded-lg ${
                    errors.password ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showPassword: !formData.showPassword })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {formData.showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              <p className="text-xs text-gray-500 mt-2">
                {isRTL 
                  ? 'يجب أن تحتوي على 8 أحرف على الأقل، وحرف كبير، وحرف صغير، ورقم' 
                  : 'Must be at least 8 characters with uppercase, lowercase, and number'}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <Label className="text-sm font-semibold text-gray-700">
                {isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
              </Label>
              <div className="relative mt-2">
                <Input
                  type={formData.showPasswordConfirm ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                  placeholder={isRTL ? 'أعد إدخال كلمة المرور' : 'Re-enter password'}
                  className={`pr-10 border-2 focus:border-blue-500 rounded-lg ${
                    errors.password_confirmation ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showPasswordConfirm: !formData.showPasswordConfirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {formData.showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password_confirmation && (
                <p className="text-red-600 text-sm mt-1">{errors.password_confirmation}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري إعادة التعيين...' : 'Resetting...'}
                </>
              ) : (
                isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset Password'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-4">
            {isRTL ? (
              <>
                تذكرت كلمة مرورك؟ <a href="/login" className="text-blue-600 hover:underline font-semibold">تسجيل الدخول</a>
              </>
            ) : (
              <>
                Remember your password? <a href="/login" className="text-blue-600 hover:underline font-semibold">Login</a>
              </>
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
