import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Home, Users, Award, Shield, TrendingUp, Building, Globe, Languages } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { SEO } from "@/components/SEO";

const About = () => {
  const { t, i18n } = useTranslation();
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const isRTL = currentLang === 'ar';

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLang(newLang);
    
    // Update document direction
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('lang', newLang);
  };

  return (
    <>
      <SEO 
        title="About Us - Leading Egyptian Real Estate Platform"
        titleAr="من نحن - منصة العقارات المصرية الرائدة"
        description="Learn about 3qaraty, Egypt's premier real estate marketplace. We connect property buyers, sellers, and renters across Egypt with a trusted, modern platform for all real estate needs."
        descriptionAr="تعرف على عقارتي، سوق العقارات المصري الرائد. نربط مشتري العقارات والبائعين والمستأجرين في جميع أنحاء مصر بمنصة حديثة وموثوقة لجميع احتياجات العقارات"
        keywords="about 3qaraty, Egyptian real estate company, property platform Egypt, real estate services Egypt, trusted property marketplace, who we are"
        keywordsAr="عن عقارتي, شركة عقارات مصرية, منصة عقارات مصر, خدمات عقارية مصر, سوق عقارات موثوق, من نحن"
        canonical="https://3qaraty.icu/about"
      />
      <div className={`${isRTL ? 'rtl' : 'ltr'} font-sans`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Language Toggle Button */}
        <div className="fixed top-4 right-4 z-50">
     
      </div>

      {/* Hero Section */}
      <section className="py-32 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-300/20 to-blue-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center space-x-3 px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-semibold mb-12 shadow-lg transform hover:scale-105 transition-all duration-300">
              <Award className="w-5 h-5" />
              <span className={isRTL ? 'font-arabic' : ''}>{t('about.subtitle')}</span>
            </div>
            
            <h1 className={`text-6xl md:text-8xl font-bold mb-12 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent leading-tight ${isRTL ? 'font-arabic' : ''}`}>
              {t('about.title')}
            </h1>
            
            <p className={`text-2xl md:text-3xl text-gray-700 leading-relaxed max-w-4xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
              {isRTL 
                ? 'منصة العقارات الرائدة في مصر التي تربط الأحلام بالواقع. نحن متخصصون في العثور على العقارات المثالية في جميع المحافظات الـ28، من الفلل الفاخرة إلى الاستثمارات التجارية.'
                : "Egypt's premier real estate platform connecting dreams with reality. We specialize in finding the perfect properties across all 28 governorates, from luxury villas to commercial investments."
              }
            </p>
          </div>
        </div>
      </section>

      {/* Main Story Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-20 items-center ${isRTL ? 'lg:grid-cols-2' : ''}`}>
            <div className={`relative ${isRTL ? 'lg:order-2' : ''}`}>
              {/* Main Image with enhanced effects */}
              <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl group relative">
                <img 
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop&crop=center" 
                  alt={isRTL ? 'تطوير عقاري حديث في مصر' : 'Modern real estate development in Egypt'} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                
                {/* Floating elements */}
                <div className="absolute top-6 left-6 w-4 h-4 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="absolute top-12 right-8 w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-500"></div>
                <div className="absolute bottom-8 left-12 w-5 h-5 bg-cyan-400 rounded-full animate-bounce delay-1000"></div>
              </div>
              
              {/* Enhanced Contact Card */}
              <Card className={`absolute -bottom-12 ${isRTL ? '-right-12' : '-left-12'} bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8 max-w-sm rounded-2xl shadow-2xl border border-white/20 backdrop-blur-lg transform hover:scale-105 transition-all duration-500`}>
                <CardContent className="space-y-6">
                  <h3 className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent ${isRTL ? 'font-arabic text-right' : ''}`}>
                    {isRTL ? 'تواصل معنا' : 'Get in touch with us'}
                  </h3>
                  <div className="space-y-4">
                    <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className="text-white/90">admin@3qaraty.icu</span>
                    </div>
                    <div className={`flex items-start space-x-4 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                        <MapPin className="w-6 h-6 text-blue-400" />
                      </div>
                      <span className={`text-white/90 ${isRTL ? 'text-right font-arabic' : ''}`}>
                        {isRTL 
                          ? 'القاهرة، مصر'
                          : 'Cairo, Egypt'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className={`space-y-10 ${isRTL ? 'lg:order-1 text-right' : 'lg:pl-8'}`}>
              <div className="space-y-8">
                <h2 className={`text-6xl md:text-7xl font-bold leading-tight bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'نساعدك في العثور على عقار أحلامك في مصر.'
                    : 'We help you find your dream property in Egypt.'
                  }
                </h2>
                
                <div className={`space-y-8 text-lg text-gray-700 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                  <p>
                    {isRTL 
                      ? 'بدأت رحلتنا برؤية لثورة في سوق العقارات المصري من خلال إنشاء منصة شفافة وفعالة وسهلة الاستخدام تربط الباحثين عن العقارات بمنازلهم واستثماراتهم المثالية. مع فهم عميق للسوق المصري، نحن نجسر الفجوة بين ممارسات العقارات التقليدية والتكنولوجيا الحديثة.'
                      : 'Our journey began with a vision to revolutionize Egypt\'s real estate market by creating a transparent, efficient, and user-friendly platform that connects property seekers with their ideal homes and investments. Rooted in deep understanding of the Egyptian market, we bridge the gap between traditional real estate practices and modern technology.'
                    }
                  </p>
                  <p>
                    {isRTL 
                      ? 'في عقارات مصر، نؤمن أن العثور على العقار المثالي يجب أن يكون رحلة مثيرة، وليس محنة مرهقة. فريقنا المتفاني من محترفي العقارات وخبراء التكنولوجيا ومتخصصي خدمة العملاء يعمل بلا كلل لضمان أن كل تفاعل يكون سلساً ومفيداً وينتج عنه معاملات عقارية ناجحة.'
                      : 'At Real Estate Egypt, we believe that finding the perfect property should be an exciting journey, not a stressful ordeal. Our dedicated team of real estate professionals, technology experts, and customer service specialists work tirelessly to ensure every interaction is seamless, informative, and results in successful property transactions.'
                    }
                  </p>
                  <p>
                    {isRTL 
                      ? 'من شوارع القاهرة المزدحمة إلى شواطئ البحر الأحمر الهادئة، نغطي جميع المحافظات الـ28 بقوائم شاملة ومعلومات مفصلة عن العقارات وإرشادات خبيرة لمساعدتك في اتخاذ قرارات مدروسة حول استثماراتك العقارية ومشترياتك المنزلية.'
                      : 'From the bustling streets of Cairo to the serene beaches of the Red Sea, we cover all 28 governorates with comprehensive listings, detailed property information, and expert guidance to help you make informed decisions about your real estate investments and home purchases.'
                    }
                  </p>
                </div>
              </div>
              
              <div className="relative group inline-block">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/30 to-purple-600/30 rounded-3xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className={`relative border-2 border-blue-500/40 hover:border-blue-500 text-blue-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 px-10 py-6 rounded-2xl font-bold transition-all duration-500 transform hover:scale-110 shadow-lg hover:shadow-xl ${isRTL ? 'font-arabic' : ''}`} 
                  asChild
                >
                  <Link to="/marketplace" aria-label={isRTL ? "استكشف جميع العقارات المتاحة - شقق وفلل وأراضي للبيع والإيجار" : "Explore all available properties - apartments, villas, and land for sale and rent"}>
                    {isRTL ? 'استكشف العقارات' : 'Explore Properties'}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="relative max-w-6xl mx-auto">
            <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl relative group">
              <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=675&fit=crop&crop=center" 
                alt={isRTL ? 'تطوير عقاري مصري حديث' : 'Modern Egyptian real estate development'} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"></div>
              
              <div className="absolute bottom-0 left-0 right-0 p-16">
                <div className={`text-center text-white max-w-4xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
                  <h3 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    {isRTL 
                      ? 'استمتع بمستقبل العقارات في مصر'
                      : 'Experience the future of real estate in Egypt'
                    }
                  </h3>
                  <p className="text-xl opacity-95">
                    {isRTL 
                      ? 'اكتشف العقارات المبتكرة والفرص الاستثمارية في أكثر مواقع مصر المرغوبة'
                      : 'Discover innovative properties and investment opportunities across Egypt\'s most desirable locations'
                    }
                  </p>
                </div>
              </div>
              
              {/* Enhanced decorative elements */}
              <div className="absolute top-8 left-8 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
              <div className="absolute top-16 right-20 w-3 h-3 bg-white/70 rounded-full animate-bounce delay-300"></div>
              <div className="absolute bottom-20 right-8 w-5 h-5 bg-cyan-500 rounded-full animate-pulse delay-700"></div>
              <div className="absolute top-32 left-1/4 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-1000"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-20 ${isRTL ? 'font-arabic' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              {isRTL ? 'لماذا تختارنا' : 'Why Choose Us'}
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {isRTL 
                ? 'نحن نقدم خدمات عقارية شاملة بشفافية وخبرة وتفان في نجاحك'
                : 'We provide comprehensive real estate services with transparency, expertise, and dedication to your success'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
            {/* Feature 1 */}
            <Card className="group text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 bg-white/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                    <Home className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <h3 className={`text-2xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'جميع المحافظات الـ28' : 'All 28 Governorates'}
                </h3>
                
                <p className={`text-gray-600 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'تغطية شاملة في جميع أنحاء مصر من الإسكندرية إلى أسوان، مما يضمن لك العثور على عقارات في كل زاوية من البلاد.'
                    : 'Complete coverage across Egypt from Alexandria to Aswan, ensuring you find properties in every corner of the country.'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="group text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 bg-white/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                    <Users className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <h3 className={`text-2xl font-bold text-gray-800 group-hover:text-green-700 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'إرشاد خبير' : 'Expert Guidance'}
                </h3>
                
                <p className={`text-gray-600 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'استشاريون عقاريون محترفون بمعرفة عميقة بالسوق لإرشادك خلال كل خطوة من رحلتك العقارية.'
                    : 'Professional real estate consultants with deep market knowledge to guide you through every step of your property journey.'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="group text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 bg-white/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-orange-400/30 to-red-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <h3 className={`text-2xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'عقارات محققة' : 'Verified Properties'}
                </h3>
                
                <p className={`text-gray-600 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'جميع القوائم يتم التحقق منها والموافقة عليها بدقة من قبل فريقنا لضمان الأصالة ودقة المعلومات.'
                    : 'All listings are thoroughly verified and approved by our team to ensure authenticity and accurate information.'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="group text-center p-10 border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 hover:-translate-y-4 bg-white/90 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 space-y-8">
                <div className="relative">
                  <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                    <TrendingUp className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -inset-3 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <h3 className={`text-2xl font-bold text-gray-800 group-hover:text-purple-700 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'تركيز استثماري' : 'Investment Focus'}
                </h3>
                
                <p className={`text-gray-600 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'خدمات استشارية استثمارية متخصصة لمساعدتك في تحديد العقارات عالية الإمكانات مع آفاق عائد استثمار قوي.'
                    : 'Specialized investment advisory services to help you identify high-potential properties with strong ROI prospects.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Statistics Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-700 to-blue-800"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-300"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className={`text-center mb-20 ${isRTL ? 'font-arabic' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 text-white">
              {isRTL ? 'تأثيرنا بالأرقام' : 'Our Impact in Numbers'}
            </h2>
            <p className="text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {isRTL 
                ? 'موثوق من قبل آلاف الباحثين عن العقارات والمستثمرين في جميع أنحاء مصر'
                : 'Trusted by thousands of property seekers and investors across Egypt'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-5xl mx-auto">
            <div className={`text-center group ${isRTL ? 'font-arabic' : ''}`}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300">3,750+</div>
              <div className="text-blue-200 text-lg">{isRTL ? 'عقار مدرج' : 'Properties Listed'}</div>
            </div>
            <div className={`text-center group ${isRTL ? 'font-arabic' : ''}`}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300">28</div>
              <div className="text-blue-200 text-lg">{isRTL ? 'محافظة مغطاة' : 'Governorates Covered'}</div>
            </div>
            <div className={`text-center group ${isRTL ? 'font-arabic' : ''}`}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300">1,200+</div>
              <div className="text-blue-200 text-lg">{isRTL ? 'عميل سعيد' : 'Happy Clients'}</div>
            </div>
            <div className={`text-center group ${isRTL ? 'font-arabic' : ''}`}>
              <div className="text-5xl md:text-6xl font-bold text-white mb-4 group-hover:scale-110 transition-transform duration-300">5+</div>
              <div className="text-blue-200 text-lg">{isRTL ? 'سنوات خبرة' : 'Years Experience'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-32 bg-gradient-to-br from-white via-gray-50 to-blue-50/30">
        <div className="container mx-auto px-6">
          <div className={`text-center mb-20 ${isRTL ? 'font-arabic' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              {isRTL ? 'مهمتنا ورؤيتنا' : 'Our Mission & Vision'}
            </h2>
            <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {isRTL 
                ? 'نحن ملتزمون بتقديم أفضل الخدمات العقارية في مصر'
                : 'We are committed to delivering the finest real estate services in Egypt'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
            {/* Mission Card */}
            <Card className="group p-12 bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 space-y-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                  <Award className="w-10 h-10 text-white" />
                </div>
                <h3 className={`text-3xl font-bold text-center text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'مهمتنا' : 'Our Mission'}
                </h3>
                <p className={`text-lg text-gray-700 leading-relaxed text-center ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'نهدف إلى تحويل تجربة العقارات في مصر من خلال توفير منصة شفافة وموثوقة تربط الباحثين عن العقارات بفرصهم المثالية. نحن نسعى لجعل عملية البحث عن العقارات وشرائها تجربة سهلة وممتعة لكل عميل.'
                    : 'We aim to transform the real estate experience in Egypt by providing a transparent and trustworthy platform that connects property seekers with their ideal opportunities. We strive to make property searching and purchasing an easy and enjoyable experience for every client.'
                  }
                </p>
              </CardContent>
            </Card>

            {/* Vision Card */}
            <Card className="group p-12 bg-gradient-to-br from-purple-50 to-pink-100 border-0 shadow-xl hover:shadow-2xl transition-all duration-700 transform hover:scale-105 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative z-10 space-y-8">
                <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3">
                  <Building className="w-10 h-10 text-white" />
                </div>
                <h3 className={`text-3xl font-bold text-center text-gray-800 ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL ? 'رؤيتنا' : 'Our Vision'}
                </h3>
                <p className={`text-lg text-gray-700 leading-relaxed text-center ${isRTL ? 'font-arabic' : ''}`}>
                  {isRTL 
                    ? 'نتطلع لأن نكون المنصة العقارية الرقم واحد في مصر والشرق الأوسط، معروفة بالابتكار والجودة والخدمة الاستثنائية. نحن نهدف إلى إنشاء مستقبل حيث يجد كل شخص منزله المثالي بسهولة وثقة.'
                    : 'We aspire to be the number one real estate platform in Egypt and the Middle East, known for innovation, quality, and exceptional service. We aim to create a future where everyone finds their perfect home with ease and confidence.'
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Values Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className={`text-center mb-20 ${isRTL ? 'font-arabic' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {isRTL ? 'قيمنا الأساسية' : 'Our Core Values'}
            </h2>
            <p className="text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {isRTL 
                ? 'القيم التي توجه كل ما نقوم به في خدمة عملائنا'
                : 'The values that guide everything we do in serving our clients'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
            {/* Value 1: Transparency */}
            <div className="group text-center p-8">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                  <Shield className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-cyan-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className={`text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'الشفافية' : 'Transparency'}
              </h3>
              <p className={`text-gray-300 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL 
                  ? 'نؤمن بالشفافية الكاملة في جميع معاملاتنا، مما يضمن أن عملاؤنا لديهم كامل المعرفة لاتخاذ قرارات مدروسة.'
                  : 'We believe in complete transparency in all our transactions, ensuring our clients have full knowledge to make informed decisions.'
                }
              </p>
            </div>

            {/* Value 2: Excellence */}
            <div className="group text-center p-8">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                  <Award className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-purple-400/30 to-pink-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className={`text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'التميز' : 'Excellence'}
              </h3>
              <p className={`text-gray-300 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL 
                  ? 'نسعى للتميز في كل جانب من جوانب خدمتنا، من جودة العقارات إلى تجربة العملاء الاستثنائية.'
                  : 'We strive for excellence in every aspect of our service, from property quality to exceptional customer experience.'
                }
              </p>
            </div>

            {/* Value 3: Innovation */}
            <div className="group text-center p-8">
              <div className="relative mb-8">
                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-6">
                  <TrendingUp className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-green-400/30 to-emerald-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <h3 className={`text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300 ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL ? 'الابتكار' : 'Innovation'}
              </h3>
              <p className={`text-gray-300 leading-relaxed ${isRTL ? 'font-arabic' : ''}`}>
                {isRTL 
                  ? 'نحن نتبنى التكنولوجيا والابتكار لتحسين تجربة العقارات وجعلها أكثر كفاءة وسهولة لعملائنا.'
                  : 'We embrace technology and innovation to improve the real estate experience and make it more efficient and accessible for our clients.'
                }
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-6">
          <div className={`text-center max-w-4xl mx-auto ${isRTL ? 'font-arabic' : ''}`}>
            <h2 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              {isRTL ? 'ابدأ رحلتك العقارية اليوم' : 'Start Your Real Estate Journey Today'}
            </h2>
            <p className="text-2xl text-gray-600 mb-12 leading-relaxed">
              {isRTL 
                ? 'انضم إلى آلاف العملاء الراضين واعثر على عقار أحلامك معنا'
                : 'Join thousands of satisfied clients and find your dream property with us'
              }
            </p>
            
            <div className={`flex flex-col sm:flex-row gap-6 justify-center items-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 rounded-2xl font-bold transition-all duration-500 transform hover:scale-110 shadow-lg hover:shadow-xl"
                asChild
              >
                <Link to="/marketplace" aria-label={isRTL ? "تصفح سوق العقارات وشاهد الشقق والفلل المتاحة" : "Browse property marketplace and view available apartments and villas"}>
                  {isRTL ? 'تصفح العقارات' : 'Browse Properties'}
                </Link>
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-gray-300 hover:border-blue-500 text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 px-12 py-6 rounded-2xl font-bold transition-all duration-500 transform hover:scale-110"
                asChild
              >
                <Link to="/contact" aria-label={isRTL ? "تواصل معنا للاستفسارات والدعم العقاري" : "Contact us for inquiries and real estate support"}>
                  {isRTL ? 'اتصل بنا' : 'Contact Us'}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .font-arabic {
          font-family: 'Noto Sans Arabic', 'Cairo', 'Amiri', serif;
        }
        
        .rtl {
          direction: rtl;
        }
        
        .ltr {
          direction: ltr;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Noto+Sans+Arabic:wght@400;600;700&display=swap');
      `}</style>
      </div>
    </>
  );
};

export default About;