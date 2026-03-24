import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        about: 'About Us',
        contact: 'Contact',
        marketplace: 'Marketplace',
        login: 'Login',
        register: 'Register',
        profile: 'Profile',
        admin: 'Admin',
        logout: 'Logout',
        sellerPanel: 'Seller Panel',
        myAds: 'My Ads',
        addProperty: 'Add Property'
      },
      // Common
      common: {
        loading: 'Loading...',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        price: 'Price',
        location: 'Location',
        date: 'Date',
        status: 'Status',
        approved: 'Approved',
        pending: 'Pending',
        rejected: 'Rejected',
        sold: 'Sold',
        rent: 'Rent',
        buy: 'Buy',
        language: 'Language',
        properties: 'Properties'
      },
      // Home page
      home: {
        title: 'Find Your Dream Property',
        subtitle: 'Discover the perfect home, villa, or commercial space in Egypt',
        searchPlaceholder: 'Search properties...',
        featuredProperties: 'Featured Properties',
        whyChooseUs: 'Why Choose Us',
        trustedPlatform: 'Trusted Platform',
        trustedDesc: 'Verified properties and trusted sellers',
        wideSelection: 'Wide Selection',
        wideSelectionDesc: 'Properties across all Egyptian governorates',
        easyProcess: 'Easy Process',
        easyProcessDesc: 'Simple buying and selling process',
        hero: {
          badge: "Egypt's Premier Real Estate Platform",
          title1: 'Find Your',
          title2: 'Dream Property',
          subtitle: 'Discover exceptional properties across Egypt. From luxury villas to modern apartments, find your perfect home or investment opportunity.',
          browseBtn: 'Browse Properties',
          listBtn: 'List Property',
          scroll: 'Scroll Down'
        },
        categories: {
          badge: 'Property Categories',
          title: 'Explore Properties',
          subtitle: 'Discover the perfect property that matches your lifestyle and investment goals',
          residential: {
            title: 'Residential',
            description: 'Find your dream home with our extensive collection of apartments, villas, and townhouses across Egypt.'
          },
          commercial: {
            title: 'Commercial',
            description: 'Discover prime commercial properties including offices, retail spaces, and business centers.'
          },
          industrial: {
            title: 'Industrial',
            description: 'Explore warehouses, factories, and industrial complexes for your business needs.'
          },
          investment: {
            title: 'Investment',
            description: 'Premium investment opportunities with high returns and strategic locations.'
          },
          viewBtn: 'View Properties'
        },
        about: {
          badge: 'About Us',
          title: 'Your trusted real estate partner in Egypt.',
          paragraph1: "We are Egypt's leading real estate platform, connecting property seekers with their dream homes and investment opportunities. With years of experience in the Egyptian market, we understand the unique needs of our clients.",
          paragraph2: "Our comprehensive database features properties across all 28 governorates, from bustling Cairo to the serene Red Sea coast. Whether you're looking for a family home, commercial space, or investment property, we're here to guide you every step of the way.",
          learnBtn: 'Learn More',
          contact: {
            title: 'Get in touch with us',
            address: 'Downtown Cairo, Tahrir Square, Cairo, Egypt'
          }
        },
        testimonials: {
          badge: 'Testimonials',
          title: 'What Our Clients Say',
          subtitle: 'Real experiences from our valued clients',
          1: {
            quote: 'Best real estate platform',
            content: 'I found my dream apartment through this platform. The process was smooth, and the team was incredibly helpful throughout the entire journey.',
            author: 'Ahmed Hassan',
            location: 'New Cairo, Egypt'
          },
          2: {
            quote: 'Excellent service',
            content: 'The variety of properties and the detailed information provided made it easy to make an informed decision. Highly recommended!',
            author: 'Fatima Al-Zahra',
            location: 'Alexandria, Egypt'
          },
          3: {
            quote: 'Professional and reliable',
            content: 'From browsing to closing the deal, everything was handled professionally. The best real estate experience I\'ve had.',
            author: 'Mohamed Salah',
            location: 'Giza, Egypt'
          }
        }
      },
      // Footer
      footer: {
        description: 'Your trusted partner in finding the perfect property. We provide exceptional real estate services with cutting-edge technology and personalized attention.',
        quickLinks: {
          title: 'Quick Links',
          home: 'Home',
          about: 'About Us',
          marketplace: 'Marketplace',
          myProperties: 'My Properties',
          listProperty: 'List Property',
          contact: 'Contact',
          investment: 'Investment'
        },
        contact: {
          title: 'Contact Info',
          locationLabel: 'Office Location',
          address: 'Downtown Cairo, Tahrir Square',
          city: 'Cairo, Egypt',
          phoneLabel: 'Phone',
          emailLabel: 'Email',
          hoursLabel: 'Working Hours',
          weekdays: 'Sun - Thu: 9AM - 6PM',
          saturday: 'Sat: 10AM - 4PM'
        },
        featured: {
          title: 'Featured Properties',
          viewAll: 'View All Properties'
        },
        properties: {
          villa: 'Luxury villa exterior',
          apartment: 'Modern apartment building',
          house: 'Contemporary house design',
          commercial: 'Commercial property'
        },
        legal: {
          privacy: 'Privacy Policy',
          terms: 'Terms of Service',
          cookies: 'Cookie Policy'
        },
        copyright: 'Copyright © {{year}} 3qaraty. All Rights Reserved'
      },
      // Marketplace
      marketplace: {
        title: 'Property Marketplace',
        sortBy: 'Sort by',
        filterBy: 'Filter by',
        priceRange: 'Price Range',
        propertyType: 'Property Type',
        governorate: 'Governorate',
        city: 'City',
        newAdsFirst: 'New Ads First',
        dateOldToNew: 'Date: Old to New',
        dateNewToOld: 'Date: New to Old',
        priceLowToHigh: 'Price: Low to High',
        priceHighToLow: 'Price: High to Low',
        villa: 'Villa',
        land: 'Land',
        townHouse: 'Town House',
        apartment: 'Apartment',
        building: 'Building',
        commercial: 'Commercial',
        noProperties: 'No properties found',
        contactSeller: 'Contact Seller'
      },
      // Auth
      auth: {
        loginTitle: 'Welcome Back',
        loginSubtitle: 'Sign in to your account',
        registerTitle: 'Create Account',
        registerSubtitle: 'Join our real estate platform',
        email: 'Email',
        username: 'Username',
        phone: 'Phone',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        name: 'Full Name',
        loginButton: 'Sign In',
        registerButton: 'Create Account',
        registerAsSeller: 'Register as Seller',
        loginWith: 'Login with',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        forgotPassword: 'Forgot Password?'
      },
      // Seller Panel
      seller: {
        myAds: 'My Advertisements',
        addNewProperty: 'Add New Property',
        propertyTitle: 'Property Title',
        description: 'Description',
        uploadImages: 'Upload Images',
        selectGovernorate: 'Select Governorate',
        selectCity: 'Select City',
        propertyPrice: 'Property Price',
        rentOrBuy: 'Rent or Buy',
        propertyCategory: 'Property Category',
        submitProperty: 'Submit Property',
        editProperty: 'Edit Property',
        deleteProperty: 'Delete Property',
        propertyStatus: 'Property Status',
        viewDetails: 'View Details'
      },
      // Admin
      admin: {
        dashboard: 'Admin Dashboard',
        userManagement: 'User Management',
        propertyManagement: 'Property Management',
        locationManagement: 'Location Management',
        contactRequests: 'Contact Requests',
        chatManagement: 'Chat Management',
        pendingApprovals: 'Pending Approvals',
        approveProperty: 'Approve Property',
        rejectProperty: 'Reject Property',
        rejectionReason: 'Rejection Reason',
        banUser: 'Ban User',
        unbanUser: 'Unban User',
        resetPassword: 'Reset Password',
        addGovernorate: 'Add Governorate',
        addCity: 'Add City'
      },
      // Contact
      contact: {
        title: 'Contact Us',
        subtitle: 'Get in touch with our team',
        message: 'Message',
        sendMessage: 'Send Message',
        contactInfo: 'Contact Information',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        messageSent: 'Message sent successfully!'
      },
      // About
      about: {
        title: 'About Us',
        subtitle: 'Your trusted real estate partner in Egypt',
        ourMission: 'Our Mission',
        ourVision: 'Our Vision',
        ourValues: 'Our Values'
      }
    }
  },
  ar: {
    translation: {
      // Navigation
      nav: {
        home: 'الرئيسية',
        about: 'من نحن',
        contact: 'اتصل بنا',
        marketplace: 'السوق',
        login: 'تسجيل الدخول',
        register: 'إنشاء حساب',
        profile: 'الملف الشخصي',
        admin: 'الإدارة',
        logout: 'تسجيل الخروج',
        sellerPanel: 'لوحة البائع',
        myAds: 'إعلاناتي',
        addProperty: 'إضافة عقار'
      },
      // Common
      common: {
        loading: 'جاري التحميل...',
        submit: 'إرسال',
        cancel: 'إلغاء',
        save: 'حفظ',
        delete: 'حذف',
        edit: 'تعديل',
        search: 'بحث',
        filter: 'تصفية',
        sort: 'ترتيب',
        price: 'السعر',
        location: 'الموقع',
        date: 'التاريخ',
        status: 'الحالة',
        approved: 'موافق عليه',
        pending: 'في الانتظار',
        rejected: 'مرفوض',
        sold: 'مباع',
        rent: 'إيجار',
        buy: 'شراء',
        language: 'اللغة',
        properties: 'العقارات'
      },
      // Home page
      home: {
        title: 'اعثر على عقار أحلامك',
        subtitle: 'اكتشف المنزل المثالي أو الفيلا أو المساحة التجارية في مصر',
        searchPlaceholder: 'البحث عن العقارات...',
        featuredProperties: 'العقارات المميزة',
        whyChooseUs: 'لماذا تختارنا',
        trustedPlatform: 'منصة موثوقة',
        trustedDesc: 'عقارات محققة وبائعون موثوقون',
        wideSelection: 'تشكيلة واسعة',
        wideSelectionDesc: 'عقارات في جميع محافظات مصر',
        easyProcess: 'عملية سهلة',
        easyProcessDesc: 'عملية بيع وشراء بسيطة',
        hero: {
          badge: 'منصة العقارات الرائدة في مصر',
          title1: 'اعثر على',
          title2: 'عقار أحلامك',
          subtitle: 'اكتشف العقارات الاستثنائية في جميع أنحاء مصر. من الفلل الفاخرة إلى الشقق الحديثة، اعثر على منزلك المثالي أو فرصتك الاستثمارية.',
          browseBtn: 'تصفح العقارات',
          listBtn: 'أدرج عقار',
          scroll: 'مرر للأسفل'
        },
        categories: {
          badge: 'فئات العقارات',
          title: 'استكشف العقارات',
          subtitle: 'اكتشف العقار المثالي الذي يناسب أسلوب حياتك وأهدافك الاستثمارية',
          residential: {
            title: 'سكني',
            description: 'اعثر على منزل أحلامك من خلال مجموعتنا الواسعة من الشقق والفلل والمنازل المدرجة في جميع أنحاء مصر.'
          },
          commercial: {
            title: 'تجاري',
            description: 'اكتشف العقارات التجارية الرائدة بما في ذلك المكاتب والمساحات التجارية ومراكز الأعمال.'
          },
          industrial: {
            title: 'صناعي',
            description: 'استكشف المستودعات والمصانع والمجمعات الصناعية لاحتياجات عملك.'
          },
          investment: {
            title: 'استثماري',
            description: 'فرص استثمارية متميزة بعوائد عالية ومواقع استراتيجية.'
          },
          viewBtn: 'عرض العقارات'
        },
        about: {
          badge: 'من نحن',
          title: 'شريكك الموثوق في العقارات في مصر.',
          paragraph1: 'نحن منصة العقارات الرائدة في مصر، نربط الباحثين عن العقارات بمنازل أحلامهم وفرصهم الاستثمارية. مع سنوات من الخبرة في السوق المصري، نفهم الاحتياجات الفريدة لعملائنا.',
          paragraph2: 'تتميز قاعدة بياناتنا الشاملة بالعقارات في جميع المحافظات الـ28، من القاهرة المزدحمة إلى ساحل البحر الأحمر الهادئ. سواء كنت تبحث عن منزل عائلي أو مساحة تجارية أو عقار استثماري، فنحن هنا لإرشادك في كل خطوة.',
          learnBtn: 'تعرف أكثر',
          contact: {
            title: 'تواصل معنا',
            address: 'وسط القاهرة، ميدان التحرير، القاهرة، مصر'
          }
        },
        testimonials: {
          badge: 'آراء العملاء',
          title: 'ماذا يقول عملاؤنا',
          subtitle: 'تجارب حقيقية من عملائنا المقدرين',
          1: {
            quote: 'أفضل منصة عقارية',
            content: 'وجدت شقة أحلامي من خلال هذه المنصة. كانت العملية سلسة، وكان الفريق مفيدًا بشكل لا يصدق طوال الرحلة بأكملها.',
            author: 'أحمد حسن',
            location: 'القاهرة الجديدة، مصر'
          },
          2: {
            quote: 'خدمة ممتازة',
            content: 'تنوع العقارات والمعلومات التفصيلية المقدمة جعل من السهل اتخاذ قرار مدروس. أنصح بها بشدة!',
            author: 'فاطمة الزهراء',
            location: 'الإسكندرية، مصر'
          },
          3: {
            quote: 'مهنية وموثوقية',
            content: 'من التصفح إلى إنهاء الصفقة، تم التعامل مع كل شيء بمهنية. أفضل تجربة عقارية مررت بها.',
            author: 'محمد صلاح',
            location: 'الجيزة، مصر'
          }
        }
      },
      // Footer
      footer: {
        description: 'شريكك الموثوق في العثور على العقار المثالي. نحن نقدم خدمات عقارية استثنائية بتكنولوجيا متطورة واهتمام شخصي.',
        quickLinks: {
          title: 'روابط سريعة',
          home: 'الرئيسية',
          about: 'من نحن',
          marketplace: 'السوق',
          myProperties: 'عقاراتي',
          listProperty: 'أدرج عقار',
          contact: 'اتصل بنا',
          investment: 'الاستثمار'
        },
        contact: {
          title: 'معلومات الاتصال',
          locationLabel: 'موقع المكتب',
          address: 'وسط القاهرة، ميدان التحرير',
          city: 'القاهرة، مصر',
          phoneLabel: 'الهاتف',
          emailLabel: 'البريد الإلكتروني',
          hoursLabel: 'ساعات العمل',
          weekdays: 'الأحد - الخميس: 9 صباحاً - 6 مساءً',
          saturday: 'السبت: 10 صباحاً - 4 مساءً'
        },
        featured: {
          title: 'العقارات المميزة',
          viewAll: 'عرض جميع العقارات'
        },
        properties: {
          villa: 'فيلا فاخرة من الخارج',
          apartment: 'مبنى شقق حديث',
          house: 'تصميم منزل عصري',
          commercial: 'عقار تجاري'
        },
        legal: {
          privacy: 'سياسة الخصوصية',
          terms: 'شروط الخدمة',
          cookies: 'سياسة ملفات تعريف الارتباط'
        },
        copyright: 'جميع الحقوق محفوظة © {{year}} عقارات مصر'
      },
      // Marketplace
      marketplace: {
        title: 'سوق العقارات',
        sortBy: 'ترتيب حسب',
        filterBy: 'تصفية حسب',
        priceRange: 'نطاق السعر',
        propertyType: 'نوع العقار',
        governorate: 'المحافظة',
        city: 'المدينة',
        newAdsFirst: 'الإعلانات الجديدة أولاً',
        dateOldToNew: 'التاريخ: من القديم للجديد',
        dateNewToOld: 'التاريخ: من الجديد للقديم',
        priceLowToHigh: 'السعر: من الأقل للأعلى',
        priceHighToLow: 'السعر: من الأعلى للأقل',
        villa: 'فيلا',
        land: 'أرض',
        townHouse: 'تاون هاوس',
        apartment: 'شقة',
        building: 'مبنى',
        commercial: 'تجاري',
        noProperties: 'لم يتم العثور على عقارات',
        contactSeller: 'اتصل بالبائع'
      },
      // Auth
      auth: {
        loginTitle: 'مرحباً بعودتك',
        loginSubtitle: 'سجل دخولك إلى حسابك',
        registerTitle: 'إنشاء حساب',
        registerSubtitle: 'انضم إلى منصة العقارات الخاصة بنا',
        email: 'البريد الإلكتروني',
        username: 'اسم المستخدم',
        phone: 'رقم الهاتف',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        name: 'الاسم الكامل',
        loginButton: 'تسجيل الدخول',
        registerButton: 'إنشاء حساب',
        registerAsSeller: 'التسجيل كبائع',
        loginWith: 'تسجيل الدخول باستخدام',
        dontHaveAccount: 'ليس لديك حساب؟',
        alreadyHaveAccount: 'لديك حساب بالفعل؟',
        forgotPassword: 'نسيت كلمة المرور؟'
      },
      // Seller Panel
      seller: {
        myAds: 'إعلاناتي',
        addNewProperty: 'إضافة عقار جديد',
        propertyTitle: 'عنوان العقار',
        description: 'الوصف',
        uploadImages: 'رفع الصور',
        selectGovernorate: 'اختر المحافظة',
        selectCity: 'اختر المدينة',
        propertyPrice: 'سعر العقار',
        rentOrBuy: 'إيجار أو شراء',
        propertyCategory: 'فئة العقار',
        submitProperty: 'إرسال العقار',
        editProperty: 'تعديل العقار',
        deleteProperty: 'حذف العقار',
        propertyStatus: 'حالة العقار',
        viewDetails: 'عرض التفاصيل'
      },
      // Admin
      admin: {
        dashboard: 'لوحة الإدارة',
        userManagement: 'إدارة المستخدمين',
        propertyManagement: 'إدارة العقارات',
        locationManagement: 'إدارة المواقع',
        contactRequests: 'طلبات الاتصال',
        chatManagement: 'إدارة المحادثات',
        pendingApprovals: 'الموافقات المعلقة',
        approveProperty: 'الموافقة على العقار',
        rejectProperty: 'رفض العقار',
        rejectionReason: 'سبب الرفض',
        banUser: 'حظر المستخدم',
        unbanUser: 'إلغاء حظر المستخدم',
        resetPassword: 'إعادة تعيين كلمة المرور',
        addGovernorate: 'إضافة محافظة',
        addCity: 'إضافة مدينة'
      },
      // Contact
      contact: {
        title: 'اتصل بنا',
        subtitle: 'تواصل مع فريقنا',
        message: 'الرسالة',
        sendMessage: 'إرسال الرسالة',
        contactInfo: 'معلومات الاتصال',
        address: 'العنوان',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        messageSent: 'تم إرسال الرسالة بنجاح!'
      },
      // About
      about: {
        title: 'من نحن',
        subtitle: 'شريكك الموثوق في العقارات في مصر',
        ourMission: 'مهمتنا',
        ourVision: 'رؤيتنا',
        ourValues: 'قيمنا'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;