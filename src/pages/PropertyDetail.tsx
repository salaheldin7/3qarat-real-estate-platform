import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChatButton } from '@/components/ChatButton';
import { API_URL, API_BASE_URL } from '@/config/api';
import { SEO } from '@/components/SEO';
import { 
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
  ArrowRight,
  Bed,
  Bath,
  Maximize,
  Car,
  TreePine,
  Waves,
  Lock
} from 'lucide-react';

interface Property {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  formatted_price: string;
  category: string;
  rent_or_buy: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  floor_number?: number;
  total_floors?: number;
  built_year?: number;
  furnished?: boolean;
  has_parking?: boolean;
  has_garden?: boolean;
  has_pool?: boolean;
  has_elevator?: boolean;
  images: string[];
  location: string;
  location_governorate: string;
  location_city: string;
  governorate: {
    id: number;
    name: string;
  };
  city: {
    id: number;
    name: string;
  };
  status: string;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string;
    phone?: string;
  };
  user_name: string;
  user_phone: string;
}

const PropertyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useLanguage();
  
  // Helper function to get full image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    return `${API_BASE_URL}${imagePath}`;
  };
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    fetchPropertyDetail();
  }, [id]);

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/properties/${id}`, { headers });
      
      if (!response.ok) {
        throw new Error('Property not found');
      }

      const data = await response.json();
      
      console.log('API Response:', data); // Debug log
      console.log('User data:', data.data?.user); // Debug log
      console.log('User phone from user object:', data.data?.user?.phone); // Debug log
      console.log('User phone from root:', data.data?.user_phone); // Debug log
      
      if (data.success && data.data) {
        const propertyData = {
          ...data.data,
          images: Array.isArray(data.data.images) 
            ? data.data.images 
            : typeof data.data.images === 'string' 
            ? JSON.parse(data.data.images) 
            : [],
          location_governorate: data.data.governorate?.name || data.data.location_governorate || '',
          location_city: data.data.city?.name || data.data.location_city || '',
          user_name: data.data.user?.name || data.data.user_name || 'Unknown',
          // Fix: Try multiple possible locations for phone number
          user_phone: data.data.user?.phone || data.data.phone || data.data.user_phone || ''
        };
        
        console.log('Processed Property Data:', propertyData); // Debug log
        console.log('Final User Phone:', propertyData.user_phone); // Debug log
        
        setProperty(propertyData);
      }
    } catch (err: any) {
      console.error('Error fetching property:', err);
      setError(isRTL ? 'فشل تحميل العقار' : 'Failed to load property');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'villa':
      case 'townhouse':
        return <Home className="w-6 h-6" />;
      case 'apartment':
        return <Building className="w-6 h-6" />;
      case 'commercial':
      case 'building':
        return <Warehouse className="w-6 h-6" />;
      default:
        return <Home className="w-6 h-6" />;
    }
  };

  const formatPrice = (price: number, type: string) => {
    const formatted = new Intl.NumberFormat(isRTL ? 'ar-EG' : 'en-US').format(price);
    return isRTL 
      ? (type === 'rent' ? `${formatted} جنيه/شهر` : `${formatted} جنيه`)
      : (type === 'rent' ? `EGP ${formatted}/mo` : `EGP ${formatted}`);
  };

  const generateSEOKeywords = (prop: Property) => {
    const categoryAr: Record<string, string> = {
      apartment: 'شقة',
      villa: 'فيلا',
      townhouse: 'تاون هاوس',
      land: 'أرض',
      commercial: 'عقار تجاري',
      building: 'مبنى'
    };

    const typeAr = prop.rent_or_buy === 'rent' ? 'للإيجار' : 'للبيع';
    const typeEn = prop.rent_or_buy === 'rent' ? 'for rent' : 'for sale';
    const categoryEnLabel = prop.category || 'property';
    const categoryArLabel = categoryAr[prop.category] || 'عقار';

    const governorate = prop.governorate?.name || prop.location_governorate || '';
    const city = prop.city?.name || prop.location_city || '';

    const keywordsEn = [
      `${categoryEnLabel} ${typeEn}`,
      `${categoryEnLabel} in ${city}`,
      `${categoryEnLabel} ${governorate}`,
      `Egypt ${categoryEnLabel}`,
      `${city} real estate`,
      `property ${typeEn} ${city}`,
      prop.bedrooms ? `${prop.bedrooms} bedroom ${categoryEnLabel}` : '',
      prop.area ? `${prop.area} sqm ${categoryEnLabel}` : '',
      `${categoryEnLabel} ${governorate} Egypt`,
    ].filter(Boolean).join(', ');

    const keywordsAr = [
      `${categoryArLabel} ${typeAr}`,
      `${categoryArLabel} في ${city}`,
      `${categoryArLabel} ${governorate}`,
      `عقارات ${city}`,
      `${typeAr} ${city}`,
      prop.bedrooms ? `${categoryArLabel} ${prop.bedrooms} غرف` : '',
      prop.area ? `${categoryArLabel} ${prop.area} متر` : '',
      `عقارات ${governorate}`,
      `${categoryArLabel} مصر`,
    ].filter(Boolean).join(', ');

    return { keywordsEn, keywordsAr };
  };

  const nextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  const handleShowPhone = () => {
    setShowPhone(true);
  };

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

  if (error || !property) {
    return (
      <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="text-center">
          <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            {isRTL ? 'العقار غير موجود' : 'Property Not Found'}
          </h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => navigate('/marketplace')}>
            {isRTL ? 'العودة إلى السوق' : 'Back to Marketplace'}
          </Button>
        </div>
      </div>
    );
  }

  const { keywordsEn, keywordsAr } = generateSEOKeywords(property);
  const categoryAr: Record<string, string> = {
    apartment: 'شقة',
    villa: 'فيلا',
    townhouse: 'تاون هاوس',
    land: 'أرض',
    commercial: 'عقار تجاري',
    building: 'مبنى'
  };
  const typeAr = property.rent_or_buy === 'rent' ? 'للإيجار' : 'للبيع';
  const typeEn = property.rent_or_buy === 'rent' ? 'for rent' : 'for sale';
  const categoryArLabel = categoryAr[property.category] || 'عقار';
  const governorate = property.governorate?.name || property.location_governorate || '';
  const city = property.city?.name || property.location_city || '';

  const titleEn = `${property.category} ${typeEn} in ${city}, ${governorate} | 3qaraty`;
  const titleAr = `${categoryArLabel} ${typeAr} في ${city}، ${governorate} | عقارتي`;
  
  const descEn = `${property.title} - ${property.category} ${typeEn} in ${city}, ${governorate}. ${property.bedrooms ? `${property.bedrooms} bedrooms, ` : ''}${property.bathrooms ? `${property.bathrooms} bathrooms, ` : ''}${property.area ? `${property.area} sqm. ` : ''}Price: ${property.formatted_price}. Contact seller on 3qaraty.`;
  
  const descAr = `${property.title} - ${categoryArLabel} ${typeAr} في ${city}، ${governorate}. ${property.bedrooms ? `${property.bedrooms} غرف نوم، ` : ''}${property.bathrooms ? `${property.bathrooms} حمام، ` : ''}${property.area ? `${property.area} متر مربع. ` : ''}السعر: ${property.formatted_price}. تواصل مع البائع على عقارتي.`;

  const propertyImage = property.images && property.images.length > 0 ? getImageUrl(property.images[0]) : 'https://3qaraty.icu/og-image.jpg';

  const structuredData = {
    "@context": "https://schema.org",
    "@type": property.rent_or_buy === 'rent' ? "RentAction" : "Product",
    "name": property.title,
    "description": property.description,
    "image": property.images && property.images.length > 0 ? property.images.map(img => getImageUrl(img)) : [propertyImage],
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "EGP",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Person",
        "name": property.user_name || property.user?.name
      }
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": city,
      "addressRegion": governorate,
      "addressCountry": "Egypt"
    },
    ...(property.bedrooms && { "numberOfRooms": property.bedrooms }),
    ...(property.bathrooms && { "numberOfBathroomsTotal": property.bathrooms }),
    ...(property.area && { "floorSize": { "@type": "QuantitativeValue", "value": property.area, "unitCode": "MTK" } })
  };

  return (
    <>
      <SEO 
        title={titleEn}
        titleAr={titleAr}
        description={descEn}
        descriptionAr={descAr}
        keywords={keywordsEn}
        keywordsAr={keywordsAr}
        canonical={`https://3qaraty.icu/property/${property.id}`}
        ogImage={propertyImage}
        structuredData={structuredData}
      />
      
      <div className={`container mx-auto px-4 py-8 mt-20 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className={`mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {isRTL ? 'رجوع' : 'Back'}
        </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-0">
              {property.images && property.images.length > 0 ? (
                <div className="relative">
                  <img
                    src={getImageUrl(property.images[currentImageIndex])}
                    alt={property.title}
                    className="w-full h-96 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  
                  {property.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={prevImage}
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                        onClick={nextImage}
                      >
                        <ArrowRight className="w-6 h-6" />
                      </Button>
                      
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-200 flex items-center justify-center rounded-t-lg">
                  <Home className="w-24 h-24 text-gray-400" />
                </div>
              )}
              
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {property.images.map((image, index) => (
                    <img
                      key={index}
                      src={getImageUrl(image)}
                      alt={`${property.title} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer ${
                        currentImageIndex === index ? 'ring-2 ring-green-600' : 'opacity-60 hover:opacity-100'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <CardTitle className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {getCategoryIcon(property.category)}
                  <span>{property.title}</span>
                </CardTitle>
                <Badge className={property.rent_or_buy === 'rent' ? 'bg-blue-600' : 'bg-green-600'}>
                  {isRTL ? (property.rent_or_buy === 'rent' ? 'إيجار' : 'شراء') : (property.rent_or_buy === 'rent' ? 'Rent' : 'Buy')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-2 text-2xl font-bold text-green-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <DollarSign className="w-8 h-8" />
                <span>{formatPrice(property.price, property.rent_or_buy)}</span>
              </div>

              <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <MapPin className="w-5 h-5 flex-shrink-0" />
                <span>{property.location_city}, {property.location_governorate}</span>
              </div>

              <div className={`flex items-center gap-2 text-gray-600 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Calendar className="w-5 h-5 flex-shrink-0" />
                <span>
                  {isRTL ? 'نُشر في: ' : 'Posted on: '}
                  {new Date(property.created_at).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">
                  {isRTL ? 'الوصف' : 'Description'}
                </h3>
                <p className="text-gray-700 leading-relaxed break-words whitespace-pre-wrap">
                  {property.description}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">
                  {isRTL ? 'المواصفات' : 'Features'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.bedrooms && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Bed className="w-5 h-5 text-green-600" />
                      <span>{property.bedrooms} {isRTL ? 'غرف نوم' : 'Bedrooms'}</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Bath className="w-5 h-5 text-green-600" />
                      <span>{property.bathrooms} {isRTL ? 'حمامات' : 'Bathrooms'}</span>
                    </div>
                  )}
                  {property.area && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Maximize className="w-5 h-5 text-green-600" />
                      <span>{property.area} {isRTL ? 'م²' : 'm²'}</span>
                    </div>
                  )}
                  {property.has_parking && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Car className="w-5 h-5 text-green-600" />
                      <span>{isRTL ? 'موقف سيارات' : 'Parking'}</span>
                    </div>
                  )}
                  {property.has_garden && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <TreePine className="w-5 h-5 text-green-600" />
                      <span>{isRTL ? 'حديقة' : 'Garden'}</span>
                    </div>
                  )}
                  {property.has_pool && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Waves className="w-5 h-5 text-green-600" />
                      <span>{isRTL ? 'مسبح' : 'Pool'}</span>
                    </div>
                  )}
                  {property.has_elevator && (
                    <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Building className="w-5 h-5 text-green-600" />
                      <span>{isRTL ? 'مصعد' : 'Elevator'}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className={isRTL ? 'text-right' : ''}>
                {isRTL ? 'معلومات البائع' : 'Seller Information'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-green-200 transition-colors"
                     onClick={() => navigate(`/profile/${property.user.id}`)}>
                  <User className="w-6 h-6 text-green-600" />
                </div>
                <div className={isRTL ? 'text-right' : ''}>
                  <p className="font-semibold cursor-pointer hover:text-green-600 transition-colors"
                     onClick={() => navigate(`/profile/${property.user.id}`)}>
                    {property.user_name}
                  </p>
                  <p className="text-sm text-gray-500">{isRTL ? 'البائع' : 'Seller'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {/* Call Button */}
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    if (showPhone && property.user_phone) {
                      window.location.href = `tel:${property.user_phone}`;
                    } else {
                      setShowPhone(true);
                    }
                  }}
                >
                  <Phone className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {showPhone 
                    ? (isRTL ? 'اضغط للاتصال' : 'Click to Call')
                    : (isRTL ? 'عرض رقم الهاتف' : 'Show Phone Number')
                  }
                </Button>
                
                {/* Phone Number Display - Below Call Button */}
                {showPhone && (
                  property.user_phone ? (
                    <div 
                      className={`w-full p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300`}
                    >
                      <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-white" />
                          </div>
                          <div className={isRTL ? 'text-right' : ''}>
                            <p className="text-xs text-gray-600 mb-0.5">
                              {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                            </p>
                            <a 
                              href={`tel:${property.user_phone}`}
                              className="text-lg font-bold text-blue-600 hover:text-blue-800 hover:underline"
                              dir="ltr"
                            >
                              {property.user_phone}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPhone(false);
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <span className="text-gray-500 text-lg">✕</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg ${isRTL ? 'text-right' : ''}`}>
                      <p className="text-sm text-gray-600">
                        {isRTL ? 'رقم الهاتف غير متوفر' : 'Phone number not available'}
                      </p>
                    </div>
                  )
                )}
                
                {/* Chat Button */}
                <ChatButton 
                  userId={property.user.id}
                  userName={property.user_name}
                  className="w-full bg-green-600 hover:bg-green-700"
                  variant="default"
                  showName={true}
                />
              </div>

              <div className="pt-4 border-t">
                <div className={`flex items-center justify-between text-sm ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <span className="text-gray-600">{isRTL ? 'المشاهدات:' : 'Views:'}</span>
                  <span className="font-semibold">{property.views_count}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

export default PropertyDetail;