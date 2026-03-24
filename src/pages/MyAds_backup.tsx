import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Filter, MapPin, Calendar, DollarSign, Home, Building, Warehouse, Plus, Settings } from 'lucide-react';

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

interface MarketplaceProps {
  isAdmin?: boolean;
}

const Marketplace: React.FC<MarketplaceProps> = ({ isAdmin = false }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  
  // State management
  const [properties, setProperties] = useState<Property[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date_new_old');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterGovernorate, setFilterGovernorate] = useState('all');
  const [filterCity, setFilterCity] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  
  // Admin states
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [newGovernorate, setNewGovernorate] = useState({ name_en: '', name_ar: '' });
  const [newCity, setNewCity] = useState({ name_en: '', name_ar: '', governorate_id: '' });
  const [isAddingGovernorate, setIsAddingGovernorate] = useState(true);

  // Mock data for demonstration
  const mockGovernorates: Governorate[] = [
    {
      id: '1',
      name_en: 'Cairo',
      name_ar: 'القاهرة',
      cities: [
        { id: '1-1', name_en: 'New Cairo', name_ar: 'القاهرة الجديدة', governorate_id: '1' },
        { id: '1-2', name_en: 'Nasr City', name_ar: 'مدينة نصر', governorate_id: '1' },
        { id: '1-3', name_en: 'Maadi', name_ar: 'المعادي', governorate_id: '1' },
        { id: '1-4', name_en: 'Heliopolis', name_ar: 'مصر الجديدة', governorate_id: '1' }
      ]
    },
    {
      id: '2',
      name_en: 'Alexandria',
      name_ar: 'الإسكندرية',
      cities: [
        { id: '2-1', name_en: 'Sidi Gaber', name_ar: 'سيدي جابر', governorate_id: '2' },
        { id: '2-2', name_en: 'Montazah', name_ar: 'المنتزه', governorate_id: '2' },
        { id: '2-3', name_en: 'Miami', name_ar: 'ميامي', governorate_id: '2' },
        { id: '2-4', name_en: 'Stanley', name_ar: 'ستانلي', governorate_id: '2' }
      ]
    },
    {
      id: '3',
      name_en: 'Giza',
      name_ar: 'الجيزة',
      cities: [
        { id: '3-1', name_en: '6th October', name_ar: '6 أكتوبر', governorate_id: '3' },
        { id: '3-2', name_en: 'Sheikh Zayed', name_ar: 'الشيخ زايد', governorate_id: '3' },
        { id: '3-3', name_en: 'Dokki', name_ar: 'الدقي', governorate_id: '3' },
        { id: '3-4', name_en: 'Mohandessin', name_ar: 'المهندسين', governorate_id: '3' }
      ]
    }
  ];

  const mockProperties: Property[] = [
    {
      id: '1',
      title: isRTL ? 'فيلا فاخرة في القاهرة الجديدة' : 'Luxury Villa in New Cairo',
      description: isRTL ? 'فيلا جميلة بـ 4 غرف نوم مع حديقة ومسبح' : 'Beautiful 4-bedroom villa with garden and pool',
      price: 5000000,
      location_governorate: isRTL ? 'القاهرة' : 'Cairo',
      location_city: isRTL ? 'القاهرة الجديدة' : 'New Cairo',
      category: 'villa',
      rent_or_buy: 'buy',
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'],
      created_at: '2024-01-15',
      user_name: 'Ahmed Hassan'
    },
    {
      id: '2',
      title: isRTL ? 'شقة حديثة في الإسكندرية' : 'Modern Apartment in Alexandria',
      description: isRTL ? 'شقة واسعة بـ 3 غرف نوم بالقرب من البحر' : 'Spacious 3-bedroom apartment near the sea',
      price: 15000,
      location_governorate: isRTL ? 'الإسكندرية' : 'Alexandria',
      location_city: isRTL ? 'سيدي جابر' : 'Sidi Gaber',
      category: 'apartment',
      rent_or_buy: 'rent',
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop'],
      created_at: '2024-01-20',
      user_name: 'Sara Mohamed'
    },
    {
      id: '3',
      title: isRTL ? 'أرض للاستثمار في الجيزة' : 'Investment Land in Giza',
      description: isRTL ? 'قطعة أرض ممتازة للاستثمار في موقع متميز' : 'Excellent land plot for investment in prime location',
      price: 2500000,
      location_governorate: isRTL ? 'الجيزة' : 'Giza',
      location_city: isRTL ? '6 أكتوبر' : '6th October',
      category: 'land',
      rent_or_buy: 'buy',
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop'],
      created_at: '2024-01-18',
      user_name: 'Mohamed Ali'
    },
    {
      id: '4',
      title: isRTL ? 'تاون هاوس في الشيخ زايد' : 'Townhouse in Sheikh Zayed',
      description: isRTL ? 'تاون هاوس بـ 3 غرف نوم في كمبوند راقي' : '3-bedroom townhouse in premium compound',
      price: 25000,
      location_governorate: isRTL ? 'الجيزة' : 'Giza',
      location_city: isRTL ? 'الشيخ زايد' : 'Sheikh Zayed',
      category: 'townhouse',
      rent_or_buy: 'rent',
      status: 'approved',
      images: ['https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400&h=300&fit=crop'],
      created_at: '2024-01-22',
      user_name: 'Fatma Ahmed'
    }
  ];

  // API functions
  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Replace with actual API call
      // const response = await fetch('/api/properties');
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProperties(mockProperties);
    } catch (err) {
      setError(isRTL ? 'خطأ في تحميل العقارات' : 'Error loading properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGovernorates = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/governorates');
      // const data = await response.json();
      
      setGovernorates(mockGovernorates);
      
      // Flatten cities for easier filtering
      const allCities = mockGovernorates.flatMap(gov => gov.cities);
      setCities(allCities);
    } catch (err) {
      console.error('Error fetching governorates:', err);
    }
  };

  const addGovernorate = async (governorate: { name_en: string; name_ar: string }) => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/governorates', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(governorate)
      // });
      
      const newGov: Governorate = {
        id: Date.now().toString(),
        ...governorate,
        cities: []
      };
      
      setGovernorates(prev => [...prev, newGov]);
      setNewGovernorate({ name_en: '', name_ar: '' });
    } catch (err) {
      console.error('Error adding governorate:', err);
    }
  };

  const addCity = async (city: { name_en: string; name_ar: string; governorate_id: string }) => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/cities', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(city)
      // });
      
      const newCityObj: City = {
        id: Date.now().toString(),
        ...city
      };
      
      setGovernorates(prev => prev.map(gov => 
        gov.id === city.governorate_id 
          ? { ...gov, cities: [...gov.cities, newCityObj] }
          : gov
      ));
      
      setCities(prev => [...prev, newCityObj]);
      setNewCity({ name_en: '', name_ar: '', governorate_id: '' });
    } catch (err) {
      console.error('Error adding city:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchGovernorates();
  }, []);

  // Reset city filter when governorate changes
  useEffect(() => {
    if (filterGovernorate !== 'all') {
      setFilterCity('all');
    }
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

  // Get available cities based on selected governorate
  const getAvailableCities = () => {
    if (filterGovernorate === 'all') return cities;
    
    const selectedGov = governorates.find(gov => 
      (isRTL ? gov.name_ar : gov.name_en) === filterGovernorate
    );
    
    return selectedGov ? selectedGov.cities : [];
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || property.category === filterCategory;
    const matchesGovernorate = filterGovernorate === 'all' || property.location_governorate === filterGovernorate;
    const matchesCity = filterCity === 'all' || property.location_city === filterCity;
    const matchesType = filterType === 'all' || property.rent_or_buy === filterType;
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];

    return matchesSearch && matchesCategory && matchesGovernorate && matchesCity && matchesType && matchesPrice;
  });

  // Sort filtered properties
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
        <div className={`flex items-center justify-center gap-4 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h1 className="text-4xl font-bold text-gray-900">
            {isRTL ? 'السوق العقاري' : 'Marketplace'}
          </h1>
          
          {/* Admin Controls */}
          {isAdmin && (
            <Dialog open={showLocationModal} onOpenChange={setShowLocationModal}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {isRTL ? 'إدارة المواقع' : 'Manage Locations'}
                </Button>
              </DialogTrigger>
              
              <DialogContent className={`max-w-md ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                <DialogHeader>
                  <DialogTitle className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Plus className="w-5 h-5" />
                    {isRTL ? 'إضافة موقع جديد' : 'Add New Location'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  {/* Toggle between governorate and city */}
                  <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <Button
                      variant={isAddingGovernorate ? 'default' : 'outline'}
                      onClick={() => setIsAddingGovernorate(true)}
                      size="sm"
                    >
                      {isRTL ? 'محافظة' : 'Governorate'}
                    </Button>
                    <Button
                      variant={!isAddingGovernorate ? 'default' : 'outline'}
                      onClick={() => setIsAddingGovernorate(false)}
                      size="sm"
                    >
                      {isRTL ? 'مدينة' : 'City'}
                    </Button>
                  </div>
                  
                  {isAddingGovernorate ? (
                    /* Add Governorate Form */
                    <div className="space-y-3">
                      <Input
                        placeholder={isRTL ? 'الاسم بالعربية' : 'Name in Arabic'}
                        value={newGovernorate.name_ar}
                        onChange={(e) => setNewGovernorate(prev => ({ ...prev, name_ar: e.target.value }))}
                        className={isRTL ? 'text-right' : ''}
                      />
                      <Input
                        placeholder={isRTL ? 'الاسم بالإنجليزية' : 'Name in English'}
                        value={newGovernorate.name_en}
                        onChange={(e) => setNewGovernorate(prev => ({ ...prev, name_en: e.target.value }))}
                        className={isRTL ? 'text-right' : ''}
                      />
                      <Button
                        onClick={() => addGovernorate(newGovernorate)}
                        disabled={!newGovernorate.name_ar || !newGovernorate.name_en}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isRTL ? 'إضافة محافظة' : 'Add Governorate'}
                      </Button>
                    </div>
                  ) : (
                    /* Add City Form */
                    <div className="space-y-3">
                      <Select 
                        value={newCity.governorate_id} 
                        onValueChange={(value) => setNewCity(prev => ({ ...prev, governorate_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isRTL ? 'اختر المحافظة' : 'Select Governorate'} />
                        </SelectTrigger>
                        <SelectContent>
                          {governorates.map((gov) => (
                            <SelectItem key={gov.id} value={gov.id}>
                              {isRTL ? gov.name_ar : gov.name_en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={isRTL ? 'اسم المدينة بالعربية' : 'City Name in Arabic'}
                        value={newCity.name_ar}
                        onChange={(e) => setNewCity(prev => ({ ...prev, name_ar: e.target.value }))}
                        className={isRTL ? 'text-right' : ''}
                      />
                      <Input
                        placeholder={isRTL ? 'اسم المدينة بالإنجليزية' : 'City Name in English'}
                        value={newCity.name_en}
                        onChange={(e) => setNewCity(prev => ({ ...prev, name_en: e.target.value }))}
                        className={isRTL ? 'text-right' : ''}
                      />
                      <Button
                        onClick={() => addCity(newCity)}
                        disabled={!newCity.name_ar || !newCity.name_en || !newCity.governorate_id}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {isRTL ? 'إضافة مدينة' : 'Add City'}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mb-6">
          <Search className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'} h-4 w-4 text-gray-400`} />
          <Input
            type="text"
            placeholder={isRTL ? 'ابحث عن العقارات...' : 'Search properties...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${isRTL ? 'pr-10 text-right' : 'pl-10'} w-full`}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Filter className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold">{isRTL ? 'فلترة حسب' : 'Filter By'}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          {/* Sort By */}
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

          {/* Property Type */}
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

          {/* Rent or Buy */}
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

          {/* Governorate */}
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
                  <SelectItem key={gov.id} value={isRTL ? gov.name_ar : gov.name_en}>
                    {isRTL ? gov.name_ar : gov.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City */}
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
                  <SelectItem key={city.id} value={isRTL ? city.name_ar : city.name_en}>
                    {isRTL ? city.name_ar : city.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            {isRTL ? 'نطاق السعر' : 'Price Range'}
          </label>
          <div className="px-4">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000000}
              min={0}
              step={50000}
              className="w-full"
            />
            <div className={`flex justify-between text-sm text-gray-600 mt-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <span>{new Intl.NumberFormat('en-US').format(priceRange[0])} {isRTL ? 'جنيه' : 'EGP'}</span>
              <span>{new Intl.NumberFormat('en-US').format(priceRange[1])} {isRTL ? 'جنيه' : 'EGP'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
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
          sortedProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative">
                <img
                  src={property.images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop'}
                  alt={property.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop';
                  }}
                />
                <Badge 
                  className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} ${
                    property.rent_or_buy === 'rent' ? 'bg-blue-600' : 'bg-green-600'
                  }`}
                >
                  {isRTL ? (property.rent_or_buy === 'rent' ? 'إيجار' : 'شراء') : (property.rent_or_buy === 'rent' ? 'Rent' : 'Buy')}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {getCategoryIcon(property.category)}
                  <span className="truncate" title={property.title}>{property.title}</span>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                  {property.description}
                </p>
                
                <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">
                    {property.location_city}, {property.location_governorate}
                  </span>
                </div>
                
                <div className={`flex items-center gap-2 text-sm text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>{new Date(property.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</span>
                </div>
                
                <div className={`flex items-center gap-2 text-lg font-bold text-green-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <DollarSign className="w-5 h-5 flex-shrink-0" />
                  <span>{formatPrice(property.price, property.rent_or_buy)}</span>
                </div>

                <div className={`flex items-center gap-2 text-sm text-gray-400 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span>{isRTL ? 'بواسطة:' : 'By:'}</span>
                  <span className="font-medium">{property.user_name}</span>
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors duration-200">
                  {isRTL ? 'اتصل بالبائع' : 'Contact Seller'}
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>

      {/* Results Summary */}
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

      {/* Pagination (if needed for large datasets) */}
      {sortedProperties.length > 12 && (
        <div className="mt-8 flex justify-center">
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Button variant="outline" size="sm">
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
            <Button variant="outline" size="sm" className="bg-green-600 text-white">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              {isRTL ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;