<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    /* Base Styles */
    body {
        font-family: "Segoe UI", Arial, sans-serif;
        background-color: #f6faf7;
        color: #1a202c;
        margin: 0;
        padding: 0;
    }

    .email-wrapper {
        max-width: 900px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #d1e7dd;
        border-radius: 8px;
        overflow: hidden;
    }

    /* Header */
    .header {
        text-align: center;
        background-color: #2f855a;
        color: #ffffff;
        padding: 30px 20px;
    }

    .header h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 600;
    }

    /* Two-column bilingual layout */
    .bilingual {
        display: flex;
        width: 100%;
        border-top: 2px solid #c6f6d5;
    }

    .lang-section {
        flex: 1;
        padding: 25px 20px;
        box-sizing: border-box;
    }

    .english {
        background-color: #f9faf9;
        border-right: 1px solid #c6f6d5;
    }

    .arabic {
        background-color: #e6f4ea;
        direction: rtl;
        text-align: right;
    }

    /* Text & Content Styles */
    h2 {
        color: #2f855a;
        font-size: 20px;
        margin-top: 0;
        font-weight: 600;
    }

    p {
        font-size: 15px;
        line-height: 1.6;
        color: #374151;
        margin: 8px 0 12px;
    }

    .username {
        display: inline-block;
        padding: 6px 14px;
        background-color: #2f855a;
        color: #ffffff;
        border-radius: 20px;
        font-size: 13px;
        margin: 10px 0;
        font-weight: 500;
    }

    /* Outlined Button */
    .button-container {
        text-align: center;
        margin: 25px 0;
    }

    .button {
        background-color: transparent;
        color: #2f855a;
        border: 2px solid #2f855a;
        padding: 10px 28px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.25s ease-in-out;
        display: inline-block;
    }

    .button:hover {
        background-color: #2f855a;
        color: #ffffff;
    }

    /* Sections */
    .section-title {
        color: #2f855a;
        font-weight: 600;
        margin-top: 20px;
        font-size: 15px;
        border-bottom: 1px solid #c6f6d5;
        padding-bottom: 4px;
    }

    .feature {
        margin: 10px 0;
        padding-left: 10px;
        border-left: 3px solid #2f855a;
    }

    .feature strong {
        color: #2f855a;
        font-weight: 600;
        font-size: 14px;
    }

    .feature-desc {
        font-size: 13px;
        color: #374151;
    }

    .help-text {
        background-color: #edf7f0;
        padding: 12px;
        margin-top: 20px;
        border-left: 3px solid #2f855a;
        font-size: 13px;
        color: #2f855a;
        border-radius: 4px;
    }

    .help-text a {
        color: #2f855a;
        text-decoration: none;
        font-weight: 600;
    }

    /* Footer */
    .footer {
        text-align: center;
        font-size: 13px;
        color: #4a5568;
        padding: 25px 20px;
        background-color: #f1f5f3;
        border-top: 2px solid #2f855a;
    }

    .footer a {
        color: #2f855a;
        text-decoration: none;
        font-weight: 600;
    }

    /* Mobile scaling (not stacking) */
    @media (max-width: 700px) {
        .email-wrapper {
            max-width: 100%;
            border: none;
        }

        .header h1 {
            font-size: 18px;
        }

        .bilingual {
            display: flex;
            flex-direction: row;
            gap: 0;
        }

        .lang-section {
            padding: 15px 10px;
        }

        h2 {
            font-size: 16px;
        }

        p, .feature-desc {
            font-size: 12px;
        }

        .username {
            font-size: 12px;
            padding: 5px 10px;
        }

        .button {
            font-size: 12px;
            padding: 6px 18px;
            border-width: 1.5px;
        }

        .section-title {
            font-size: 13px;
        }

        .feature strong {
            font-size: 13px;
        }

        .help-text {
            font-size: 12px;
            padding: 8px;
        }

        .footer {
            font-size: 11px;
            padding: 15px 10px;
        }
    }
</style>
</head>
<body>
<div class="email-wrapper">
    <!-- Header -->
    <div class="header">
        <h1>Welcome to 3qaraty | مرحباً بك في عقاراتي</h1>
    </div>

    <!-- Bilingual Sections -->
    <div class="bilingual">
        <!-- English -->
        <div class="lang-section english">
            <h2>Hello {{ $name }} 👋</h2>
            <p>Thank you for joining 3qaraty. Your account has been created successfully!</p>
            <p><strong>Username:</strong> <span class="username">{{ $username }}</span></p>

            <div class="button-container">
                <a href="https://3qaraty.icu/login" class="button">Get Started</a>
            </div>

            <div class="section-title">What’s Next</div>
            <div class="feature">
                <strong>🏠 Browse Properties</strong>
                <div class="feature-desc">Explore properties across Egypt with smart filters and sorting options.</div>
            </div>
            <div class="feature">
                <strong>📝 List Your Property</strong>
                <div class="feature-desc">Post your property for sale or rent and reach potential buyers easily.</div>
            </div>
            <div class="feature">
                <strong>💬 Contact Sellers</strong>
                <div class="feature-desc">Chat directly with property owners and get quick replies.</div>
            </div>

            <div class="help-text">
                Need help? Contact us at <a href="mailto:admin@3qaraty.icu">admin@3qaraty.icu</a>
            </div>
        </div>

        <!-- Arabic -->
        <div class="lang-section arabic">
            <h2>مرحباً {{ $name }} 👋</h2>
            <p>شكراً لانضمامك إلى عقاراتي. تم إنشاء حسابك بنجاح!</p>
            <p><strong>اسم المستخدم:</strong> <span class="username">{{ $username }}</span></p>

            <div class="button-container">
                <a href="https://3qaraty.icu/login" class="button">ابدأ الآن</a>
            </div>

            <div class="section-title">الخطوات التالية</div>
            <div class="feature">
                <strong>🏠 تصفح العقارات</strong>
                <div class="feature-desc">استكشف آلاف العقارات في جميع أنحاء مصر بسهولة.</div>
            </div>
            <div class="feature">
                <strong>📝 أدرج عقارك</strong>
                <div class="feature-desc">قم بعرض عقارك للبيع أو الإيجار وتواصل مع المشترين.</div>
            </div>
            <div class="feature">
                <strong>💬 تواصل مع البائعين</strong>
                <div class="feature-desc">تحدث مباشرة مع أصحاب العقارات واحصل على ردود سريعة.</div>
            </div>

            <div class="help-text">
                تحتاج مساعدة؟ تواصل معنا عبر <a href="mailto:admin@3qaraty.icu">admin@3qaraty.icu</a>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>This email was sent to <strong>{{ $email }}</strong></p>
        <p>تم إرسال هذا البريد الإلكتروني إلى <strong>{{ $email }}</strong></p>
        <p>&copy; {{ date('Y') }} 3qaraty. All rights reserved | جميع الحقوق محفوظة</p>
        <p><a href="https://3qaraty.icu">Visit Website | زيارة الموقع</a></p>
    </div>
</div>
</body>
</html>
