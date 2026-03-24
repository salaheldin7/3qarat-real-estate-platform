import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
<link rel="sitemap" type="application/xml" href="/sitemap.xml" />
interface SEOProps {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  keywords: string;
  keywordsAr: string;
  canonical?: string;
  ogImage?: string;
  structuredData?: object;
}

export const SEO = ({ 
  title, 
  titleAr, 
  description, 
  descriptionAr, 
  keywords, 
  keywordsAr,
  canonical,
  ogImage = 'https://3qaraty.icu/og-image.jpg',
  structuredData
}: SEOProps) => {
  const { isRTL } = useLanguage();

  useEffect(() => {
    // Update title
    const fullTitle = isRTL 
      ? `${titleAr} | عقارتي - 3qaraty` 
      : `${title} | 3qaraty - عقارتي`;
    document.title = fullTitle;

    // Update meta tags
    const metaTags = [
      { name: 'description', content: isRTL ? descriptionAr : description },
      { name: 'keywords', content: isRTL ? keywordsAr : keywords },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: isRTL ? descriptionAr : description },
      { property: 'og:image', content: ogImage },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: isRTL ? descriptionAr : description },
      { name: 'twitter:image', content: ogImage }
    ];

    metaTags.forEach(({ name, property, content }) => {
      const selector = name ? `meta[name="${name}"]` : `meta[property="${property}"]`;
      let element = document.querySelector(selector);
      
      if (!element) {
        element = document.createElement('meta');
        if (name) element.setAttribute('name', name);
        if (property) element.setAttribute('property', property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    });

    // Update canonical link
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);
    }

    // Update html lang and dir
    document.documentElement.lang = isRTL ? 'ar' : 'en';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';

    // Add or update structured data
    if (structuredData) {
      let scriptElement = document.querySelector('script[data-seo-structured-data]');
      
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.setAttribute('data-seo-structured-data', 'true');
        document.head.appendChild(scriptElement);
      }
      
      scriptElement.textContent = JSON.stringify(structuredData);
    }

  }, [title, titleAr, description, descriptionAr, keywords, keywordsAr, canonical, ogImage, structuredData, isRTL]);

  return null;
};
