import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, User, Mail, Phone, Lock, Send, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { API_URL } from "@/config/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { GuestOnlyGuard } from '@/components/GuestOnlyGuard';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });
  
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isRTL } = useLanguage();

  // Generate random username
  const generateRandomUsername = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let username = 'user';
    for (let i = 0; i < 8; i++) {
      username += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return username;
  };

  // Validate username format (only English letters and numbers, case-sensitive)
  const validateUsername = (username) => {
    // Only allow lowercase letters, uppercase letters, and numbers
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    return usernameRegex.test(username);
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    // Validate format first
    if (!validateUsername(username)) {
      setUsernameAvailable(false);
      toast({
        title: isRTL ? "اسم مستخدم غير صالح" : "Invalid Username",
        description: isRTL ? "يجب أن يحتوي اسم المستخدم على أحرف إنجليزية وأرقام فقط" : "Username must contain only English letters and numbers",
        variant: "destructive",
      });
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`${API_URL}/check-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch (error) {
      console.error('Username check failed:', error);
    } finally {
      setCheckingUsername(false);
    }
  };

  // Auto-generate username on component mount
  useEffect(() => {
    const randomUsername = generateRandomUsername();
    setFormData(prev => ({
      ...prev,
      username: randomUsername
    }));
    checkUsernameAvailability(randomUsername);
  }, []);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleInputChange = (field, value) => {
    // For username, only allow English letters and numbers
    if (field === 'username') {
      // Remove any non-English characters and special characters
      value = value.replace(/[^a-zA-Z0-9]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Check username availability when manually edited
    if (field === 'username' && value.length >= 3) {
      setTimeout(() => checkUsernameAvailability(value), 500);
    }

    // Reset email verification if email changes
    if (field === 'email' && codeSent) {
      setCodeSent(false);
      setEmailVerified(false);
      setVerificationCode('');
    }
  };

  const sendVerificationCode = async () => {
    if (!formData.email.trim()) {
      toast({
        title: isRTL ? "البريد الإلكتروني مطلوب" : "Email Required",
        description: isRTL ? "يرجى إدخال عنوان بريدك الإلكتروني" : "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: isRTL ? "الاسم مطلوب" : "Name Required",
        description: isRTL ? "يرجى إدخال اسمك أولاً" : "Please enter your name first",
        variant: "destructive",
      });
      return;
    }

    setSendingCode(true);

    try {
      const response = await fetch(`${API_URL}/auth/send-verification-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send verification code');
      }

      if (data.success) {
        setCodeSent(true);
        setResendTimer(60);
        toast({
          title: isRTL ? "تم الإرسال!" : "Code Sent!",
          description: isRTL ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني" : "Verification code sent to your email",
        });
      }
    } catch (error) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: error.message || (isRTL ? "فشل إرسال رمز التحقق" : "Failed to send verification code"),
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast({
        title: isRTL ? "رمز غير صالح" : "Invalid Code",
        description: isRTL ? "يرجى إدخال رمز مكون من 6 أرقام" : "Please enter a valid 6-digit code",
        variant: "destructive",
      });
      return;
    }

    setVerifyingCode(true);

    try {
      const response = await fetch(`${API_URL}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          code: verificationCode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid verification code');
      }

      if (data.success) {
        setEmailVerified(true);
        toast({
          title: isRTL ? "تم التحقق! ✓" : "Verified! ✓",
          description: isRTL ? "تم التحقق من بريدك الإلكتروني بنجاح" : "Email verified successfully",
        });
      }
    } catch (error) {
      toast({
        title: isRTL ? "خطأ في التحقق" : "Verification Error",
        description: error.message || (isRTL ? "رمز التحقق غير صالح" : "Invalid verification code"),
        variant: "destructive",
      });
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validations
    if (!formData.name.trim()) {
      toast({
        title: isRTL ? "الاسم مطلوب" : "Name Required",
        description: isRTL ? "يرجى إدخال اسمك الكامل" : "Please enter your full name",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!emailVerified) {
      toast({
        title: isRTL ? "تحقق من البريد الإلكتروني" : "Email Verification Required",
        description: isRTL ? "يرجى التحقق من بريدك الإلكتروني أولاً" : "Please verify your email first",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: isRTL ? "رقم الهاتف مطلوب" : "Phone Required",
        description: isRTL ? "يرجى إدخال رقم هاتفك" : "Please enter your phone number",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: isRTL ? "كلمات المرور غير متطابقة" : "Password Mismatch",
        description: isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: isRTL ? "كلمة مرور قصيرة" : "Password Too Short",
        description: isRTL ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل" : "Password must be at least 8 characters",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (usernameAvailable === false) {
      toast({
        title: isRTL ? "اسم المستخدم غير متاح" : "Username Unavailable",
        description: isRTL ? "اسم المستخدم مستخدم. يرجى اختيار آخر." : "Username is taken. Please choose another.",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const registrationData = {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
        verification_code: verificationCode
      };

      const response = await fetch(`${API_URL}/auth/register-with-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(', ');
          toast({
            title: isRTL ? "فشل التسجيل" : "Registration Failed",
            description: errorMessages,
            variant: "destructive",
          });
        } else {
          toast({
            title: isRTL ? "فشل التسجيل" : "Registration Failed",
            description: data.message || (isRTL ? "فشل التسجيل" : "Registration failed"),
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }

      toast({
        title: isRTL ? "تم إنشاء الحساب بنجاح! 🎉" : "Account Created Successfully! 🎉",
        description: isRTL ? "مرحباً بك في عقاراتي" : "Welcome to 3qaraty",
      });

      // Store auth token and user data
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect to profile page
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (error) {
      toast({
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل الاتصال بالخادم" : "Failed to connect to server",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <GuestOnlyGuard>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-6 sm:py-12 px-4 sm:px-6">
        <Card className="w-full max-w-lg border-2 border-gray-200 shadow-2xl bg-white/95 backdrop-blur-sm">
          <CardHeader className="space-y-1 text-center px-4 sm:px-6 pt-6 sm:pt-8">
            <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              {isRTL ? "انضم إلى عقاراتي" : "Join 3qaraty"}
            </CardTitle>
            <CardDescription className="text-sm sm:text-base text-gray-600">
              {isRTL ? "أنشئ حسابك للبدء في شراء أو بيع العقارات" : "Create your account to start buying or selling properties"}
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4 sm:space-y-5 px-4 sm:px-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "الاسم الكامل *" : "Full Name *"}
                </Label>
                <div className="relative">
                  <Input
                    id="name"
                    type="text"
                    placeholder={isRTL ? "أدخل اسمك الكامل" : "Enter your full name"}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "اسم المستخدم * (إنجليزي فقط)" : "Username * (English only)"}
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder={isRTL ? "أحرف إنجليزية وأرقام فقط" : "English letters and numbers only"}
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`border-2 ${
                      usernameAvailable === true ? 'border-green-500' : 
                      usernameAvailable === false ? 'border-red-500' : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base`}
                    required
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {checkingUsername ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : usernameAvailable === true ? (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                    ) : usernameAvailable === false ? (
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                {usernameAvailable === true && (
                  <p className="text-xs sm:text-sm text-green-600">
                    ✓ {isRTL ? "اسم المستخدم متاح" : "Username is available"}
                  </p>
                )}
                {usernameAvailable === false && (
                  <p className="text-xs sm:text-sm text-red-600">
                    ⚠️ {isRTL ? "اسم المستخدم مستخدم" : "Username is taken"}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "البريد الإلكتروني *" : "Email Address *"}
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder={isRTL ? "بريدك@الإلكتروني.com" : "your@email.com"}
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`border-2 ${
                      emailVerified ? 'border-green-500' : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base`}
                    required
                  />
                  {emailVerified ? (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  ) : (
                    <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  )}
                </div>
                
                {/* Send Code Button */}
                {!codeSent && !emailVerified && (
                  <Button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={sendingCode || !formData.email || !formData.name}
                    variant="outline"
                    className="w-full mt-2 flex items-center justify-center gap-2 border-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Send className="w-4 h-4" />
                    {sendingCode ? (isRTL ? "جاري الإرسال..." : "Sending...") : (isRTL ? "إرسال رمز التحقق" : "Send Verification Code")}
                  </Button>
                )}
              </div>

              {/* Verification Code Field */}
              {codeSent && !emailVerified && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
                  <Label className="text-xs sm:text-sm font-semibold text-gray-700">
                    {isRTL ? "رمز التحقق *" : "Verification Code *"}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="flex-1 text-center text-xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                    <Button
                      type="button"
                      onClick={verifyCode}
                      disabled={verifyingCode || verificationCode.length !== 6}
                      className="px-6"
                    >
                      {verifyingCode ? "..." : (isRTL ? "تحقق" : "Verify")}
                    </Button>
                  </div>
                  
                  <Button
                    type="button"
                    onClick={sendVerificationCode}
                    disabled={sendingCode || resendTimer > 0}
                    variant="ghost"
                    className="w-full text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {resendTimer > 0 
                      ? `${isRTL ? "إعادة الإرسال في" : "Resend in"} ${resendTimer}s`
                      : (isRTL ? "إعادة إرسال الرمز" : "Resend Code")
                    }
                  </Button>
                </div>
              )}

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "رقم الهاتف *" : "Phone Number *"}
                </Label>
                <div className="relative">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={isRTL ? "+20 100 123 4567" : "+20 100 123 4567"}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base"
                    required
                  />
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "كلمة المرور *" : "Password *"}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={isRTL ? "8 أحرف على الأقل" : "At least 8 characters"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base"
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-semibold text-gray-700">
                  {isRTL ? "تأكيد كلمة المرور *" : "Confirm Password *"}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={isRTL ? "أكد كلمة المرور" : "Confirm your password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`border-2 ${
                      formData.confirmPassword && formData.password === formData.confirmPassword 
                        ? 'border-green-500' 
                        : formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-200'
                    } focus:border-blue-500 focus:ring-blue-500/20 rounded-xl py-2.5 sm:py-3 pl-4 pr-12 transition-all duration-300 text-sm sm:text-base`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs sm:text-sm text-red-600">
                    {isRTL ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col space-y-4 px-4 sm:px-6 pb-6">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]" 
                disabled={loading || !emailVerified || usernameAvailable === false || checkingUsername}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{isRTL ? "جاري إنشاء الحساب..." : "Creating account..."}</span>
                  </div>
                ) : (
                  isRTL ? "إنشاء حساب" : "Create Account"
                )}
              </Button>
              
              <p className="text-sm text-center text-gray-600">
                {isRTL ? "لديك حساب بالفعل؟ " : "Already have an account? "}
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-300">
                  {isRTL ? "سجل دخول هنا" : "Sign in here"}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </GuestOnlyGuard>
  );
};

export default Register;