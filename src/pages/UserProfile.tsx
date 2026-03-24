import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ChatButton } from '@/components/ChatButton';
import { FavoriteButton } from '@/components/FavoriteButton';
import { API_URL, API_BASE_URL } from '@/config/api';
import { SEO } from '@/components/SEO';
import { SharePropertyButton } from '@/components/SharePropertyButton';
import PropertyComments from '@/components/PropertyComments';
import { 
  Search, 
  Filter, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Home, 
  Building, 
  Warehouse,
  User,
  Phone,
  Mail,
  ArrowLeft,
  Eye,
  MessageCircle  // Add this
} from 'lucide-react';


interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location_governorate: string;
  location_city: string;
  category: string;
  rent_or_buy: string;
  status: string;
  images: string[];
  created_at: string;
  user_name: string;
  user_id: number;
  user_phone: string;
  is_favorited?: boolean;
  totalComments?: number;      // Add this
  averageRating?: number;       // Add this
}

interface UserProfile {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: string;
  created_at: string;
  properties_count?: number;
  avatar?: string;
}

interface Location {
  id: string;
  name_en: string;
  name_ar: string;
}

interface Governorate extends Location {
  cities: City[];
}

interface City extends Location {
  governorate_id: string;
}

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_new_old');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGovernorate, setFilterGovernorate] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [priceRangeType, setPriceRangeType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000000]);
  const [showPhoneForProperty, setShowPhoneForProperty] = useState<string | null>(null);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  const isNumericId = /^\d+$/.test(username || '');

  const priceRangeConfigs = {
    'all': { min: 0, max: 10000000000, step: 100000000, label: isRTL ? 'الكل' : 'ALL' },
    '100K': { min: 0, max: 100000, step: 2000, label: isRTL ? 'حتى 100 ألف' : 'Up to 100K' },
    '10M': { min: 100000, max: 10000000, step: 50000, label: isRTL ? '100 ألف - 10 مليون' : '100K - 10M' },
    '100M': { min: 10000000, max: 100000000, step: 1000000, label: isRTL ? '10 - 100 مليون' : '10M - 100M' },
    '500M': { min: 100000000, max: 500000000, step: 20000000, label: isRTL ? '100 - 500 مليون' : '100M - 500M' },
    '1B': { min: 500000000, max: 1000000000, step: 50000000, label: isRTL ? '500 مليون - 1 مليار' : '500M - 1B' },
    'ABOVE': { min: 1000000000, max: 10000000000, step: 100000000, label: isRTL ? 'أكثر من 1 مليار' : 'Above 1B' }
  };

  const handlePriceRangeTypeChange = (type: string) => {
    setPriceRangeType(type);
    const config = priceRangeConfigs[type as keyof typeof priceRangeConfigs];
    setPriceRange([config.min, config.max]);
  };

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

  const getPropertyImageUrl = (imagePath: string) => {
    if (!imagePath) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };

  useEffect(() => {
    fetchUserProfile();
    fetchUserProperties();
    fetchGovernorates();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoint = isNumericId 
        ? `${API_URL}/users/${username}` 
        : `${API_URL}/users/username/${username}`;

      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        throw new Error('User not found');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        setUser(data.data);
      }
    } catch (err: any) {
      console.error('Error fetching user:', err);
      setError(isRTL ? 'فشل تحميل الملف الشخصي' : 'Failed to load profile');
    }
  };

  const fetchUserProperties = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const endpoint = isNumericId
        ? `${API_URL}/users/${username}/properties`
        : `${API_URL}/users/username/${username}/properties`;

      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        const propertiesArray = Array.isArray(data.data.data) 
          ? data.data.data 
          : Array.isArray(data.data) 
          ? data.data 
          : [];
        
        const processedProperties = propertiesArray.map((prop: any) => ({
          ...prop,
          images: Array.isArray(prop.images) 
            ? prop.images 
            : typeof prop.images === 'string' 
            ? JSON.parse(prop.images) 
            : [],
          location_governorate: prop.governorate?.name_en || prop.location_governorate || '',
          location_city: prop.city?.name_en || prop.location_city || '',
          user_name: prop.user?.name || user?.name || 'Unknown',
          user_id: prop.user?.id || user?.id || 0,
          user_phone: prop.user?.phone || user?.phone || 'N/A'
        }));
        
        setProperties(processedProperties);
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError(isRTL ? 'خطأ في تحميل العقارات' : 'Error loading properties');
    } finally {
      setLoading(false);
    }
  };

  const fetchGovernorates = async () => {
    try {
      const response = await fetch(`${API_URL}/governorates`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success && data.data) {
          const governoratesData = data.data.map((gov: any) => ({
            ...gov,
            cities: []
          }));
          setGovernorates(governoratesData);
          return;
        }
      }
      
      setGovernorates([]);
    } catch (err) {
      console.error('Error fetching governorates:', err);
      setGovernorates([]);
    }
  };

  useEffect(() => {
    const loadCitiesForGovernorate = async () => {
      if (filterGovernorate !== 'all') {
        setFilterCity('all');
        
        const selectedGov = governorates.find(g => String(g.id) === filterGovernorate);
        
        if (selectedGov && (!selectedGov.cities || selectedGov.cities.length === 0)) {
          try {
            const response = await fetch(`${API_URL}/governorates/${filterGovernorate}/cities`);
            if (response.ok) {
              const data = await response.json();
              
              if (data.success && data.data) {
                setGovernorates(prev => prev.map(gov => 
                  String(gov.id) === filterGovernorate 
                    ? { ...gov, cities: data.data }
                    : gov
                ));
              }
            }
          } catch (error) {
            console.error('Error loading cities:', error);
          }
        }
      } else {
        setFilterCity('all');
      }
    };
    
    loadCitiesForGovernorate();
  }, [filterGovernorate]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'villa':
      case 'townhouse':
        return <Home className="w-4 h-4" />;
      case 'apartment':
      case 'building':
        return <Building className="w-4 h-4" />;
      case 'commercial':
        return <Warehouse className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat('en-US').format(price);
    return type === 'rent' 
      ? `${formatted} ${isRTL ? 'جنيه/شهرياً' : 'EGP/month'}` 
      : `${formatted} ${isRTL ? 'جنيه' : 'EGP'}`;
  };

  const getAvailableCities = () => {
    if (filterGovernorate === 'all') return [];
    
    const selectedGov = governorates.find(gov => 
      String(gov.id) === filterGovernorate
    );
    
    return selectedGov && Array.isArray(selectedGov.cities) ? selectedGov.cities : [];
  };

  const filteredProperties = properties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      property.title.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower) ||
      property.location_governorate.toLowerCase().includes(searchLower) ||
      property.location_city.toLowerCase().includes(searchLower) ||
      governorates.some(gov => 
        (gov.name_ar.toLowerCase().includes(searchLower) || 
         gov.name_en.toLowerCase().includes(searchLower)) &&
        (property.location_governorate === gov.name_en || 
         property.location_governorate === gov.name_ar)
      ) ||
      cities.some(city => 
        (city.name_ar.toLowerCase().includes(searchLower) || 
         city.name_en.toLowerCase().includes(searchLower)) &&
        (property.location_city === city.name_en || 
         property.location_city === city.name_ar)
      );
      
    const matchesCategory = filterCategory === 'all' || property.category === filterCategory;
    
    let matchesGovernorate = filterGovernorate === 'all';
    if (!matchesGovernorate && filterGovernorate !== 'all') {
      const selectedGov = governorates.find(g => String(g.id) === filterGovernorate);
      if (selectedGov) {
        const govName = isRTL ? selectedGov.name_ar : selectedGov.name_en;
        matchesGovernorate = property.location_governorate === govName;
      }
    }
    
    let matchesCity = filterCity === 'all';
    if (!matchesCity && filterCity !== 'all') {
      const availableCities = getAvailableCities();
      const selectedCity = availableCities.find(c => String(c.id) === filterCity);
      if (selectedCity) {
        const cityName = isRTL ? selectedCity.name_ar : selectedCity.name_en;
        matchesCity = property.location_city === cityName;
      }
    }
    
    const matchesType = filterType === 'all' || property.rent_or_buy === filterType;
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesGovernorate && matchesCity && matchesType && matchesPrice;
  });

  const sortedProperties = [...filteredProperties].sort((a, b) => {
    switch (sortBy) {
      case 'date_new_old':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'date_old_new':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'price_low_high':
        return a.price - b.price;
      case 'price_high_low':
        return b.price - a.price;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{isRTL ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {isRTL ? 'المستخدم غير موجود' : 'User Not Found'}
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => navigate('/marketplace')}>
            {isRTL ? 'العودة إلى السوق' : 'Back to Marketplace'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={`${user.name} (@${user.username}) - Real Estate Agent Profile | 3qaraty`}
        titleAr={`${user.name} (@${user.username}) - الملف الشخصي للوكيل العقاري | عقارتي`}
        description={`View ${user.name}'s profile and browse ${properties.length} property listings on 3qaraty. Contact @${user.username} directly for real estate inquiries in Egypt. Properties for sale and rent.`}
        descriptionAr={`اعرض ملف ${user.name} الشخصي وتصفح ${properties.length} إعلان عقاري على عقارتي. تواصل مع @${user.username} مباشرة لاستفسارات العقارات في مصر. عقارات للبيع والإيجار.`}
        keywords={`${user.name}, @${user.username}, real estate agent Egypt, property listings ${user.username}, ${user.name} properties, contact real estate agent, Egyptian property seller, real estate profile, property agent`}
        keywordsAr={`${user.name}, @${user.username}, وكيل عقاري مصر, إعلانات عقارية ${user.username}, عقارات ${user.name}, تواصل مع وكيل عقاري, بائع عقارات مصري, ملف عقاري, وكيل عقارات`}
        canonical={`https://3qaraty.icu/profile/${user.username || user.id}`}
        ogType="profile"
      />
      
      <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className={`mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {isRTL ? <ArrowLeft className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {isRTL ? 'رجوع' : 'Back'}
        </Button>

        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className={`flex flex-col md:flex-row items-center gap-6 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <Avatar className="w-32 h-32 border-4 border-white shadow-lg flex-shrink-0">
                <AvatarImage src={getImageUrl(user.avatar)} alt={user.name} />
                <AvatarFallback className="text-4xl font-bold bg-green-100 text-green-600">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              
              <div className={`flex-1 text-center md:text-left ${isRTL ? 'md:text-right' : ''}`}>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                {user.username && (
                  <p className="text-gray-600 mb-1">@{user.username}</p>
                )}
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  <Badge className="bg-green-600">
                    {isRTL ? 'بائع' : 'Seller'}
                  </Badge>
                  <Badge variant="outline">
                    {isRTL ? `${properties.length} عقار` : `${properties.length} Properties`}
                  </Badge>
                </div>
                
                <div className={`flex flex-col sm:flex-row gap-3 text-sm text-gray-600 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  {user.phone && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Phone className="w-4 h-4" />
                      <span dir="ltr">{user.phone}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                  )}
                  <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Calendar className="w-4 h-4" />
                    <span>
                      {isRTL ? 'انضم في ' : 'Joined '}
                      {new Date(user.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <ChatButton 
                  userId={user.id}
                  userName={user.name}
                  className="w-full bg-green-600 hover:bg-green-700"
                  variant="default"
                  showName={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {isRTL ? 'عقارات المستخدم' : "User's Properties"}
          </h2>
          
          <div className="relative max-w-md mb-6">
            <Search className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
            <Input
              type="text"
              placeholder={isRTL ? 'ابحث عن العقارات، المدن...' : 'Search properties, cities...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} w-full`}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Filter className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">{isRTL ? 'فلترة حسب' : 'Filter By'}</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'ترتيب حسب' : 'Sort By'}
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_new_old">
                    {isRTL ? 'الأحدث إلى الأقدم' : 'Newest to Oldest'}
                  </SelectItem>
                  <SelectItem value="date_old_new">
                    {isRTL ? 'الأقدم إلى الأحدث' : 'Oldest to Newest'}
                  </SelectItem>
                  <SelectItem value="price_low_high">
                    {isRTL ? 'السعر من الأقل للأكثر' : 'Price: Low to High'}
                  </SelectItem>
                  <SelectItem value="price_high_low">
                    {isRTL ? 'السعر من الأكثر للأقل' : 'Price: High to Low'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'نوع العقار' : 'Property Type'}
              </label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'كل الأنواع' : 'All Types'}</SelectItem>
                  <SelectItem value="villa">{isRTL ? 'فيلا' : 'Villa'}</SelectItem>
                  <SelectItem value="apartment">{isRTL ? 'شقة' : 'Apartment'}</SelectItem>
                  <SelectItem value="townhouse">{isRTL ? 'تاون هاوس' : 'Townhouse'}</SelectItem>
                  <SelectItem value="land">{isRTL ? 'أرض' : 'Land'}</SelectItem>
                  <SelectItem value="building">{isRTL ? 'مبنى' : 'Building'}</SelectItem>
                  <SelectItem value="commercial">{isRTL ? 'تجاري' : 'Commercial'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'إيجار أو شراء' : 'Rent or Buy'}
              </label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="rent">{isRTL ? 'إيجار' : 'Rent'}</SelectItem>
                  <SelectItem value="buy">{isRTL ? 'شراء' : 'Buy'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'المحافظة' : 'Governorate'}
              </label>
              <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'كل المحافظات' : 'All Governorates'}</SelectItem>
                  {governorates.map((gov) => (
                    <SelectItem key={gov.id} value={String(gov.id)}>
                      {isRTL ? gov.name_ar : gov.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {isRTL ? 'المدينة' : 'City'}
              </label>
              <Select 
                value={filterCity} 
                onValueChange={setFilterCity}
                disabled={filterGovernorate === 'all'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isRTL ? 'كل المدن' : 'All Cities'}</SelectItem>
                  {getAvailableCities().map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {isRTL ? city.name_ar : city.name_en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-3">
              {isRTL ? 'نطاق السعر' : 'Price Range'}
            </label>
            
            <div className="mb-4">
              <Select value={priceRangeType} onValueChange={handlePriceRangeTypeChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{priceRangeConfigs['all'].label}</SelectItem>
                  <SelectItem value="100K">{priceRangeConfigs['100K'].label}</SelectItem>
                  <SelectItem value="10M">{priceRangeConfigs['10M'].label}</SelectItem>
                  <SelectItem value="100M">{priceRangeConfigs['100M'].label}</SelectItem>
                  <SelectItem value="500M">{priceRangeConfigs['500M'].label}</SelectItem>
                  <SelectItem value="1B">{priceRangeConfigs['1B'].label}</SelectItem>
                  <SelectItem value="ABOVE">{priceRangeConfigs['ABOVE'].label}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="px-4">
              <Slider
                value={priceRange}
                onValueChange={setPriceRange}
                max={priceRangeConfigs[priceRangeType as keyof typeof priceRangeConfigs].max}
                min={priceRangeConfigs[priceRangeType as keyof typeof priceRangeConfigs].min}
                step={priceRangeConfigs[priceRangeType as keyof typeof priceRangeConfigs].step}
                className="w-full"
              />
              <div className={`flex justify-between text-sm text-gray-600 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="text-left">
                  <div className="font-semibold">{new Intl.NumberFormat('en-US').format(priceRange[0])}</div>
                  <div className="text-xs text-gray-400">{isRTL ? 'جنيه' : 'EGP'}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{new Intl.NumberFormat('en-US').format(priceRange[1])}</div>
                  <div className="text-xs text-gray-400">{isRTL ? 'جنيه' : 'EGP'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedProperties.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {isRTL ? 'لا توجد عقارات' : 'No Properties Found'}
              </h3>
              <p className="text-gray-500">
                {isRTL ? 'جرب تغيير معايير البحث' : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            sortedProperties.map((property) => {
              const isArabic = /[\u0600-\u06FF]/.test(property.title);
              
              return (
                <Card 
                  key={property.id} 
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  <div 
                    className="relative cursor-pointer"
                    onClick={() => navigate(`/property/${property.id}`)}
                  >
                    {property.images && property.images.length > 0 && property.images[0] ? (
                      <img
                        src={getPropertyImageUrl(property.images[0])}
                        alt={property.title}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                        <Home className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    
                    <div 
                      className="absolute top-3 right-3 z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FavoriteButton
                        propertyId={property.id}
                        initialIsFavorited={property.is_favorited || false}
                        className="bg-white/90 hover:bg-white shadow-lg"
                      />
                    </div>
                    
                    <Badge 
                      className={`absolute top-3 left-3 ${
                        property.rent_or_buy === 'rent' ? 'bg-blue-600' : 'bg-green-600'
                      } text-white shadow-lg`}
                    >
                      {isRTL ? (property.rent_or_buy === 'rent' ? 'إيجار' : 'شراء') : (property.rent_or_buy === 'rent' ? 'Rent' : 'Buy')}
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <CardTitle 
                      className={`flex items-start gap-2 text-base leading-relaxed cursor-pointer hover:text-green-600 transition-colors ${
                        isArabic ? 'flex-row-reverse text-right' : ''
                      }`}
                      style={{ 
                        minHeight: '3rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                      title={property.title}
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      <span className="flex-shrink-0 mt-1">
                        {getCategoryIcon(property.category)}
                      </span>
                      <span className="flex-1 font-semibold">
                        {property.title}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-3 flex-grow">
                    <p 
                      className={`text-gray-600 text-sm leading-relaxed ${
                        isArabic ? 'text-right' : ''
                      }`}
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {property.description}
                    </p>
                    
                    <div className={`flex items-center gap-2 text-sm text-gray-500 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <MapPin className="w-4 h-4 flex-shrink-0 text-red-500" />
                      <span className="truncate">
                        {property.location_city}, {property.location_governorate}
                      </span>
                    </div>
                    
                    <div className={`flex items-center gap-2 text-sm text-gray-500 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <Calendar className="w-4 h-4 flex-shrink-0 text-blue-500" />
                      <span>{new Date(property.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                    </div>
                    
                    <div className={`flex items-center gap-2 pt-2 border-t ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <DollarSign className="w-5 h-5 flex-shrink-0 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        {formatPrice(property.price, property.rent_or_buy)}
                      </span>
                    </div>
                  </CardContent>
                  
                <CardFooter className="pt-4 pb-4 flex-col gap-2 bg-gray-50">
  {/* Row 1: View and Chat Buttons */}
  <div className={`flex w-full gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <Button 
      onClick={() => navigate(`/property/${property.id}`)}
      variant="outline" 
      className="flex-1 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 bg-white"
    >
      <Eye className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
      {isRTL ? 'عرض التفاصيل' : 'View Details'}
    </Button>
    
    <ChatButton
      userId={property.user_id}
      userName={property.user_name}
      className="flex-1 bg-green-600 hover:bg-green-700"
      size="default"
      variant="default"
    />
  </div>

  {/* Row 2: Phone Number Section */}
  <div className="w-full">
    {showPhoneForProperty === property.id ? (
      <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = `tel:${property.user_phone}`}
        >
          <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {property.user_phone}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowPhoneForProperty(null)}
          className="bg-white"
        >
          ✕
        </Button>
      </div>
    ) : (
      <Button
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        onClick={() => setShowPhoneForProperty(property.id)}
      >
        <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
        {isRTL ? 'إظهار رقم الهاتف' : 'Show Phone Number'}
      </Button>
    )}
  </div>

  {/* Row 3: Comments and Share */}
  <div className={`flex w-full gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
    {/* Comments Button */}
    <Button
      onClick={() => setShowCommentsFor(property.id)}
      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
    >
      <MessageCircle className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
      {isRTL ? 'تعليقات' : 'Comments'}
      {property.totalComments !== undefined && property.totalComments > 0 && (
        <Badge className={`${isRTL ? 'mr-2' : 'ml-2'} bg-white/20 text-white`}>
          {property.totalComments}
        </Badge>
      )}
    </Button>
    
    {/* Share Button */}
    <SharePropertyButton
      property={property}
      className="flex-1"
      variant="outline"
      size="default"
      showLabel={true}
    />
  </div>
</CardFooter>
                </Card>
              );
            })
          )}
        </div>

         {sortedProperties.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              {isRTL 
                ? `عرض ${sortedProperties.length} من ${properties.length} عقار`
                : `Showing ${sortedProperties.length} of ${properties.length} properties`
              }
            </p>
          </div>
        )}
      </div>

      {/* PropertyComments Modal - ADD THIS */}
      <PropertyComments
        propertyId={showCommentsFor}
        isOpen={showCommentsFor !== null}
        onClose={() => setShowCommentsFor(null)}
        isRTL={isRTL}
      />
    </>
  );
};

export default UserProfile;