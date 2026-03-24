import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { API_URL, API_BASE_URL } from '@/config/api';
import {
  Bell,
  Building,
  Calendar,
  Check,
  ChevronRight,
  Edit,
  Eye,
  Home,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Settings,
  Upload,
  User,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
  Star,
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { FavoriteButton } from '@/components/FavoriteButton';

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  is_admin: boolean;
  is_seller: boolean;
  banned: boolean;
  avatar?: string;
  joined_date?: string;
  created_at?: string;
}

interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  category: string;
  status: string;
  created_at: string;
  images: string[];
  views_count: number;
  inquiries_count: number;
  is_featured: boolean;
  rent_or_buy: 'rent' | 'buy';
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
  type: 'info' | 'success' | 'warning' | 'error';
  link?: string;
}

const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState({
    user: true,
    properties: true,
    favorites: true,
    notifications: true
  });
  const [error, setError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Edit profile state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    username: '',
    phone: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Get image URL helper
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return `${API_BASE_URL}${imagePath}`;
    }
    return `${API_BASE_URL}/${imagePath}`;
  };

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return null;
    }
    
    let parsedUser = null;
    if (userData) {
      try {
        parsedUser = JSON.parse(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
      }
    }
    
    return { token, userData: parsedUser };
  }, [navigate]);

  // API helper function
  const makeApiRequest = async (url: string, options: RequestInit = {}) => {
    const authData = checkAuth();
    if (!authData) throw new Error('Not authenticated');

    const defaultHeaders = {
      'Authorization': `Bearer ${authData.token}`,
      'Accept': 'application/json',
    };

    // Only add Content-Type for JSON requests
    if (options.body && typeof options.body === 'string') {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      navigate('/login');
      throw new Error('Authentication expired');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  };

  // Load user profile
  const loadProfile = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, user: true }));
      setError(null);
      
      // Set user from localStorage first
      if (authData.userData) {
        setUser(authData.userData);
      }

      // Try to fetch fresh data from API
      try {
        const data = await makeApiRequest(`${API_URL}/profile`);
        
        // Handle different response structures
        const profileData = data.user || data.data || data;
        
        if (profileData && profileData.id) {
          setUser(profileData);
          localStorage.setItem('user', JSON.stringify(profileData));
        } else if (!authData.userData) {
          throw new Error('No profile data received');
        }
      } catch (apiError) {
        console.warn('API request failed:', apiError);
        
        // If no localStorage data either, show error
        if (!authData.userData) {
          setError('Failed to load profile data. Please try logging in again.');
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error);
      if (!user) {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(prev => ({ ...prev, user: false }));
    }
  }, [checkAuth, navigate]);

  // Load properties
  const loadProperties = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, properties: true }));
      
      const data = await makeApiRequest(`${API_URL}/my-properties`);
      
      let propertiesData = [];
      
      if (data.properties && Array.isArray(data.properties)) {
        propertiesData = data.properties;
      } else if (data.data && Array.isArray(data.data)) {
        propertiesData = data.data;
      } else if (Array.isArray(data)) {
        propertiesData = data;
      }
      
      setProperties(propertiesData);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(prev => ({ ...prev, properties: false }));
    }
  }, [checkAuth, navigate]);

  // Load favorites
  const loadFavorites = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, favorites: true }));
      
      const data = await makeApiRequest(`${API_URL}/favorites`);
      
      let favoritesData = [];
      
      if (data.data && Array.isArray(data.data.data)) {
        favoritesData = data.data.data;
      } else if (data.data && Array.isArray(data.data)) {
        favoritesData = data.data;
      } else if (Array.isArray(data)) {
        favoritesData = data;
      }
      
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(prev => ({ ...prev, favorites: false }));
    }
  }, [checkAuth, navigate]);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    const authData = checkAuth();
    if (!authData) return;

    try {
      setLoading(prev => ({ ...prev, notifications: true }));
      
      const data = await makeApiRequest(`${API_URL}/notifications`);
      
      let notificationsData = [];
      
      if (data.notifications && Array.isArray(data.notifications)) {
        notificationsData = data.notifications;
      } else if (data.data && Array.isArray(data.data)) {
        notificationsData = data.data;
      } else if (Array.isArray(data)) {
        notificationsData = data;
      }
      
      setNotifications(notificationsData);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  }, [checkAuth, navigate]);

  // Initialize data
  useEffect(() => {
    const authData = checkAuth();
    if (authData) {
      loadProfile();
      loadProperties();
      loadFavorites();
      loadNotifications();
    }
  }, []);

  // Initialize edit form when user data loads
  useEffect(() => {
    if (user && !isEditMode) {
      setEditForm({
        name: user.name || '',
        username: user.username || '',
        phone: user.phone || ''
      });
    }
  }, [user, isEditMode]);

  // Memoized calculations
  const totalViews = useMemo(() => 
    Array.isArray(properties) 
      ? properties.reduce((sum, prop) => sum + (Number(prop.views_count) || 0), 0)
      : 0, 
    [properties]
  );
  
  const totalInquiries = useMemo(() => 
    Array.isArray(properties) 
      ? properties.reduce((sum, prop) => sum + (Number(prop.inquiries_count) || 0), 0)
      : 0, 
    [properties]
  );

  const unreadNotifications = useMemo(() => 
    Array.isArray(notifications) 
      ? notifications.filter(n => !n.read).length 
      : 0, 
    [notifications]
  );

  const activeProperties = useMemo(() =>
    Array.isArray(properties) 
      ? properties.filter(p => p.status === 'active').length
      : 0,
    [properties]
  );

  // Handle avatar upload click
  const handleAvatarUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle file change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: isRTL ? 'حجم الملف كبير جداً (الحد الأقصى 5 ميجا)' : 'File size too large (max 5MB)',
          variant: 'destructive',
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: isRTL ? 'خطأ' : 'Error',
          description: isRTL ? 'يجب أن يكون الملف صورة' : 'File must be an image',
          variant: 'destructive',
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      setAvatarFile(file);
      uploadAvatar(file);
    }
  };

  // Upload avatar - FIXED VERSION
 const uploadAvatar = async (file: File) => {
  const authData = checkAuth();
  if (!authData) return;

  setUploadingAvatar(true);
  const formData = new FormData();
  formData.append('avatar', file);

  try {
    const response = await fetch(`${API_URL}/profile/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authData.token}`,
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    const data = await response.json();
    
    toast({
      title: isRTL ? 'تم التحديث' : 'Updated',
      description: isRTL ? 'تم تحديث صورة الملف الشخصي بنجاح' : 'Profile picture updated successfully',
    });
    
    // Try all possible response structures
    let avatarUrl = data.data?.avatar || data.avatar || data.avatar_url || data.user?.avatar;
    
    if (avatarUrl) {
      setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null);
      
      // CRITICAL: Update localStorage
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const userData = JSON.parse(currentUser);
        localStorage.setItem('user', JSON.stringify({ ...userData, avatar: avatarUrl }));
      }
      
      setAvatarPreview(null);
    } else {
      // Reload profile if no URL found
      setAvatarPreview(null);
      await new Promise(resolve => setTimeout(resolve, 500));
      await loadProfile();
    }
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    toast({
      title: isRTL ? 'خطأ' : 'Error',
      description: error.message || (isRTL ? 'فشل في تحديث صورة الملف الشخصي' : 'Failed to update profile picture'),
      variant: 'destructive',
    });
    setAvatarPreview(null);
  } finally {
    setUploadingAvatar(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }
};

  // Handle edit mode toggle
  const handleEditClick = () => {
    if (user) {
      setEditForm({
        name: user.name,
        username: user.username,
        phone: user.phone || ''
      });
      setIsEditMode(true);
      setUsernameAvailable(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    if (user) {
      setEditForm({
        name: user.name,
        username: user.username,
        phone: user.phone || ''
      });
    }
    setUsernameAvailable(null);
  };

  // Check username availability - FIXED VERSION
  const checkUsernameAvailability = async (username: string) => {
    // Clear existing timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // If username is empty or same as current, reset availability
    if (!username || !username.trim() || (user && username === user.username)) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    // Debounce the check
    const timeout = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const response = await fetch(`${API_URL}/check-username`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: username.trim() }),
        });

        const data = await response.json();
        setUsernameAvailable(data.available);
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameAvailable(null);
      } finally {
        setCheckingUsername(false);
      }
    }, 500); // Wait 500ms after user stops typing

    setUsernameCheckTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
    };
  }, [usernameCheckTimeout]);

  // Handle profile update
  const handleSaveProfile = async () => {
    const authData = checkAuth();
    if (!authData || !user) return;

    // Validate username availability
    if (editForm.username !== user.username && usernameAvailable === false) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'اسم المستخدم غير متاح' : 'Username is not available',
        variant: 'destructive',
      });
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name.trim(),
          username: editForm.username.trim(),
          email: user.email,
          phone: editForm.phone.trim(),
        }),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        const updatedUser = data.user || data.data || data;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsEditMode(false);
        
        toast({
          title: isRTL ? 'تم التحديث' : 'Updated',
          description: isRTL ? 'تم تحديث الملف الشخصي بنجاح' : 'Profile updated successfully',
        });
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل في تحديث الملف الشخصي' : 'Failed to update profile'),
        variant: 'destructive',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle password change
  const handleChangePassword = async () => {
    const authData = checkAuth();
    if (!authData) return;

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'كلمات المرور الجديدة غير متطابقة' : 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (passwordForm.new_password.length < 8) {
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: isRTL ? 'يجب أن تكون كلمة المرور 8 أحرف على الأقل' : 'Password must be at least 8 characters',
        variant: 'destructive',
      });
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`${API_URL}/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authData.token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();

      if (data.success || response.ok) {
        setPasswordForm({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        
        toast({
          title: isRTL ? 'تم التحديث' : 'Updated',
          description: isRTL ? 'تم تحديث كلمة المرور بنجاح' : 'Password updated successfully',
        });
      } else {
        throw new Error(data.message || 'Password change failed');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: isRTL ? 'خطأ' : 'Error',
        description: error.message || (isRTL ? 'فشل في تحديث كلمة المرور' : 'Failed to change password'),
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await makeApiRequest(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
      });

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      toast({
        title: isRTL ? 'تم قراءة الإشعارات' : 'Notifications Read',
        description: isRTL ? 'تم تمييز جميع الإشعارات كمقروءة' : 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  // Handle refresh all data
  const handleRefreshAll = () => {
    setError(null);
    loadProfile();
    loadProperties();
    loadFavorites();
    loadNotifications();
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(
        new Date(dateString),
        'PPP',
        { locale: isRTL ? ar : undefined }
      );
    } catch {
      return dateString;
    }
  };

  // Loading state
  if (loading.user && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-20" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </h2>
          <p className="text-gray-600">
            {isRTL ? 'جاري تحميل بيانات الملف الشخصي' : 'Loading profile data'}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              {isRTL ? 'خطأ في التحميل' : 'Loading Error'}
            </h2>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={handleRefreshAll}>
                <RefreshCw className="w-4 h-4 mr-2" />
                {isRTL ? 'المحاولة مرة أخرى' : 'Try Again'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/login')}>
                {isRTL ? 'تسجيل الدخول مرة أخرى' : 'Login Again'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
            <User className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-800 mb-2">
              {isRTL ? 'لا توجد بيانات' : 'No Profile Data'}
            </h2>
            <p className="text-amber-700 mb-4">
              {isRTL ? 'لم نتمكن من العثور على بيانات الملف الشخصي' : 'Could not find profile data'}
            </p>
            <Button onClick={() => navigate('/login')}>
              {isRTL ? 'تسجيل الدخول' : 'Login'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || getImageUrl(user?.avatar);

  return (
    <div className="min-h-screen bg-gray-50 pt-20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between mb-8`}>
          <div className={isRTL ? 'text-right' : 'text-left'}>
            <h1 className="text-3xl font-bold text-gray-900">
              {isRTL ? 'الملف الشخصي' : 'Profile'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isRTL ? 'إدارة معلوماتك وعقاراتك' : 'Manage your information and properties'}
            </p>
          </div>
          
          <Button variant="outline" onClick={handleRefreshAll}>
            <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-1/3 space-y-6">
            {/* Profile Card */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader className="relative pb-0">
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-md">
                      <AvatarImage src={displayAvatar} />
                      <AvatarFallback className="text-2xl font-bold bg-emerald-100 text-emerald-700">
                        {user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarUploadClick}
                      disabled={uploadingAvatar}
                      className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:cursor-not-allowed"
                      aria-label="Change profile picture"
                      title={isRTL ? 'تغيير الصورة' : 'Change picture'}
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="text-white w-6 h-6 animate-spin" />
                      ) : (
                        <Upload className="text-white w-6 h-6" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </div>
                  
                  <CardTitle className="mt-4 text-xl text-center">{user?.name}</CardTitle>
                  <CardDescription className="text-sm text-center">
                    {user?.username ? `@${user.username}` : user?.email}
                  </CardDescription>

                  <div className="flex gap-2 mt-2 flex-wrap justify-center">
                    {user?.is_admin && (
                      <Badge className="bg-purple-500 hover:bg-purple-600">
                        {isRTL ? 'مدير' : 'Admin'}
                      </Badge>
                    )}
                    {user?.is_seller && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        {isRTL ? 'بائع' : 'Seller'}
                      </Badge>
                    )}
                    {user?.banned && (
                      <Badge variant="destructive">
                        {isRTL ? 'محظور' : 'Banned'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6 pb-4">
                <div className="space-y-4">
                  {/* Contact Info */}
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 text-sm text-gray-600`}>
                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="flex-1 break-all">{user?.email}</span>
                  </div>

                  {user?.phone && (
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 text-sm text-gray-600`}>
                      <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="flex-1">{user?.phone}</span>
                    </div>
                  )}

                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 text-sm text-gray-600`}>
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="flex-1">
                      {isRTL ? 'انضم في' : 'Joined'} {' '}
                      {user?.joined_date || user?.created_at ? 
                        formatDate(user.joined_date || user.created_at || '') : 
                        '-'
                      }
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 gap-2 pt-4">
                    <Button 
                      variant="outline" 
                      className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 justify-center text-red-600 hover:text-red-700 hover:border-red-300`}
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      {isRTL ? 'تسجيل الخروج' : 'Logout'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Card */}
            <Card className="shadow-sm border border-gray-200 bg-gradient-to-br from-emerald-50 to-cyan-50">
              <CardHeader>
                <CardTitle className={`text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'إحصائياتك' : 'Your Stats'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 justify-between`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Building className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-sm text-gray-600">{isRTL ? 'العقارات' : 'Properties'}</span>
                    </div>
                    <span className="font-semibold text-gray-800">
                      {Array.isArray(properties) ? properties.length : 0}
                    </span>
                  </div>

                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 justify-between`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">{isRTL ? 'نشط' : 'Active'}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{activeProperties}</span>
                  </div>

                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 justify-between`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-sm text-gray-600">{isRTL ? 'إجمالي المشاهدات' : 'Total Views'}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{totalViews.toLocaleString()}</span>
                  </div>

                  <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2 justify-between`}>
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm text-gray-600">{isRTL ? 'الاستفسارات' : 'Inquiries'}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{totalInquiries.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className={`text-base ${isRTL ? 'text-right' : 'text-left'}`}>
                  {isRTL ? 'روابط سريعة' : 'Quick Links'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-between rounded-none py-3 px-4 h-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                    onClick={() => navigate('/seller-panel')}
                  >
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                      <Home className="w-4 h-4" />
                      <span>{isRTL ? 'إضافة عقار جديد' : 'Add New Property'}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className={`w-full justify-between rounded-none py-3 px-4 h-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                    onClick={() => navigate('/my-ads')}
                  >
                    <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                      <Building className="w-4 h-4" />
                      <span>{isRTL ? 'عقاراتي' : 'My Properties'}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  {user?.is_admin && (
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-between rounded-none py-3 px-4 h-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                      onClick={() => navigate('/admin')}
                    >
                      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                        <User className="w-4 h-4" />
                        <span>{isRTL ? 'لوحة التحكم' : 'Admin Dashboard'}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-2/3 space-y-6">
            <Tabs defaultValue="favorites" className="w-full">
              <TabsList className={`mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <TabsTrigger value="favorites">
                  {isRTL ? 'المفضلة' : 'Favorites'}
                  {favorites.length > 0 && (
                    <Badge className={`${isRTL ? 'mr-2' : 'ml-2'} bg-pink-500 text-white text-xs`}>
                      {favorites.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="edit">
                  {isRTL ? 'تعديل الملف' : 'Edit Profile'}
                </TabsTrigger>
                <TabsTrigger value="settings">
                  {isRTL ? 'الإعدادات' : 'Settings'}
                </TabsTrigger>
              </TabsList>

              {/* Edit Profile Tab */}
              <TabsContent value="edit">
                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'تعديل الملف الشخصي' : 'Edit Profile'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'قم بتحديث معلومات ملفك الشخصي' : 'Update your profile information'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{isRTL ? 'الاسم' : 'Name'}</Label>
                      <Input
                        id="name"
                        value={editForm.name}
                        onChange={(e) => {
                          setEditForm(prev => ({ ...prev, name: e.target.value }));
                        }}
                        disabled={savingProfile}
                        placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">{isRTL ? 'اسم المستخدم' : 'Username'}</Label>
                      <div className="relative">
                        <Input
                          id="username"
                          value={editForm.username}
                          onChange={(e) => {
                            const newUsername = e.target.value;
                            setEditForm(prev => ({ ...prev, username: newUsername }));
                            checkUsernameAvailability(newUsername);
                          }}
                          disabled={savingProfile}
                          placeholder={isRTL ? 'أدخل اسم المستخدم' : 'Enter your username'}
                          className={
                            editForm.username !== user?.username
                              ? usernameAvailable === true
                                ? 'border-green-500'
                                : usernameAvailable === false
                                ? 'border-red-500'
                                : ''
                              : ''
                          }
                        />
                        {checkingUsername && (
                          <Loader2 className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 w-4 h-4 animate-spin text-gray-400`} />
                        )}
                        {editForm.username !== user?.username && !checkingUsername && usernameAvailable !== null && (
                          <div className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-3 w-4 h-4 ${
                            usernameAvailable === true ? 'text-green-500' : 'text-red-500'
                          }`}>
                            {usernameAvailable === true && <Check />}
                            {usernameAvailable === false && <X />}
                          </div>
                        )}
                      </div>
                      {editForm.username !== user?.username && usernameAvailable === false && (
                        <p className="text-sm text-red-500">{isRTL ? 'اسم المستخدم غير متاح' : 'Username is not available'}</p>
                      )}
                      {editForm.username !== user?.username && usernameAvailable === true && (
                        <p className="text-sm text-green-500">{isRTL ? 'اسم المستخدم متاح' : 'Username is available'}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">{isRTL ? 'رقم الهاتف' : 'Phone'}</Label>
                      <Input
                        id="phone"
                        value={editForm.phone}
                        onChange={(e) => {
                          setEditForm(prev => ({ ...prev, phone: e.target.value }));
                        }}
                        disabled={savingProfile}
                        placeholder={isRTL ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500">{isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}</p>
                    </div>

                    <div className={`flex gap-2 pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Button 
                        onClick={handleSaveProfile} 
                        disabled={savingProfile || (editForm.username !== user?.username && usernameAvailable !== true)}
                        className="flex-1"
                      >
                        {savingProfile ? (
                          <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                        ) : (
                          <Save className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        )}
                        {isRTL ? 'حفظ' : 'Save'}
                      </Button>
                      <Button 
                        onClick={handleCancelEdit} 
                        disabled={savingProfile}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {isRTL ? 'إلغاء' : 'Cancel'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>{isRTL ? 'إعدادات الأمان' : 'Security Settings'}</CardTitle>
                    <CardDescription>
                      {isRTL ? 'قم بتغيير كلمة المرور الخاصة بك' : 'Change your password'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                      <Input
                        id="current_password"
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                        disabled={changingPassword}
                        placeholder={isRTL ? 'أدخل كلمة المرور الحالية' : 'Enter current password'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                      <Input
                        id="new_password"
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        disabled={changingPassword}
                        placeholder={isRTL ? 'أدخل كلمة المرور الجديدة' : 'Enter new password'}
                      />
                      <p className="text-sm text-gray-500">{isRTL ? 'يجب أن تكون 8 أحرف على الأقل' : 'Must be at least 8 characters'}</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password_confirmation">{isRTL ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
                      <Input
                        id="new_password_confirmation"
                        type="password"
                        value={passwordForm.new_password_confirmation}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                        disabled={changingPassword}
                        placeholder={isRTL ? 'أعد إدخال كلمة المرور الجديدة' : 'Re-enter new password'}
                      />
                    </div>

                    <Button 
                      onClick={handleChangePassword} 
                      disabled={changingPassword || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.new_password_confirmation}
                      className="w-full"
                    >
                      {changingPassword ? (
                        <Loader2 className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'} animate-spin`} />
                      ) : (
                        <Lock className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      )}
                      {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="favorites" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {isRTL ? 'العقارات المفضلة' : 'Favorite Properties'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading.favorites ? (
                      <div className="p-8 text-center animate-in fade-in duration-300">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
                        <p>{isRTL ? 'جاري تحميل المفضلة...' : 'Loading favorites...'}</p>
                      </div>
                    ) : favorites.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {favorites.map((property, index) => (
                          <div
                            key={property.id}
                            className="border rounded-lg overflow-hidden hover:shadow-lg transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 relative group"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <div className="relative h-48 cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                              <img
                                src={property.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                                alt={property.title}
                                className="w-full h-full object-cover"
                              />
                              <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-emerald-600 text-white px-3 py-1 rounded-full text-sm font-semibold`}>
                                {property.price ? `${property.price.toLocaleString()} ${isRTL ? 'جنيه' : 'EGP'}` : 'N/A'}
                              </div>
                              <div className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'}`} onClick={(e) => e.stopPropagation()}>
                                <FavoriteButton
                                  propertyId={property.id}
                                  initialIsFavorited={true}
                                  className="bg-white/90 hover:bg-white shadow-lg"
                                />
                              </div>
                            </div>
                            <div className="p-4 cursor-pointer" onClick={() => navigate(`/property/${property.id}`)}>
                              <h3 className={`font-semibold text-lg mb-2 line-clamp-1 ${isRTL ? 'text-right' : 'text-left'}`}>{property.title}</h3>
                              <p className={`text-gray-600 text-sm mb-2 line-clamp-2 ${isRTL ? 'text-right' : 'text-left'}`}>{property.description}</p>
                              <div className={`flex items-center text-gray-500 text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                                <MapPin className={`w-4 h-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                <span className="line-clamp-1">{property.location}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 animate-in fade-in zoom-in-95 duration-500">
                        <Star className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-in fade-in zoom-in-50 duration-700" />
                        <h3 className="text-lg font-semibold text-gray-800 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                          {isRTL ? 'لا توجد عقارات مفضلة' : 'No Favorite Properties'}
                        </h3>
                        <p className="text-gray-500 mt-1 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                          {isRTL ? 'ابدأ بإضافة عقارات إلى المفضلة من السوق' : 'Start adding properties to your favorites from the marketplace'}
                        </p>
                        <Button 
                          onClick={() => navigate('/marketplace')}
                          className="animate-in fade-in zoom-in-95 duration-500 delay-500"
                        >
                          <Home className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'تصفح العقارات' : 'Browse Properties'}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;