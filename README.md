# 3qarat - Real Estate Platform

A comprehensive real estate listing platform built with Laravel backend and React/TypeScript frontend featuring property management, user authentication, and advanced filtering capabilities.

## Screenshots

### Platform Overview
![3qarat Screenshot 1](screenshots/3qarat%201.png)
![3qarat Screenshot 2](screenshots/3qarat%202.png)
![3qarat Screenshot 3](screenshots/3qarat%203.png)

## Features

- 🏠 **Property Listings** - Comprehensive property management system
- 🔍 **Advanced Search & Filters** - Filter by location, price, property type
- 👤 **User Authentication** - Secure login/registration with OAuth support
- 💬 **Real-time Chat** - Direct communication between buyers and sellers
- ⭐ **Favorites System** - Save and manage favorite properties
- 📱 **Mobile Responsive** - Optimized for all devices
- 🌍 **Multi-location Support** - Countries, governorates, and cities
- 🔔 **Notifications** - Real-time updates and alerts
- 📧 **Email Verification** - Secure account verification
- 🎯 **SEO Optimized** - Search engine friendly URLs and metadata

## Tech Stack

### Backend (Laravel)
- **Laravel 11** - Modern PHP framework
- **PHP 8.2+** - Latest PHP features
- **MySQL Database** - Reliable data storage
- **Laravel Sanctum** - API authentication
- **Laravel Socialite** - OAuth integration
- **Real-time Broadcasting** - WebSocket support

### Frontend (React/TypeScript)
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling

## API Features

- RESTful API architecture
- JWT authentication
- Real-time WebSocket connections
- File upload handling
- Rate limiting
- CORS configuration

## Security Features

- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting
- Secure password hashing

## Installation

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ & npm
- MySQL Database

### Backend Setup
```bash
# Install Laravel dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Create storage link
php artisan storage:link

# Start Laravel server
php artisan serve
```

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Configuration

Update your `.env` file with:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Production Deployment

1. Set production environment variables
2. Run `composer install --optimize-autoloader --no-dev`
3. Run `npm run build`
4. Configure web server (Apache/Nginx)
5. Set proper file permissions
6. Enable HTTPS
7. Configure queue workers

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.
