import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Star, Quote, MapPin, Phone, Mail, ArrowRight, Home, Building, Warehouse, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";
import { SEO } from "@/components/SEO";

const Index = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();

  const propertyCategories = [
    { 
      icon: <Home className="w-6 h-6 sm:w-8 sm:h-8" />, 
      title: t('home.categories.residential.title', 'Residential'),
      description: t('home.categories.residential.description', 'Find your dream home with our extensive collection of apartments, villas, and townhouses across Egypt.'),
      image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&crop=center",
      gradient: "from-blue-400/20 to-blue-600/20",
      iconBg: "from-blue-400 to-blue-600",
      count: "2,500+"
    },
    { 
      icon: <Building className="w-6 h-6 sm:w-8 sm:h-8" />, 
      title: t('home.categories.commercial.title', 'Commercial'),
      description: t('home.categories.commercial.description', 'Discover prime commercial properties including offices, retail spaces, and business centers.'),
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop&crop=center",
      gradient: "from-green-400/20 to-green-600/20",
      iconBg: "from-green-400 to-green-600",
      count: "800+"
    },
    { 
      icon: <Warehouse className="w-6 h-6 sm:w-8 sm:h-8" />, 
      title: t('home.categories.industrial.title', 'Industrial'),
      description: t('home.categories.industrial.description', 'Explore warehouses, factories, and industrial complexes for your business needs.'),
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop&crop=center",
      gradient: "from-orange-400/20 to-orange-600/20",
      iconBg: "from-orange-400 to-orange-600",
      count: "300+"
    },
    { 
      icon: <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />, 
      title: t('home.categories.investment.title', 'Investment'),
      description: t('home.categories.investment.description', 'Premium investment opportunities with high returns and strategic locations.'),
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center",
      gradient: "from-purple-400/20 to-purple-600/20",
      iconBg: "from-purple-400 to-purple-600",
      count: "150+"
    }
  ];

  const testimonials = [
    {
      quote: t('home.testimonials.1.quote', 'Best real estate platform'),
      content: t('home.testimonials.1.content', 'I found my dream apartment through this platform. The process was smooth, and the team was incredibly helpful throughout the entire journey.'),
      author: t('home.testimonials.1.author', 'Ahmed Hassan'),
      location: t('home.testimonials.1.location', 'New Cairo, Egypt'),
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: t('home.testimonials.2.quote', 'Excellent service'),
      content: t('home.testimonials.2.content', 'The variety of properties and the detailed information provided made it easy to make an informed decision. Highly recommended!'),
      author: t('home.testimonials.2.author', 'Fatima Al-Zahra'),
      location: t('home.testimonials.2.location', 'Alexandria, Egypt'),
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      quote: t('home.testimonials.3.quote', 'Professional and reliable'),
      content: t('home.testimonials.3.content', 'From browsing to closing the deal, everything was handled professionally. The best real estate experience I\'ve had.'),
      author: t('home.testimonials.3.author', 'Mohamed Salah'),
      location: t('home.testimonials.3.location', 'Giza, Egypt'),
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <>
      <SEO 
        title="Buy, Rent & Sell Properties in Egypt"
        titleAr="شقق وفلل للبيع والإيجار في مصر"
        description="Find your dream property in Egypt! Browse apartments, villas, townhouses, land & commercial properties for sale and rent in Cairo, Alexandria, North Coast & all Egypt."
        descriptionAr="ابحث عن عقارك المثالي في مصر! شقق، فلل، تاون هاوس، أراضي وعقارات تجارية للبيع والإيجار في القاهرة والإسكندرية والساحل الشمالي وجميع أنحاء مصر"
        keywords="Egypt real estate, properties for sale Egypt, apartments Cairo, villas Alexandria, property rent Egypt, real estate marketplace, Egyptian properties, Cairo apartments, North Coast properties, investment properties Egypt"
        keywordsAr="عقارات مصر, شقق للبيع في مصر, فلل للبيع, عقارات للإيجار, شقق القاهرة, فلل الإسكندرية, عقارات الساحل الشمالي, أراضي للبيع, عقارات تجارية, عقارات استثمارية, شقق مفروشة, تاون هاوس"
        canonical="https://3qaraty.icu/"
      />
      <div className="overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
        <style>{`
        .text-responsive-hero {
          font-size: clamp(2.5rem, 8vw, 4rem);
          line-height: 1.1;
          word-break: break-word;
          hyphens: auto;
        }
        
        .text-responsive-large {
          font-size: clamp(1.25rem, 3vw, 1.5rem);
          line-height: 1.6;
          word-break: break-word;
          hyphens: auto;
        }
        
        .text-responsive-title {
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1.2;
          word-break: break-word;
          hyphens: auto;
        }
        
        [dir="rtl"] .text-responsive-hero,
        [dir="rtl"] .text-responsive-large,
        [dir="rtl"] .text-responsive-title {
          direction: rtl;
          text-align: right;
          word-break: keep-all;
          overflow-wrap: break-word;
        }
        
        .btn-responsive {
          padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);
          font-size: clamp(0.875rem, 2.5vw, 1rem);
        }
        
        .card-title-responsive {
          font-size: clamp(1rem, 2.5vw, 1.25rem);
          line-height: 1.3;
          word-break: break-word;
          hyphens: auto;
        }
        
        .card-description-responsive {
          font-size: clamp(0.8rem, 2vw, 0.875rem);
          line-height: 1.5;
          word-break: break-word;
          hyphens: auto;
        }
        
        [dir="rtl"] .card-title-responsive,
        [dir="rtl"] .card-description-responsive {
          direction: rtl;
          text-align: right;
          word-break: keep-all;
          overflow-wrap: break-word;
        }
        
        .contact-card-responsive {
          max-width: min(90vw, 18rem);
        }
        
        @media (max-width: 640px) {
          .hero-buttons {
            flex-direction: column;
            width: 100%;
          }
          
          .hero-buttons > * {
            width: 100%;
            max-width: 20rem;
          }
        }
      `}</style>

      {/* Ultra-Modern Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background with Parallax Effect */}
        <div className="absolute inset-0">
          {/* Real Estate Hero Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-[2000ms] ease-out hover:scale-105"
            style={{ 
              backgroundImage: `url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=1080&fit=crop&crop=center)`,
              backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Animated overlay patterns */}
          <div className="absolute inset-0 opacity-10 hidden sm:block">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-1/2 right-1/3 w-3 h-3 bg-blue-500 rounded-full animate-bounce delay-700"></div>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-6xl mx-auto px-4 sm:px-6">
          <div className="space-y-6 sm:space-y-8">
            {/* Premium Badge */}
            <div className={`inline-flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl text-xs sm:text-sm`}>
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 fill-current flex-shrink-0" />
              <span className="font-semibold tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
                {t('home.hero.badge', "Egypt's Premier Real Estate Platform")}
              </span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse flex-shrink-0"></div>
            </div>
            
            <h1 className={`text-responsive-hero font-bold leading-tight ${isRTL ? 'font-arabic' : ''}`}>
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent block">
                {t('home.hero.title1', 'Find Your')}
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600 bg-clip-text text-transparent animate-pulse block">
                {t('home.hero.title2', 'Dream Property')}
              </span>
            </h1>
            
            <p className={`text-responsive-large opacity-90 max-w-4xl mx-auto leading-relaxed font-light px-4 ${isRTL ? 'font-arabic' : ''}`}>
              {t('home.hero.subtitle', 'Discover exceptional properties across Egypt. From luxury villas to modern apartments, find your perfect home or investment opportunity.')}
            </p>
            
            <div className={`hero-buttons flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-all duration-700"></div>
                <Button size="lg" className="relative bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-bold btn-responsive rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-700 border border-white/20 w-full sm:w-auto" asChild>
                  <Link to="/marketplace" aria-label={isRTL ? "تصفح جميع العقارات المتاحة للبيع والإيجار في مصر" : "Browse all available properties for sale and rent in Egypt"}>
                    <span className={`flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3`}>
                      <span className="whitespace-nowrap">{t('home.hero.browseBtn', 'Browse Properties')}</span>
                      <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform duration-500 ${isRTL ? 'rotate-180' : ''} flex-shrink-0`} />
                    </span>
                  </Link>
                </Button>
              </div>
              
              <div className="relative group w-full sm:w-auto">
                <div className="absolute -inset-1 bg-gradient-to-r from-white/30 to-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                <Button variant="outline" size="lg" className="relative btn-responsive rounded-2xl border-2 border-white/80 text-white bg-white/10 hover:bg-white/20 hover:border-white backdrop-blur-md transition-all duration-700 hover:scale-105 font-semibold shadow-xl w-full sm:w-auto" asChild>
                  <Link to="/seller-panel" aria-label={isRTL ? "أضف عقارك للبيع أو الإيجار على منصة 3قراتي" : "List your property for sale or rent on 3qaraty platform"}>
                    <span className={`flex items-center justify-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3`}>
                      <span className="whitespace-nowrap">{t('home.hero.listBtn', 'List Property')}</span>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce flex-shrink-0"></div>
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 hidden sm:block">
          <div className="flex flex-col items-center space-y-2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </div>
            <span className="text-white/60 text-xs font-medium">
              {t('home.hero.scroll', 'Scroll Down')}
            </span>
          </div>
        </div>
      </section>

      {/* Enhanced Browse Properties Section */}
      <section className="py-12 sm:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-cyan-500/5"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium mb-6 text-sm">
              <span>{t('home.categories.badge', 'Property Categories')}</span>
            </div>
            <h2 className={`text-responsive-title font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent px-4 ${isRTL ? 'font-arabic' : ''}`}>
              {t('home.categories.title', 'Explore Properties')}
            </h2>
            <p className={`text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 ${isRTL ? 'font-arabic' : ''}`}>
              {t('home.categories.subtitle', 'Discover the perfect property that matches your lifestyle and investment goals')}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {propertyCategories.map((category, index) => (
              <div key={index} className="group">
                <Card className={`relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-2 bg-gradient-to-br ${category.gradient} backdrop-blur-sm h-full`}>
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-700">
                    <img 
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/70"></div>
                  
                  <CardContent className="relative z-10 text-center p-6 sm:p-8 space-y-4 sm:space-y-6 flex flex-col h-full">
                    <div className="relative flex-shrink-0">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-gradient-to-br ${category.iconBg} flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-700 transform group-hover:scale-110 group-hover:rotate-3 text-white`}>
                        {category.icon}
                      </div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/20 to-cyan-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    </div>
                    
                    <div className="space-y-2 flex-shrink-0">
                      <h3 className={`card-title-responsive font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-500 ${isRTL ? 'font-arabic' : ''}`}>
                        {category.title}
                      </h3>
                      <div className="text-xs sm:text-sm font-semibold text-blue-600">
                        {category.count} {t('common.properties', 'Properties')}
                      </div>
                    </div>
                    
                    <p className={`card-description-responsive text-gray-600 leading-relaxed flex-grow ${isRTL ? 'font-arabic text-right' : ''}`}>
                      {category.description}
                    </p>
                    
                    <Button variant="link" className="text-blue-600 hover:text-cyan-600 font-bold group-hover:scale-110 transition-all duration-500 flex-shrink-0 p-0" asChild>
                      <Link to="/marketplace" aria-label={isRTL ? "عرض جميع العقارات في السوق" : "View all properties in the marketplace"}>
                        <span className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2`}>
                          <span className="text-sm">{t('home.categories.viewBtn', 'View Properties')}</span>
                          <ArrowRight className={`w-3 h-3 sm:w-4 sm:h-4 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform duration-500 ${isRTL ? 'rotate-180' : ''}`} />
                        </span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced About Section */}
      <section className="py-12 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-white"></div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16 items-center ${isRTL ? 'lg:grid-flow-col-dense' : ''}`}>
            <div className={`space-y-6 sm:space-y-8 ${isRTL ? 'lg:col-start-2 lg:pl-8 lg:pr-0' : 'lg:pr-8'}`}>
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-medium text-sm">
                  <span>{t('home.about.badge', 'About Us')}</span>
                </div>
                <h2 className={`text-responsive-title font-bold leading-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent ${isRTL ? 'font-arabic text-right' : ''}`}>
                  {t('home.about.title', 'Your trusted real estate partner in Egypt.')}
                </h2>
              </div>
              
              <div className={`space-y-4 sm:space-y-6 text-base sm:text-lg text-gray-600 leading-relaxed ${isRTL ? 'font-arabic text-right' : ''}`}>
                <p>
                  {t('home.about.paragraph1', "We are Egypt's leading real estate platform, connecting property seekers with their dream homes and investment opportunities. With years of experience in the Egyptian market, we understand the unique needs of our clients.")}
                </p>
                <p>
                  {t('home.about.paragraph2', "Our comprehensive database features properties across all 28 governorates, from bustling Cairo to the serene Red Sea coast. Whether you're looking for a family home, commercial space, or investment property, we're here to guide you every step of the way.")}
                </p>
              </div>
              
              <div className="relative group inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <Button variant="outline" size="lg" className="relative border-2 border-blue-500/30 hover:border-blue-500 text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-600 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold transition-all duration-700 transform hover:scale-105" asChild>
                  <Link to="/about" aria-label={isRTL ? "اعرف المزيد عن 3قراتي وخدماتنا" : "Learn more about 3qaraty and our real estate services"}>
                    <span className={`flex items-center ${isRTL ? 'space-x-reverse' : ''} space-x-2 sm:space-x-3`}>
                      <span>{t('home.about.learnBtn', isRTL ? 'اعرف المزيد عن خدماتنا' : 'Learn More About Our Services')}</span>
                      <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 group-hover:${isRTL ? '-translate-x-1' : 'translate-x-1'} transition-transform duration-500 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className={`relative ${isRTL ? 'lg:col-start-1 lg:pr-8 lg:pl-0' : 'lg:pl-8'}`}>
              <div className="relative">
                {/* Main Image */}
                <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group">
                  <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center" 
                    alt="Modern real estate" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                </div>
                
                {/* Enhanced Contact Card Overlay */}
                <Card className={`contact-card-responsive absolute -bottom-4 sm:-bottom-6 ${isRTL ? '-right-4 sm:-right-6' : '-left-4 sm:-left-6'} bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm`}>
                  <CardContent className="space-y-3 sm:space-y-4 p-0">
                    <h3 className={`text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent ${isRTL ? 'font-arabic text-right' : ''}`}>
                      {t('home.about.contact.title', 'Get in touch with us')}
                    </h3>
                    <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                      <div className={`flex items-center ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-3`}>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        </div>
                        <span className="text-white/90 font-mono text-xs sm:text-sm break-all">admin@3qaraty.icu</span>
                      </div>
                      <div className={`flex items-start ${isRTL ? 'space-x-reverse flex-row-reverse' : ''} space-x-3`}>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        </div>
                        <span className={`text-white/90 ${isRTL ? 'font-arabic text-right' : ''}`}>
                          Cairo, Egypt
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials section removed as requested */}
      </div>
    </>
  );
};

export default Index;