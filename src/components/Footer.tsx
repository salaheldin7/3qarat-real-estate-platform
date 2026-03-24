import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Building2, MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/contexts/LanguageContext";

const Footer = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const currentYear = new Date().getFullYear();

  const propertyImages = [
    {
      src: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop&crop=center",
      alt: t('footer.properties.villa')
    },
    {
      src: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=200&h=200&fit=crop&crop=center", 
      alt: t('footer.properties.apartment')
    },
    {
      src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200&h=200&fit=crop&crop=center",
      alt: t('footer.properties.house')
    },
    {
      src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop&crop=center",
      alt: t('footer.properties.commercial')
    }
  ];

  return (
    <footer
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden mt-auto w-full"
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className={`absolute top-10 ${isRTL ? 'left-4' : 'right-4'} w-20 h-20 border border-green-400 rounded-full`}></div>
        <div className={`absolute top-32 ${isRTL ? 'right-4' : 'left-4'} w-12 h-12 bg-green-400/10 rounded-full`}></div>
        <div className={`absolute bottom-20 ${isRTL ? 'left-8' : 'right-8'} w-16 h-16 border border-emerald-500 rounded-full`}></div>
        <div className={`absolute bottom-40 ${isRTL ? 'right-8' : 'left-8'} w-8 h-8 bg-emerald-500/10 rounded-full`}></div>
      </div>
      
      <div className="container mx-auto px-6 py-16 relative z-10 max-w-7xl w-full">
        <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12 w-full ${isRTL ? 'text-right' : 'text-left'}`}>
          
          {/* Logo & Description */}
          <div className={`space-y-6 w-full ${isRTL ? 'lg:order-1' : 'lg:order-1'}`}>
            <Link 
              to="/" 
              className={`group flex items-center hover:scale-105 transition-transform duration-300 ${
                isRTL ? 'flex-row-reverse justify-start' : 'justify-start'
              }`}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className={`text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent ${
                isRTL ? 'mr-3 font-arabic' : 'ml-3'
              }`}>
                {isRTL ? 'عقاراتي' : '3qaraty'}
              </span>
            </Link>
            
            <p className={`text-gray-300 leading-relaxed ${
              isRTL ? 'text-right font-arabic text-base leading-7' : 'text-left'
            }`}>
              {t('footer.description')}
            </p>
            
            <div className={`flex ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'} gap-4`}>
              <div className="group w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 border border-green-500/30 hover:border-green-400">
                <Facebook className="w-4 h-4 text-green-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="group w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 border border-green-500/30 hover:border-green-400">
                <Twitter className="w-4 h-4 text-green-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="group w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 border border-green-500/30 hover:border-green-400">
                <Instagram className="w-4 h-4 text-green-400 group-hover:text-white transition-colors duration-300" />
              </div>
              <div className="group w-10 h-10 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-full flex items-center justify-center cursor-pointer hover:bg-gradient-to-br hover:from-green-500 hover:to-emerald-600 transition-all duration-300 hover:scale-110 border border-green-500/30 hover:border-green-400">
                <Linkedin className="w-4 h-4 text-green-400 group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className={`space-y-6 w-full ${isRTL ? 'lg:order-3' : 'lg:order-2'}`}>
            <h3 className={`text-xl font-bold text-white relative ${
              isRTL ? 'text-right font-arabic' : 'text-left'
            }`}>
              {t('footer.quickLinks.title')}
              <div className={`absolute -bottom-2 ${isRTL ? 'right-0' : 'left-0'} w-12 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500`}></div>
            </h3>
            <div className="space-y-3">
              {[
                { path: '/', key: 'home' },
                { path: '/about', key: 'about' },
                { path: '/marketplace', key: 'marketplace' },
                { path: '/contact', key: 'contact' }
              ].map(({ path, key }) => (
                <Link 
                  key={key}
                  to={path} 
                  className={`group block text-gray-300 hover:text-white transition-all duration-300 ${
                    isRTL 
                      ? 'text-right hover:translate-x-2 font-arabic' 
                      : 'text-left hover:translate-x-2'
                  }`}
                >
                  <span className="relative">
                    {t(`footer.quickLinks.${key}`)}
                    <div className={`absolute -bottom-1 ${isRTL ? 'right-0' : 'left-0'} w-0 h-0.5 bg-green-400 group-hover:w-full transition-all duration-300`}></div>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className={`space-y-6 w-full ${isRTL ? 'lg:order-2' : 'lg:order-3'}`}>
            <h3 className={`text-xl font-bold text-white relative ${
              isRTL ? 'text-right font-arabic' : 'text-left'
            }`}>
              {t('footer.contact.title')}
              <div className={`absolute -bottom-2 ${isRTL ? 'right-0' : 'left-0'} w-12 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500`}></div>
            </h3>
            <div className="space-y-4">
              <div className={`group flex items-start gap-3 ${
                isRTL ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-4 h-4 text-green-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className={`text-gray-400 text-sm mb-1 ${
                    isRTL ? 'font-arabic' : ''
                  }`}>
                    {t('footer.contact.locationLabel')}
                  </p>
                  <p className={`text-gray-300 group-hover:text-white transition-colors duration-300 ${
                    isRTL ? 'font-arabic leading-6' : ''
                  }`}>
                    Cairo
                  </p>
                </div>
              </div>
              
              <div className={`group flex items-start gap-3 ${
                isRTL ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Mail className="w-4 h-4 text-green-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className={`text-gray-400 text-sm mb-1 ${
                    isRTL ? 'font-arabic' : ''
                  }`}>
                    {t('footer.contact.emailLabel')}
                  </p>
                  <p className="text-gray-300 group-hover:text-white transition-colors duration-300 font-mono">
                    admin@3qaraty.icu
                  </p>
                </div>
              </div>
              
              <div className={`group flex items-start gap-3 ${
                isRTL ? 'flex-row-reverse' : 'flex-row'
              }`}>
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="w-4 h-4 text-green-400" />
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className={`text-gray-400 text-sm mb-1 ${
                    isRTL ? 'font-arabic' : ''
                  }`}>
                    {t('footer.contact.hoursLabel')}
                  </p>
                  <p className={`text-gray-300 group-hover:text-white transition-colors duration-300 ${
                    isRTL ? 'font-arabic leading-6' : ''
                  }`}>
                    {t('footer.contact.weekdays')}<br />
                    {t('footer.contact.saturday')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Properties */}
          <div className={`space-y-6 w-full ${isRTL ? 'lg:order-4' : 'lg:order-4'}`}>
            <h3 className={`text-xl font-bold text-white relative ${
              isRTL ? 'text-right font-arabic' : 'text-left'
            }`}>
              {t('footer.featured.title')}
              <div className={`absolute -bottom-2 ${isRTL ? 'right-0' : 'left-0'} w-12 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500`}></div>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {propertyImages.map((image, index) => (
                <div key={index} className="group aspect-square rounded-xl overflow-hidden relative cursor-pointer transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-xl">
                  <img 
                    src={image.src} 
                    alt={image.alt} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Building2 className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-green-400/50 rounded-xl transition-colors duration-300"></div>
                </div>
              ))}
            </div>
            <Link 
              to="/marketplace" 
              className={`inline-flex items-center text-green-400 hover:text-green-300 text-sm font-medium group ${
                isRTL ? 'flex-row-reverse font-arabic' : 'flex-row'
              }`}
            >
              <span>{t('footer.featured.viewAll')}</span>
              <span className={`transition-transform group-hover:${
                isRTL ? '-translate-x-1' : 'translate-x-1'
              } ${isRTL ? 'mr-1' : 'ml-1'}`}>
                {isRTL ? '←' : '→'}
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700/50 mt-16 pt-8 w-full">
          <div className={`flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 w-full ${
            isRTL ? 'md:flex-row-reverse text-right' : 'text-left'
          }`}>
            <p className={`text-gray-400 text-sm ${
              isRTL ? 'text-right font-arabic order-2 md:order-1' : 'text-left order-1 md:order-1'
            }`}>
              {t('footer.copyright', { year: currentYear })}
            </p>
            <div className={`flex text-sm gap-6 ${
              isRTL ? 'flex-row-reverse order-1 md:order-2' : 'flex-row order-2 md:order-2'
            }`}>
              <Link 
                to="/privacy" 
                className={`text-gray-400 hover:text-white transition-colors duration-300 ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.legal.privacy')}
              </Link>
              <Link 
                to="/terms" 
                className={`text-gray-400 hover:text-white transition-colors duration-300 ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.legal.terms')}
              </Link>
              <Link 
                to="/cookies" 
                className={`text-gray-400 hover:text-white transition-colors duration-300 ${
                  isRTL ? 'font-arabic' : ''
                }`}
              >
                {t('footer.legal.cookies')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for Arabic font support */}
      <style>{`
        .font-arabic {
          font-family: 'Noto Sans Arabic', 'Cairo', 'Amiri', 'Tajawal', system-ui, -apple-system, sans-serif;
          font-weight: 400;
        }
        
        .direction-rtl {
          direction: rtl;
          unicode-bidi: embed;
        }
        
        .text-wrap-rtl {
          word-wrap: break-word;
          overflow-wrap: break-word;
          hyphens: auto;
          text-align: right;
          white-space: pre-wrap;
        }
        
        [dir="rtl"] .font-arabic {
          font-feature-settings: 'liga' 1, 'kern' 1;
          text-rendering: optimizeLegibility;
          direction: rtl;
        }
        
        /* Ensure proper spacing for Arabic text */
        [dir="rtl"] p.font-arabic,
        [dir="rtl"] .font-arabic {
          line-height: 1.7;
          word-spacing: 0.1em;
          direction: rtl;
          text-align: right;
        }
        
        /* Force RTL text direction for Arabic content */
        [dir="rtl"] .direction-rtl {
          direction: rtl !important;
          unicode-bidi: bidi-override;
          text-align: right;
        }
        
        /* Better text wrapping for Arabic */
        [dir="rtl"] .text-wrap-rtl {
          word-break: keep-all;
          overflow-wrap: anywhere;
          hyphens: manual;
          text-align-last: right;
        }
        
        /* Better hover effects for RTL */
        [dir="rtl"] .group:hover .hover\\:translate-x-2 {
          transform: translateX(-0.5rem);
        }
        
        /* Ensure consistent RTL behavior */
        [dir="rtl"] * {
          direction: rtl;
        }
        
        [dir="rtl"] p, [dir="rtl"] span, [dir="rtl"] div {
          text-align: right;
        }
      `}</style>
    </footer>
  );
};

export default Footer;