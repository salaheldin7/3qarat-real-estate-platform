import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { API_URL, API_BASE_URL } from '@/config/api';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  MapPin, 
  Home,
  MessageSquare,
  Loader2,
  AlertCircle,
  Star,
  Camera,
  Bed,
  Bath,
  Square,
  Package,
  Power
} from 'lucide-react';

// Interfaces
interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location_governorate: string;
  location_city: string;
  category: string;
  rent_or_buy: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  images: string[];
  views_count: number;
  inquiries_count: number;
  created_at: string;
  rejection_reason?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  is_featured?: boolean;
  is_active?: boolean;
  totalComments?: number;
  averageRating?: number;
}

interface Stats {
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  rejectedProperties: number;
  soldProperties: number;
  totalViews: number;
  totalInquiries: number;
  featuredProperties: number;
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  canDelete?: boolean;
}

// Property Comments Component (Owner Version)
const PropertyCommentsOwner = ({ 
  propertyId, 
  isOpen, 
  onClose 
}: { 
  propertyId: string | null; 
  isOpen: boolean; 
  onClose: () => void; 
}) => {
  const { isRTL } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && propertyId) {
      document.body.style.overflow = 'hidden';
      fetchComments(propertyId);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, propertyId]);

  const fetchComments = async (propId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/properties/${propId}/comments`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setComments(data.data.comments || []);
        setAverageRating(data.data.averageRating || 0);
        setTotalRatings(data.data.totalComments || 0);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!propertyId) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/properties/${propertyId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setTotalRatings(prev => prev - 1);
        await fetchComments(propertyId);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setDeleteTarget(null);
    }
  };

  const formatTimestamp = useCallback(
    (timestamp: string) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);

      if (days > 0) return isRTL ? `منذ ${days} يوم` : `${days}d ago`;
      if (hours > 0) return isRTL ? `منذ ${hours} ساعة` : `${hours}h ago`;
      return isRTL ? 'الآن' : 'Just now';
    },
    [isRTL]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up sm:max-w-lg sm:mx-auto">
        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b sticky top-0 bg-white z-10 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className={`flex items-center gap-2 sm:gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <MessageSquare className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">
                {isRTL ? 'إدارة التعليقات' : 'Manage Comments'}
              </h3>
              <div className={`flex items-center gap-2 text-xs sm:text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{averageRating.toFixed(1)}</span>
                <span>({totalRatings} {isRTL ? 'تقييم' : 'ratings'})</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <XCircle className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3 sm:space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">{isRTL ? 'جاري التحميل...' : 'Loading comments...'}</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-14 h-14 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">{isRTL ? 'لا توجد تعليقات بعد.' : 'No comments yet.'}</p>
            </div>
          ) : (
            comments.map(comment => (
              <div key={comment.id} className="bg-gray-50 rounded-2xl p-3 sm:p-4 relative">
                <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold overflow-hidden">
                    {comment.userAvatar?.startsWith('http') ? (
                      <img src={comment.userAvatar} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                      <span>{comment.userAvatar || comment.userName[0]}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`flex items-center justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <div className="truncate">
                        <h4 className={`font-semibold text-gray-900 text-sm sm:text-base ${isRTL ? 'text-right' : ''}`}>
                          {comment.userName}
                        </h4>
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${i < comment.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                    </div>

                    <p className={`text-gray-700 text-sm mb-3 break-words ${isRTL ? 'text-right' : ''}`}>
                      {comment.comment}
                    </p>

                    <div className={`flex items-center justify-end ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <button
                        onClick={() => setDeleteTarget(comment.id)}
                        className="px-3 py-1.5 text-xs sm:text-sm text-white bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        {isRTL ? 'حذف التعليق' : 'Delete Comment'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t bg-gray-50 p-4 text-center text-sm text-gray-600">
          {isRTL ? 'بصفتك مالك العقار، يمكنك حذف أي تعليق' : 'As property owner, you can delete any comment'}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6 text-center space-y-4 animate-fade-in">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-gray-900">
              {isRTL ? 'تأكيد الحذف' : 'Confirm Deletion'}
            </h3>
            <p className="text-gray-600 text-sm">
              {isRTL ? 'هل أنت متأكد أنك تريد حذف هذا التعليق؟ لا يمكن التراجع بعد الحذف.' : 'Are you sure you want to delete this comment? This action cannot be undone.'}
            </p>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-full px-6 py-2">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={() => handleDeleteComment(deleteTarget)} className="rounded-full px-6 py-2 bg-red-600 hover:bg-red-700 text-white">
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Main MyAds Component
const MyAds = () => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  };
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState<any>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    totalProperties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    rejectedProperties: 0,
    soldProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    featuredProperties: 0,
  });

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      navigate('/login');
      return null;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      return { token, user: parsedUser };
    } catch (error) {
      console.error('Auth parsing error:', error);
      navigate('/login');
      return null;
    }
  }, [navigate]);

  const loadProperties = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/my-properties`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      let userProperties: Property[] = [];
      if (data.success && data.data) {
        userProperties = Array.isArray(data.data.data) ? data.data.data :
                        Array.isArray(data.data) ? data.data : [];
      } else if (Array.isArray(data)) {
        userProperties = data;
      }
      
      setProperties(userProperties);
      
      const newStats: Stats = {
        totalProperties: userProperties.length,
        approvedProperties: userProperties.filter(p => p.status === 'approved').length,
        pendingProperties: userProperties.filter(p => p.status === 'pending').length,
        rejectedProperties: userProperties.filter(p => p.status === 'rejected').length,
        soldProperties: userProperties.filter(p => p.status === 'sold').length,
        totalViews: userProperties.reduce((sum, p) => sum + (p.views_count || 0), 0),
        totalInquiries: userProperties.reduce((sum, p) => sum + (p.inquiries_count || 0), 0),
        featuredProperties: userProperties.filter(p => p.is_featured).length,
      };
      setStats(newStats);
      
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const loadFavorites = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      setLoadingFavorites(true);
      
      const response = await fetch(`${API_URL}/favorites`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      
      let favoriteProperties: Property[] = [];
      if (data.success && data.data) {
        favoriteProperties = Array.isArray(data.data.data) ? data.data.data :
                           Array.isArray(data.data) ? data.data : [];
      }
      
      setFavorites(favoriteProperties);
      
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoadingFavorites(false);
    }
  }, []);

  useEffect(() => {
    const authData = checkAuth();
    if (authData) {
      loadProperties();
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [checkAuth, loadProperties, loadFavorites]);

  const confirmDelete = (propertyId: string, propertyTitle: string) => {
    setPropertyToDelete({ id: propertyId, title: propertyTitle });
    setShowDeleteDialog(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete) return;

    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      setDeleting(propertyToDelete.id);
      
      const response = await fetch(`${API_URL}/properties/${propertyToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      setProperties(prev => prev.filter(p => p.id !== propertyToDelete.id));
      setStats(prev => ({ ...prev, totalProperties: prev.totalProperties - 1 }));
      
      setShowDeleteDialog(false);
      setPropertyToDelete(null);
      
    } catch (error) {
      console.error('Error deleting property:', error);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (propertyId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
      setDeleting(`toggle-${propertyId}`);
      
      const response = await fetch(`${API_URL}/properties/${propertyId}/toggle-active`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Toggle failed');

      const data = await response.json();

      setProperties(prev => prev.map(p => 
        p.id === propertyId 
          ? { ...p, is_active: data.data.is_active, status: data.data.status || p.status }
          : p
      ));
      
    } catch (error) {
      console.error('Error toggling property:', error);
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      approved: { className: "bg-emerald-500 text-white", icon: CheckCircle, text: isRTL ? 'موافق عليه' : 'Approved' },
      pending: { className: "bg-amber-500 text-white", icon: Clock, text: isRTL ? 'قيد المراجعة' : 'Pending' },
      rejected: { className: "bg-red-500 text-white", icon: XCircle, text: isRTL ? 'مرفوض' : 'Rejected' },
      sold: { className: "bg-gray-500 text-white", icon: DollarSign, text: isRTL ? 'مباع' : 'Sold' }
    };

    const badgeInfo = badges[status as keyof typeof badges];
    if (!badgeInfo) return <Badge>{status}</Badge>;

    const Icon = badgeInfo.icon;
    return (
      <Badge className={`${badgeInfo.className} px-2.5 py-1 flex items-center gap-1.5`}>
        <Icon className="w-3.5 h-3.5" />
        {badgeInfo.text}
      </Badge>
    );
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US').format(price);
    return isRTL 
      ? (type === 'rent' ? `${formatted} جنيه/شهر` : `${formatted} جنيه`)
      : (type === 'rent' ? `EGP ${formatted}/mo` : `EGP ${formatted}`);
  };

  const filteredProperties = React.useMemo(() => {
    return properties.filter(property => {
      const matchesSearch = !searchTerm || 
        property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location_city?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || property.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || property.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [properties, searchTerm, statusFilter, categoryFilter]);

  const getPropertiesForTab = useCallback((tab: string) => {
    return tab === 'all' ? filteredProperties : filteredProperties.filter(p => p.status === tab);
  }, [filteredProperties]);

  const PropertyCard = ({ property, isFavorite = false }: { property: Property; isFavorite?: boolean }) => (
    <Card className="group overflow-hidden border-2 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        {property.images?.[0] ? (
          <img src={getImageUrl(property.images[0])} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <Home className="w-16 h-16 text-gray-300" />
          </div>
        )}
        
        <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'} z-10 flex flex-col gap-2`}>
          {getStatusBadge(property.status)}
          {property.is_active === false && (
            <Badge className="bg-gray-500 text-white px-2.5 py-1 flex items-center gap-1.5">
              <Power className="w-3.5 h-3.5" />
              {isRTL ? 'غير نشط' : 'Inactive'}
            </Badge>
          )}
        </div>
        
        {property.is_featured && (
          <Badge className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} z-10 bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg`}>
            <Star className="w-3.5 h-3.5 fill-current mr-1.5" />
            {isRTL ? 'مميز' : 'Featured'}
          </Badge>
        )}
        
        <Badge className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} z-10 ${property.rent_or_buy === 'rent' ? 'bg-blue-500' : 'bg-emerald-500'} text-white shadow-lg`}>
          {isRTL ? (property.rent_or_buy === 'rent' ? 'للإيجار' : 'للبيع') : (property.rent_or_buy === 'rent' ? 'For Rent' : 'For Sale')}
        </Badge>

        {property.images?.length > 1 && (
          <Badge className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'} z-10 bg-black/70 text-white`}>
            <Camera className="w-3.5 h-3.5 mr-1.5" />
            {property.images.length}
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-emerald-600 transition-colors">
            {property.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
        </div>

        <div className={`flex items-center gap-2 text-sm text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <MapPin className="w-4 h-4 text-emerald-500" />
          <span className="truncate font-medium">{property.location_city}, {property.location_governorate}</span>
        </div>
        
        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="grid grid-cols-3 gap-3 py-3 px-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
            {property.bedrooms && (
              <div className="flex flex-col items-center gap-1">
                <Bed className="w-5 h-5 text-blue-500" />
                <span className="text-xs font-semibold text-gray-700">{property.bedrooms}</span>
              </div>
            )}
            {property.bathrooms && (
              <div className="flex flex-col items-center gap-1">
                <Bath className="w-5 h-5 text-cyan-500" />
                <span className="text-xs font-semibold text-gray-700">{property.bathrooms}</span>
              </div>
            )}
            {property.area && (
              <div className="flex flex-col items-center gap-1">
                <Square className="w-5 h-5 text-purple-500" />
                <span className="text-xs font-semibold text-gray-700">{property.area}m²</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between gap-4 py-3 px-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-100">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600">{isRTL ? 'مشاهدات' : 'Views'}</p>
              <p className="text-lg font-bold text-gray-900">{property.views_count || 0}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-emerald-200"></div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-600">{isRTL ? 'استفسارات' : 'Inquiries'}</p>
              <p className="text-lg font-bold text-gray-900">{property.inquiries_count || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-3 border-t-2 border-gray-100">
          <div className="flex items-baseline gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {formatPrice(property.price, property.rent_or_buy)}
            </span>
          </div>
        </div>

        {property.status === 'rejected' && property.rejection_reason && (
          <div className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 text-sm font-bold mb-1">{isRTL ? 'سبب الرفض:' : 'Rejection Reason:'}</p>
                <p className="text-red-700 text-sm leading-relaxed">{property.rejection_reason}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-2 pt-2">
          {isFavorite ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300" 
              onClick={() => navigate(`/property/${property.id}`)}>
              <Eye className="w-4 h-4 mr-2" />
              {isRTL ? 'عرض الإعلان' : 'View Ad'}
            </Button>
          ) : (
            <>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300" 
                  onClick={() => navigate(`/property/${property.id}`)}>
                  <Eye className="w-4 h-4 mr-2" />
                  {isRTL ? 'عرض' : 'View'}
                </Button>
                
                <Button variant="outline" size="sm" className="flex-1 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300" 
                  onClick={() => navigate(`/seller-panel?edit=${property.id}`)} disabled={property.status === 'sold'}>
                  <Edit className="w-4 h-4 mr-2" />
                  {isRTL ? 'تعديل' : 'Edit'}
                </Button>
              </div>

              <div className="flex gap-2">
                {property.status === 'approved' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`flex-1 ${property.is_active !== false ? 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300' : 'hover:bg-green-50 hover:text-green-600 hover:border-green-300'}`}
                    onClick={() => handleToggleActive(property.id, property.is_active !== false)} 
                    disabled={deleting === `toggle-${property.id}` || property.status === 'sold'}>
                    {deleting === `toggle-${property.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Power className="w-4 h-4 mr-2" />
                    )}
                    {property.is_active !== false 
                      ? (isRTL ? 'إلغاء التفعيل' : 'Deactivate')
                      : (isRTL ? 'تفعيل' : 'Activate')
                    }
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1 hover:bg-red-50 hover:text-red-600 hover:border-red-300" 
                  disabled={deleting === property.id} onClick={() => confirmDelete(property.id, property.title)}>
                  {deleting === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
              </div>

              {/* Comments Button */}
              <Button
                onClick={() => setShowCommentsFor(property.id)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                size="sm"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isRTL ? 'إدارة التعليقات' : 'Manage Comments'}
                {property.totalComments !== undefined && property.totalComments > 0 && (
                  <Badge className="ml-2 bg-white/20 text-white">
                    {property.totalComments}
                  </Badge>
                )}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="container mx-auto px-4 py-12 text-center py-20">
          <Loader2 className="w-16 h-16 animate-spin text-emerald-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{isRTL ? 'جاري التحميل...' : 'Loading Your Ads...'}</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <Card className="max-w-md mx-4 shadow-2xl border-2 border-gray-200">
          <CardContent className="text-center p-8">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Home className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{isRTL ? 'يجب تسجيل الدخول' : 'Login Required'}</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">{isRTL ? 'يرجى تسجيل الدخول للوصول إلى إعلاناتك' : 'Please login to access your ads'}</p>
            <Button onClick={() => navigate('/login')} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 py-6 shadow-lg">
              {isRTL ? 'تسجيل الدخول' : 'Login Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                {isRTL ? 'إعلاناتي' : 'My Ads'}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">{isRTL ? 'إدارة وتتبع إعلاناتك العقارية' : 'Manage and track your property listings'}</p>
          </div>
          <Button onClick={() => navigate('/seller-panel')} size="lg" 
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all">
            <Plus className="w-5 h-5 mr-2" />
            {isRTL ? 'إضافة عقار جديد' : 'Add New Property'}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { title: isRTL ? 'إجمالي الإعلانات' : 'Total Ads', value: stats.totalProperties, icon: Home, gradient: 'from-blue-500 to-cyan-600' },
            { title: isRTL ? 'النشطة' : 'Active', value: stats.approvedProperties, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
            { title: isRTL ? 'إجمالي المشاهدات' : 'Total Views', value: stats.totalViews, icon: Eye, gradient: 'from-purple-500 to-pink-600' },
            { title: isRTL ? 'الاستفسارات' : 'Inquiries', value: stats.totalInquiries, icon: MessageSquare, gradient: 'from-amber-500 to-orange-600' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="group border-2 border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString(isRTL ? 'ar-EG' : 'en-US')}</p>
                      <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                    </div>
                    <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

    
<Card className="mb-6 shadow-md border-2 border-gray-100">
  <CardContent className="p-5">
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="flex-1 relative">
        <Search className={`absolute top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? 'right-4' : 'left-4'}`} />
        <Input 
          placeholder={isRTL ? 'البحث في الإعلانات...' : 'Search ads...'} 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className={`${isRTL ? 'pr-12 text-right' : 'pl-12'} h-12 border-2`} 
        />
      </div>
      
      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className={`w-full sm:w-48 h-12 border-2 ${isRTL ? 'text-right' : ''}`}>
          <SelectValue placeholder={isRTL ? 'الحالة' : 'Status'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isRTL ? 'جميع الحالات' : 'All'}</SelectItem>
          <SelectItem value="approved">{isRTL ? 'موافق عليها' : 'Approved'}</SelectItem>
          <SelectItem value="pending">{isRTL ? 'قيد المراجعة' : 'Pending'}</SelectItem>
          <SelectItem value="rejected">{isRTL ? 'مرفوضة' : 'Rejected'}</SelectItem>
          <SelectItem value="sold">{isRTL ? 'مباعة' : 'Sold'}</SelectItem>
        </SelectContent>
      </Select>
      
      {/* Category Filter */}
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className={`w-full sm:w-48 h-12 border-2 ${isRTL ? 'text-right' : ''}`}>
          <SelectValue placeholder={isRTL ? 'النوع' : 'Type'} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isRTL ? 'جميع الأنواع' : 'All'}</SelectItem>
          <SelectItem value="villa">{isRTL ? 'فيلا' : 'Villa'}</SelectItem>
          <SelectItem value="apartment">{isRTL ? 'شقة' : 'Apartment'}</SelectItem>
          <SelectItem value="townhouse">{isRTL ? 'تاون هاوس' : 'Townhouse'}</SelectItem>
          <SelectItem value="land">{isRTL ? 'أرض' : 'Land'}</SelectItem>
          <SelectItem value="building">{isRTL ? 'مبنى' : 'Building'}</SelectItem>
          <SelectItem value="commercial">{isRTL ? 'تجاري' : 'Commercial'}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </CardContent>
</Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-white border-2 border-gray-100 p-1 mb-6 shadow-md h-auto">
            {[
              { value: 'all', label: isRTL ? 'الكل' : 'All', count: stats.totalProperties, color: 'text-blue-600', icon: Package },
              { value: 'approved', label: isRTL ? 'نشط' : 'Active', count: stats.approvedProperties, color: 'text-emerald-600', icon: CheckCircle },
              { value: 'pending', label: isRTL ? 'معلق' : 'Pending', count: stats.pendingProperties, color: 'text-amber-600', icon: Clock },
              { value: 'rejected', label: isRTL ? 'مرفوض' : 'Rejected', count: stats.rejectedProperties, color: 'text-red-600', icon: XCircle },
              { value: 'sold', label: isRTL ? 'مباع' : 'Sold', count: stats.soldProperties, color: 'text-gray-600', icon: Home },
              { value: 'favorites', label: isRTL ? 'المفضلة' : 'Favorites', count: favorites.length, color: 'text-pink-600', icon: Star }
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} 
                className="font-semibold data-[state=active]:bg-gradient-to-br data-[state=active]:from-emerald-50 data-[state=active]:to-teal-50 data-[state=active]:shadow-md py-3">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-sm md:text-base">{tab.label}</span>
                  <span className={`text-xs font-bold ${tab.color}`}>({tab.count})</span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {['all', 'approved', 'pending', 'rejected', 'sold'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {getPropertiesForTab(tab).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {getPropertiesForTab(tab).map(property => <PropertyCard key={property.id} property={property} />)}
                </div>
              ) : (
                <Card className="shadow-lg border-2 border-gray-100">
                  <CardContent className="text-center py-20">
                    <Home className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">{isRTL ? 'لا توجد إعلانات' : 'No Ads Found'}</h3>
                    <p className="text-gray-500 mb-8 text-lg">
                      {tab === 'all' 
                        ? (isRTL ? 'ابدأ بإضافة أول إعلان لك' : 'Start by adding your first ad')
                        : (isRTL ? `لا توجد إعلانات بحالة "${tab}"` : `No ${tab} ads found`)
                      }
                    </p>
                    {tab === 'all' && (
                      <Button onClick={() => navigate('/seller-panel')} size="lg" 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all">
                        <Plus className="w-5 h-5 mr-2" />
                        {isRTL ? 'إضافة إعلان جديد' : 'Add New Ad'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
          
          <TabsContent value="favorites" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {loadingFavorites ? (
              <Card className="shadow-lg border-2 border-gray-100 animate-in fade-in duration-300">
                <CardContent className="text-center py-20">
                  <Loader2 className="w-12 h-12 text-emerald-500 mx-auto mb-4 animate-spin" />
                  <p className="text-gray-500">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
                </CardContent>
              </Card>
            ) : favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {favorites.map((property, index) => (
                  <div
                    key={property.id}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <PropertyCard property={property} isFavorite={true} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="shadow-lg border-2 border-gray-100 animate-in fade-in zoom-in-95 duration-500">
                <CardContent className="text-center py-20">
                  <Star className="w-24 h-24 text-gray-300 mx-auto mb-6 animate-in fade-in zoom-in-50 duration-700" />
                  <h3 className="text-2xl font-bold text-gray-700 mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
                    {isRTL ? 'لا توجد عقارات مفضلة' : 'No Favorite Properties'}
                  </h3>
                  <p className="text-gray-500 mb-8 text-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-300">
                    {isRTL ? 'ابدأ بإضافة عقارات إلى قائمة المفضلة من السوق' : 'Start adding properties to your favorites from the marketplace'}
                  </p>
                  <Button onClick={() => navigate('/marketplace')} size="lg" 
                    className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all animate-in fade-in zoom-in-95 duration-500 delay-500">
                    {isRTL ? 'تصفح السوق' : 'Browse Marketplace'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle className={`text-xl font-bold ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "تأكيد الحذف" : "Confirm Deletion"}
            </DialogTitle>
            <DialogDescription className={`text-gray-600 ${isRTL ? 'text-right' : 'text-left'}`}>
              {isRTL ? "هذا الإجراء لا يمكن التراجع عنه." : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          
          <div className={`py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-lg mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-900 mb-1">
                  {isRTL ? "سيتم حذف الإعلان التالي:" : "The following ad will be deleted:"}
                </p>
                <p className="text-red-700 font-medium">
                  "{propertyToDelete?.title}"
                </p>
              </div>
            </div>
            
            <p className="text-gray-700 leading-relaxed">
              {isRTL 
                ? "هل أنت متأكد من حذف هذا الإعلان؟ سيتم حذف جميع الصور والبيانات المرتبطة به بشكل دائم."
                : "Are you sure you want to delete this ad? All images and associated data will be permanently removed."
              }
            </p>
          </div>

          <DialogFooter className={`gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteDialog(false);
                setPropertyToDelete(null);
              }}
              disabled={deleting !== null}
              className="flex-1"
            >
              {isRTL ? "إلغاء" : "Cancel"}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProperty}
              disabled={deleting !== null}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {isRTL ? "جاري الحذف..." : "Deleting..."}
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isRTL ? "حذف نهائي" : "Delete Permanently"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <PropertyCommentsOwner
        propertyId={showCommentsFor}
        isOpen={showCommentsFor !== null}
        onClose={() => setShowCommentsFor(null)}
      />
    </div>
  );
};

export default MyAds;