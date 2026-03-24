import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, MapPin, DollarSign, Home, Building, Warehouse, Eye, Phone, Crown, Shield, UserPlus, MessageCircle } from 'lucide-react';
import { ChatButton } from '@/components/ChatButton';
import { SharePropertyButton } from '@/components/SharePropertyButton';
import { API_URL, API_BASE_URL } from '@/config/api';
import PropertyComments from '@/components/PropertyComments';
import { Share2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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
  totalComments?: number;
  averageRating?: number;
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

interface SearchUser {
  id: number;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  is_admin: boolean;
  is_founder: boolean;
  properties_count?: number;
  isNewResult?: boolean;
}

interface MarketplaceProps {
  isAdmin?: boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  const propertyRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };
  
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
  
  const [searchUsers, setSearchUsers] = useState<SearchUser[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [showUserResults, setShowUserResults] = useState(false);
  const [showCommentsFor, setShowCommentsFor] = useState<string | null>(null);

  const priceRangeConfigs = {
    'all': { min: 0, max: 10000000000, step: 100000000, label: isRTL ? 'الكل' : 'ALL' },
    '100K': { min: 0, max: 100000, step: 2000, label: isRTL ? 'حتى 100 ألف' : 'Up to 100K' },
    '10M': { min: 100000, max: 10000000, step: 50000, label: isRTL ? '100 ألف - 10 مليون' : '100K - 10M' },
    '100M': { min: 10000000, max: 100000000, step: 1000000, label: isRTL ? '10 - 100 مليون' : '10M - 100M' },
    '500M': { min: 100000000, max: 500000000, step: 20000000, label: isRTL ? '100 - 500 مليون' : '100M - 500M' },
    '1B': { min: 500000000, max: 1000000000, step: 50000000, label: isRTL ? '500 مليون - 1 مليار' : '500M - 1B' },
    'ABOVE': { min: 1000000000, max: 10000000000, step: 100000000, label: isRTL ? 'أكثر من 1 مليار' : 'Above 1B' }
  };

  const mockGovernorates: Governorate[] = [
    {
      id: '1',
      name_en: 'Cairo',
      name_ar: 'القاهرة',
      cities: [
        { id: '1-1', name_en: 'New Cairo', name_ar: 'القاهرة الجديدة', governorate_id: '1' },
        { id: '1-2', name_en: 'Nasr City', name_ar: 'مدينة نصر', governorate_id: '1' }
      ]
    },
    {
      id: '2',
      name_en: 'Alexandria',
      name_ar: 'الإسكندرية',
      cities: [
        { id: '2-1', name_en: 'Sidi Gaber', name_ar: 'سيدي جابر', governorate_id: '2' }
      ]
    }
  ];

  const mockProperties: Property[] = [
    {
      id: '1',
      title: isRTL ? 'فيلا فاخرة في القاهرة الجديدة' : 'Luxury Villa in New Cairo',
      description: isRTL ? 'فيلا جميلة بـ 4 غرف نوم' : 'Beautiful 4-bedroom villa',
      price: 5000000,
      location_governorate: isRTL ? 'القاهرة' : 'Cairo',
      location_city: isRTL ? 'القاهرة الجديدة' : 'New Cairo',
      category: 'villa',
      rent_or_buy: 'buy',
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400'],
      created_at: '2024-01-15',
      user_name: 'Ahmed Hassan',
      user_id: 1,
      user_phone: '+20 123 456 7890',
      totalComments: 5,
      averageRating: 4.5
    }
  ];

  const handlePriceRangeTypeChange = (type: string) => {
    setPriceRangeType(type);
    const config = priceRangeConfigs[type as keyof typeof priceRangeConfigs];
    setPriceRange([config.min, config.max]);
  };

  const handlePropertyClick = (propertyId: string) => {
    sessionStorage.setItem('marketplace_scroll_position', window.scrollY.toString());
    sessionStorage.setItem('marketplace_property_id', propertyId);
    navigate(`/property/${propertyId}`);
  };

  const searchUsersGlobally = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchUsers([]);
      setShowUserResults(false);
      return;
    }

    setSearchingUsers(true);
    try {
      const token = localStorage.getItem('auth_token');
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(query)}`, {
        headers,
      });

      if (response.ok) {
        const data = await response.json();
        const users = data.users || data.data || [];
        
        const processedUsers = users.map((u: any) => ({
          ...u,
          isNewResult: true,
        }));
        
        setSearchUsers(processedUsers);
        setShowUserResults(processedUsers.length > 0);
      } else {
        setSearchUsers([]);
        setShowUserResults(false);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchUsers([]);
      setShowUserResults(false);
    } finally {
      setSearchingUsers(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        searchUsersGlobally(searchTerm);
      }, 300);
    } else {
      setSearchUsers([]);
      setShowUserResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/properties`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
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
          user_name: prop.user?.name || 'Unknown',
          user_id: prop.user?.id || prop.user_id || 0,
          user_phone: prop.user?.phone || prop.user_phone || 'N/A',
          totalComments: prop.totalComments || 0,
          averageRating: prop.averageRating || 0
        }));
        
        setProperties(processedProperties);
      } else {
        setProperties(mockProperties);
      }
    } catch (err) {
      setError(isRTL ? 'خطأ في تحميل العقارات' : 'Error loading properties');
      setProperties(mockProperties);
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
      
      setGovernorates(mockGovernorates);
      const allCities = mockGovernorates.flatMap(gov => gov.cities || []);
      setCities(allCities);
    } catch (err) {
      setGovernorates(mockGovernorates);
      const allCities = mockGovernorates.flatMap(gov => gov.cities || []);
      setCities(allCities);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchGovernorates();
  }, []);

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
  }, [filterGovernorate, governorates]);

  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem('marketplace_scroll_position');
    const savedPropertyId = sessionStorage.getItem('marketplace_property_id');
    
    if (savedScrollPosition && savedPropertyId && properties.length > 0) {
      setTimeout(() => {
        const propertyElement = propertyRefs.current[savedPropertyId];
        if (propertyElement) {
          propertyElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: parseInt(savedScrollPosition), behavior: 'smooth' });
        }
        
        sessionStorage.removeItem('marketplace_scroll_position');
        sessionStorage.removeItem('marketplace_property_id');
      }, 100);
    }
  }, [properties]);

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

  const renderUserBadge = (user: SearchUser) => {
    if (user.is_founder) {
      return (
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
          <Crown className="w-3 h-3 mr-1" />
          {isRTL ? 'مؤسس' : 'Founder'}
        </Badge>
      );
    }
    if (user.is_admin) {
      return (
        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs">
          <Shield className="w-3 h-3 mr-1" />
          {isRTL ? 'مشرف' : 'Admin'}
        </Badge>
      );
    }
    return null;
  };

  const filteredProperties = properties.filter(property => {
    const searchLower = searchTerm.toLowerCase();
    
    const matchesSearch = 
      property.title.toLowerCase().includes(searchLower) ||
      property.description.toLowerCase().includes(searchLower) ||
      property.user_name.toLowerCase().includes(searchLower) ||
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

  if (error) {
    return (
      <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Button 
            onClick={fetchProperties}
            className="mt-4 bg-green-600 hover:bg-green-700"
          >
            {isRTL ? 'إعادة المحاولة' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {isRTL ? 'السوق العقاري' : 'Property Marketplace'}
        </h1>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
          <Input
            type="text"
            placeholder={isRTL ? 'ابحث عن العقارات والمستخدمين...' : 'Search properties and users...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} w-full`}
          />
          
          {/* User Search Results Dropdown */}
          {showUserResults && searchUsers.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-2xl border-2 border-blue-200 max-h-96 overflow-y-auto">
              <div className={`p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50 ${isRTL ? 'text-right' : ''}`}>
                <h3 className="font-semibold text-gray-800">
                  {isRTL ? 'نتائج البحث عن المستخدمين' : 'User Search Results'}
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  {isRTL ? `تم العثور على ${searchUsers.length} مستخدم` : `Found ${searchUsers.length} users`}
                </p>
              </div>
              
              {searchUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    navigate(`/profile/${user.username || user.id}`);
                    setSearchTerm('');
                    setShowUserResults(false);
                  }}
                  className={`w-full p-4 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 ${
                    isRTL ? 'text-right' : 'text-left'
                  }`}
                >
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
                        <p className="font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        {renderUserBadge(user)}
                      </div>
                      
                      <p className={`text-sm text-gray-600 truncate ${isRTL ? 'text-right' : ''}`}>
                        @{user.username}
                      </p>
                      
                      {user.properties_count !== undefined && user.properties_count > 0 && (
                        <div className={`flex items-center gap-1 mt-1 text-xs text-green-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <Home className="w-3 h-3" />
                          <span>
                            {user.properties_count} {isRTL ? 'عقار' : 'properties'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className={`flex-shrink-0 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                      <UserPlus className="w-5 h-5 text-blue-500" />
                    </div>
                  </div>
                </button>
              ))}
              
              <div className="p-2 bg-gray-50 border-t">
                <button
                  onClick={() => {
                    setShowUserResults(false);
                    setSearchTerm('');
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-800 py-2"
                >
                  {isRTL ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
  
{/* Filters */}
<div className="bg-white rounded-lg shadow-md p-6 mb-8">
  <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
    <Filter className="w-5 h-5 text-green-600" />
    <h3 className="text-lg font-semibold">{isRTL ? 'فلترة حسب' : 'Filter By'}</h3>
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
    {/* Sort By */}
    <div>
      <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'ترتيب حسب' : 'Sort By'}
      </label>
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className={isRTL ? 'text-right' : ''}>
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

    {/* Property Type */}
    <div>
      <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'نوع العقار' : 'Property Type'}
      </label>
      <Select value={filterCategory} onValueChange={setFilterCategory}>
        <SelectTrigger className={isRTL ? 'text-right' : ''}>
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

    {/* Rent or Buy */}
    <div>
      <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'إيجار أو شراء' : 'Rent or Buy'}
      </label>
      <Select value={filterType} onValueChange={setFilterType}>
        <SelectTrigger className={isRTL ? 'text-right' : ''}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
          <SelectItem value="rent">{isRTL ? 'إيجار' : 'Rent'}</SelectItem>
          <SelectItem value="buy">{isRTL ? 'شراء' : 'Buy'}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Governorate */}
    <div>
      <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'المحافظة' : 'Governorate'}
      </label>
      <Select value={filterGovernorate} onValueChange={setFilterGovernorate}>
        <SelectTrigger className={isRTL ? 'text-right' : ''}>
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

    {/* City */}
    <div>
      <label className={`block text-sm font-medium mb-2 ${isRTL ? 'text-right' : ''}`}>
        {isRTL ? 'المدينة' : 'City'}
      </label>
      <Select 
        value={filterCity} 
        onValueChange={setFilterCity}
        disabled={filterGovernorate === 'all'}
      >
        <SelectTrigger className={isRTL ? 'text-right' : ''}>
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

  {/* Price Range Filter */}
  <div className="mb-4">
    <label className={`block text-sm font-medium mb-3 ${isRTL ? 'text-right' : ''}`}>
      {isRTL ? 'نطاق السعر' : 'Price Range'}
    </label>
    
    <div className="mb-4">
      <Select value={priceRangeType} onValueChange={handlePriceRangeTypeChange}>
        <SelectTrigger className={`w-full ${isRTL ? 'text-right' : ''}`}>
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
        <div className={isRTL ? 'text-right' : 'text-left'}>
          <div className="font-semibold">{new Intl.NumberFormat('en-US').format(priceRange[0])}</div>
          <div className="text-xs text-gray-400">{isRTL ? 'جنيه' : 'EGP'}</div>
        </div>
        <div className={isRTL ? 'text-left' : 'text-right'}>
          <div className="font-semibold">{new Intl.NumberFormat('en-US').format(priceRange[1])}</div>
          <div className="text-xs text-gray-400">{isRTL ? 'جنيه' : 'EGP'}</div>
        </div>
      </div>
    </div>
  </div>
</div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sortedProperties.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">{isRTL ? 'لا توجد عقارات' : 'No Properties Found'}</p>
          </div>
        ) : (
          sortedProperties.map((property) => (
            <Card 
              key={property.id}
              ref={(el) => (propertyRefs.current[property.id] = el)}
              className="overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative cursor-pointer" onClick={() => handlePropertyClick(property.id)}>
                <img
                  src={getImageUrl(property.images[0])}
                  alt={property.title}
                  className="w-full h-56 object-cover"
                />
                <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                  {property.rent_or_buy === 'rent' ? (isRTL ? 'إيجار' : 'Rent') : (isRTL ? 'شراء' : 'Buy')}
                </Badge>
              </div>
              
             <CardHeader 
  className="cursor-pointer hover:bg-gray-50 transition-colors" 
  onClick={() => handlePropertyClick(property.id)}
>
  <CardTitle className="text-base hover:text-green-600 transition-colors">
    {property.title}
  </CardTitle>
</CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{property.location_city}, {property.location_governorate}</span>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    {formatPrice(property.price, property.rent_or_buy)}
                  </span>
                </div>
              </CardContent>
              
         <CardFooter className="flex flex-col gap-2 p-4 bg-gray-50">
  {/* Row 1: Action Buttons */}
  <div className="flex w-full gap-2">
    {/* View Details Button */}
    <Button 
      onClick={() => handlePropertyClick(property.id)}
      variant="outline" 
      className="flex-1 bg-white hover:bg-gray-100"
    >
      <Eye className="w-4 h-4 mr-2" />
      {isRTL ? 'عرض التفاصيل' : 'View Details'}
    </Button>
    
    {/* Chat Button */}
    <ChatButton
      userId={property.user_id}
      userName={property.user_name}
      className="flex-1"
    />
  </div>

  {/* Row 2: Phone Number Section */}
  <div className="w-full">
    {showPhoneForProperty === property.id ? (
      <div className="flex gap-2">
        <Button
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => window.location.href = `tel:${property.user_phone}`}
        >
          <Phone className="w-4 h-4 mr-2" />
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
        <Phone className="w-4 h-4 mr-2" />
        {isRTL ? 'إظهار رقم الهاتف' : 'Show Phone Number'}
      </Button>
    )}
  </div>

  {/* Row 3: Comments and Share */}
  <div className="flex w-full gap-2">
    {/* Comments Button */}
    <Button
      onClick={() => setShowCommentsFor(property.id)}
      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {isRTL ? 'تعليقات' : 'Comments'}
      {property.totalComments !== undefined && property.totalComments > 0 && (
        <Badge className="ml-2 bg-white/20 text-white">
          {property.totalComments}
        </Badge>
      )}
    </Button>
    
    {/* Share Button */}
    <SharePropertyButton
      property={property}
      className="flex-1"
      variant="outline"
    />
  </div>
</CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* PropertyComments Modal */}
      <PropertyComments
        propertyId={showCommentsFor}
        isOpen={showCommentsFor !== null}
        onClose={() => setShowCommentsFor(null)}
      />
    </div>
  );
};

export default Marketplace;