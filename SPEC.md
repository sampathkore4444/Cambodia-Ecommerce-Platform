# Cambodia E-Commerce Platform Specification

## Platform Name: **KhmerMarket** (ខ្មែរម៉ាකេត)

---

## 1. Overview

KhmerMarket is a comprehensive e-commerce platform tailored for the Cambodian market. It supports both B2C (business-to-consumer) and C2C (consumer-to-consumer) models, enabling local merchants, small businesses, and individuals to sell products and services to Cambodian consumers. The platform is designed with Cambodia's unique market conditions including Khmer language support, Riel (KHR) and US Dollar (USD) dual currency, local payment gateways, and province-based logistics.

---

## 2. Target Market

### 2.1 Geography
- **Primary**: Phnom Penh, Siem Reap, Battambang, Sihanoukville, Kampong Cham
- **Secondary**: All 25 provinces of Cambodia
- **Future**: ASEAN expansion (Laos, Myanmar, Thailand)

### 2.2 User Demographics
- Age: 16-55 years
- Internet penetration: Mobile-first (85%+ mobile internet usage)
- Languages: Khmer (primary), English (secondary)
- Currency: USD (primary), KHR (secondary)

### 2.3 Internet & Device Context
- Average connection speed: 10-20 Mbps (4G dominant)
- Device distribution: 90% mobile, 10% desktop
- Social media penetration: Facebook (95%), TikTok (70%), Telegram (80%)

---

## 3. Core Features

### 3.1 User Management
- **Registration/Login**: Phone number (SMS OTP), email, Facebook, Google
- **Phone format**: +855 XX XXX XXXX (Cambodian numbers)
- **Roles**: Buyer, Seller, Admin, Super Admin
- **Profiles**: Avatar, display name, province, phone, verified badge
- **KYC**: National ID upload for sellers (verified seller badge)

### 3.2 Product Management
- **Listings**: Title (Khmer/English), description, multiple images (up to 10), price, stock, variants (size, color, etc.)
- **Categories**: Hierarchical categories (4 levels deep)
- **Condition**: New, Like New, Used-Good, Used-Fair
- **Shipping**: Weight-based, seller pickup, free shipping flag
- **Digital products**: E-books, software keys, digital services
- **Bulk upload**: CSV/Excel import for sellers

### 3.3 Category Structure (Cambodia-specific)
```
Fashion & Accessories
  ├── Traditional Khmer Clothing (សំពត់ខ្មែរ)
  ├── Modern Fashion
  ├── Shoes & Sandals
  ├── Bags & Wallets
  └── Jewelry & Accessories

Electronics & Phones
  ├── Smartphones
  ├── Tablets & Laptops
  ├── Accessories & Parts
  ├── Gaming
  └── Cameras

Food & Beverages
  ├── Khmer Food & Ingredients
  ├── Beverages
  ├── Snacks
  ├── Organic & Healthy
  └── Packaged Food

Home & Living
  ├── Furniture
  ├── Home Decor (រោងចក្រ)
  ├── Kitchen & Dining
  ├── Bedding & Bath
  └── Garden & Outdoor

Beauty & Health
  ├── Skincare
  ├── Makeup
  ├── Hair Care
  ├── Traditional Medicine (ថ្នាំបុរាណ)
  └── Wellness

Agriculture & Livestock
  ├── Rice & Grains
  ├── Fruits & Vegetables
  ├── Farm Equipment
  ├── Seeds & Fertilizer
  └── Livestock & Poultry

Automotive
  ├── Cars & Trucks
  ├── Motorbikes & Tuk-Tuks
  ├── Parts & Accessories
  └── Services

Services
  ├── Digital Services
  ├── Home Services
  ├── Education & Tutoring
  └── Event & Wedding

Handicrafts & Art
  ├── Silk Products
  ├── Carvings & Sculptures
  ├── Paintings
  └── Silver & Gold Work
```

### 3.4 Search & Discovery
- **Full-text search**: Khmer and English with transliteration support
- **Filters**: Category, price range (USD/KHR), condition, location, seller rating
- **Sort**: Price (low/high), newest, most popular, rating
- **AI Recommendations**: "Frequently bought together", "You may also like"
- **Trending**: Trending products by province, nationwide
- **Flash Sales**: Time-limited deals section

### 3.5 Shopping Cart & Wishlist
- **Cart**: Persistent cart (logged-in users), session cart (guests)
- **Wishlist**: Save products for later, share wishlists
- **Quantity management**: Stock validation, bulk quantity discounts
- **Price alerts**: Notify when price drops

### 3.6 Order Management
- **Order flow**: Cart → Checkout → Payment → Confirmation → Processing → Shipping → Delivered → Completed
- **Order statuses**: pending, confirmed, processing, shipped, out_for_delivery, delivered, completed, cancelled, refunded, disputed
- **Order tracking**: Real-time tracking for delivery partners
- **Order history**: Full history with reorder functionality
- **Guest checkout**: Allow without registration

### 3.7 Payment System

#### 3.7.1 Supported Payment Methods
| Method | Type | Notes |
|--------|------|-------|
| Cash on Delivery (COD) | Offline | Most popular in Cambodia |
| ABA Bank | Online | QR payment, Wings integration |
| Acleda Bank | Online | QR payment |
| Wing | Mobile | Wing wallet, widely used |
| Pi Pay | Mobile | Growing mobile payment |
| True Money | Mobile | Popular among younger users |
| Credit/Debit Card | Online | Visa, Mastercard |
| USBank Transfer | Online | Bank transfer with manual verification |

#### 3.7.2 Currency Handling
- **Dual currency display**: All prices show both USD and KHR
- **Conversion rate**: Updated daily from National Bank of Cambodia
- **Payment currency**: User chooses USD or KHR at checkout
- **Decimal handling**: USD (2 decimals), KHR (0 decimals, rounded to nearest 100)

### 3.8 Shipping & Logistics

#### 3.8.1 Shipping Partners
| Partner | Coverage | Speed |
|---------|----------|-------|
| Grab Express | Major cities | Same day |
| GHL Express | Nationwide | 1-3 days |
| J&T Express | Nationwide | 2-5 days |
| Cambodia Post | All provinces | 3-7 days |
| ABA Delivery | Major cities | Same day-1 day |
| Self-Pickup | All | Immediate |

#### 3.8.2 Shipping Features
- **Shipping calculator**: Real-time cost estimation
- **Free shipping thresholds**: Seller-configurable minimum order
- **Express delivery**: Same-day in Phnom Penh, Siem Reap
- **COD handling**: Automatic collection and remittance
- **Address management**: Province/district/commune selector (Cambodian administrative divisions)

### 3.9 Reviews & Ratings
- **Star rating**: 1-5 stars with half-star support
- **Written reviews**: With photo uploads (up to 5)
- **Review verification**: Only verified buyers can review
- **Seller responses**: Sellers can respond to reviews
- **Helpful votes**: "Was this review helpful?" voting
- **Report reviews**: Flag inappropriate content

### 3.10 Seller Features
- **Seller dashboard**: Sales analytics, order management, product management
- **Shop customization**: Banner, description, logo, theme colors
- **Promotions**: Coupon creation, flash sales, bundle deals
- **Inventory management**: Stock tracking, low-stock alerts
- **Bulk operations**: Batch order processing, bulk price updates
- **Seller chat**: Direct messaging with buyers
- **Seller verification**: KYC process, verified badge

### 3.11 Communication
- **In-app chat**: Buyer-seller messaging with rich content
- **Push notifications**: Order updates, promotions, chat messages
- **SMS notifications**: Critical updates (order confirmed, shipped)
- **Email notifications**: Marketing, account updates, receipts
- **Social sharing**: Share products to Facebook, Telegram, TikTok, LINE

### 3.12 Admin Features
- **Dashboard**: Real-time sales, orders, users, revenue analytics
- **User management**: View, ban, verify users
- **Product moderation**: Approve/flag inappropriate listings
- **Category management**: CRUD categories, manage commissions
- **Commission system**: Configurable per-category commission rates
- **Dispute resolution**: Handle buyer-seller disputes
- **Content management**: Banners, announcements, pages
- **Financial reports**: Revenue, commissions, payouts
- **Fraud detection**: Suspicious activity alerts

---

## 4. Technical Architecture

### 4.1 Backend (Python FastAPI)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                    # FastAPI application entry
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py              # Settings & environment variables
│   │   ├── database.py            # Database connection & session
│   │   ├── security.py            # JWT, password hashing, encryption
│   │   ├── dependencies.py        # FastAPI dependencies
│   │   └── events.py              # Startup/shutdown events
│   ├── common/
│   │   ├── __init__.py
│   │   ├── exceptions.py          # Custom exceptions
│   │   ├── responses.py           # Standardized API responses
│   │   ├── pagination.py          # Pagination utilities
│   │   ├── validators.py          # Custom validators
│   │   └── utils.py               # General utilities
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py                # User schemas
│   │   ├── product.py             # Product schemas
│   │   ├── category.py            # Category schemas
│   │   ├── order.py               # Order schemas
│   │   ├── payment.py             # Payment schemas
│   │   ├── shipping.py            # Shipping schemas
│   │   ├── review.py              # Review schemas
│   │   ├── chat.py                # Chat schemas
│   │   ├── coupon.py              # Coupon schemas
│   │   ├── admin.py               # Admin schemas
│   │   └── notification.py        # Notification schemas
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py                # User SQLAlchemy model
│   │   ├── product.py             # Product model
│   │   ├── category.py            # Category model
│   │   ├── order.py               # Order model
│   │   ├── payment.py             # Payment model
│   │   ├── shipping.py            # Shipping model
│   │   ├── review.py              # Review model
│   │   ├── chat.py                # Chat model
│   │   ├── coupon.py              # Coupon model
│   │   └── notification.py        # Notification model
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py        # Authentication logic
│   │   ├── user_service.py        # User CRUD & business logic
│   │   ├── product_service.py     # Product CRUD & search
│   │   ├── category_service.py    # Category management
│   │   ├── order_service.py       # Order processing
│   │   ├── payment_service.py     # Payment processing
│   │   ├── shipping_service.py    # Shipping calculation
│   │   ├── review_service.py      # Review management
│   │   ├── chat_service.py        # Chat/messaging
│   │   ├── coupon_service.py      # Coupon management
│   │   ├── notification_service.py # Notifications
│   │   ├── search_service.py      # Search & filtering
│   │   └── admin_service.py       # Admin operations
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py                # /api/v1/auth/*
│   │   ├── users.py               # /api/v1/users/*
│   │   ├── products.py            # /api/v1/products/*
│   │   ├── categories.py          # /api/v1/categories/*
│   │   ├── orders.py              # /api/v1/orders/*
│   │   ├── payments.py            # /api/v1/payments/*
│   │   ├── shipping.py            # /api/v1/shipping/*
│   │   ├── reviews.py             # /api/v1/reviews/*
│   │   ├── chat.py                # /api/v1/chat/*
│   │   ├── coupons.py             # /api/v1/coupons/*
│   │   ├── wishlist.py            # /api/v1/wishlist/*
│   │   ├── notifications.py       # /api/v1/notifications/*
│   │   ├── search.py              # /api/v1/search/*
│   │   └── admin.py               # /api/v1/admin/*
│   └── utils/
│       ├── __init__.py
│       ├── currency.py            # USD/KHR conversion
│       ├── khmer_text.py          # Khmer text processing
│       ├── sms.py                 # SMS gateway integration
│       ├── email.py               # Email sending
│       ├── storage.py             # File storage (S3/MinIO)
│       └── sms_otp.py             # OTP generation & verification
├── alembic/                       # Database migrations
│   ├── env.py
│   └── versions/
├── alembic.ini
├── requirements.txt
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

### 4.2 Frontend (React.js)

```
frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── locales/                   # Static translation files
│       ├── km.json                # Khmer
│       └── en.json                # English
├── src/
│   ├── index.js
│   ├── App.js
│   ├── routes/
│   │   └── index.jsx              # React Router configuration
│   ├── api/
│   │   ├── client.js              # Axios instance with interceptors
│   │   ├── auth.js                # Auth API calls
│   │   ├── products.js            # Product API calls
│   │   ├── orders.js              # Order API calls
│   │   ├── users.js               # User API calls
│   │   ├── payments.js            # Payment API calls
│   │   ├── chat.js                # Chat API calls
│   │   └── admin.js               # Admin API calls
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── Button.jsx
│   │   │   │   └── Button.module.css
│   │   │   ├── Input/
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Input.module.css
│   │   │   ├── Modal/
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Modal.module.css
│   │   │   ├── Loading/
│   │   │   │   ├── Spinner.jsx
│   │   │   │   ├── Skeleton.jsx
│   │   │   │   └── Loading.module.css
│   │   │   ├── Pagination/
│   │   │   │   ├── Pagination.jsx
│   │   │   │   └── Pagination.module.css
│   │   │   ├── Badge/
│   │   │   │   ├── Badge.jsx
│   │   │   │   └── Badge.module.css
│   │   │   ├── Toast/
│   │   │   │   ├── Toast.jsx
│   │   │   │   └── Toast.module.css
│   │   │   ├── EmptyState/
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   └── EmptyState.module.css
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.jsx
│   │   │   │   └── SearchBar.module.css
│   │   │   ├── CurrencyDisplay/
│   │   │   │   ├── CurrencyDisplay.jsx
│   │   │   │   └── CurrencyDisplay.module.css
│   │   │   ├── ImageGallery/
│   │   │   │   ├── ImageGallery.jsx
│   │   │   │   └── ImageGallery.module.css
│   │   │   └── ResponsiveContainer/
│   │   │       ├── ResponsiveContainer.jsx
│   │   │       └── ResponsiveContainer.module.css
│   │   ├── layout/
│   │   │   ├── Header/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Header.module.css
│   │   │   │   ├── MobileMenu.jsx
│   │   │   │   └── DesktopMenu.jsx
│   │   │   ├── Footer/
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Footer.module.css
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Sidebar.module.css
│   │   │   ├── BottomNav/
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   └── BottomNav.module.css
│   │   │   └── MainLayout/
│   │   │       ├── MainLayout.jsx
│   │   │       └── MainLayout.module.css
│   │   ├── product/
│   │   │   ├── ProductCard/
│   │   │   │   ├── ProductCard.jsx
│   │   │   │   └── ProductCard.module.css
│   │   │   ├── ProductGrid/
│   │   │   │   ├── ProductGrid.jsx
│   │   │   │   └── ProductGrid.module.css
│   │   │   ├── ProductDetail/
│   │   │   │   ├── ProductDetail.jsx
│   │   │   │   └── ProductDetail.module.css
│   │   │   ├── ProductFilters/
│   │   │   │   ├── ProductFilters.jsx
│   │   │   │   └── ProductFilters.module.css
│   │   │   ├── ProductVariants/
│   │   │   │   ├── ProductVariants.jsx
│   │   │   │   └── ProductVariants.module.css
│   │   │   └── RelatedProducts/
│   │   │       ├── RelatedProducts.jsx
│   │   │       └── RelatedProducts.module.css
│   │   ├── cart/
│   │   │   ├── CartItem/
│   │   │   │   ├── CartItem.jsx
│   │   │   │   └── CartItem.module.css
│   │   │   ├── CartSummary/
│   │   │   │   ├── CartSummary.jsx
│   │   │   │   └── CartSummary.module.css
│   │   │   └── CartDrawer/
│   │   │       ├── CartDrawer.jsx
│   │   │       └── CartDrawer.module.css
│   │   ├── checkout/
│   │   │   ├── CheckoutForm/
│   │   │   │   ├── CheckoutForm.jsx
│   │   │   │   └── CheckoutForm.module.css
│   │   │   ├── AddressForm/
│   │   │   │   ├── AddressForm.jsx
│   │   │   │   └── AddressForm.module.css
│   │   │   ├── PaymentMethods/
│   │   │   │   ├── PaymentMethods.jsx
│   │   │   │   └── PaymentMethods.module.css
│   │   │   └── OrderSummary/
│   │   │       ├── OrderSummary.jsx
│   │   │       └── OrderSummary.module.css
│   │   ├── user/
│   │   │   ├── LoginForm/
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   └── LoginForm.module.css
│   │   │   ├── RegisterForm/
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   └── RegisterForm.module.css
│   │   │   ├── UserProfile/
│   │   │   │   ├── UserProfile.jsx
│   │   │   │   └── UserProfile.module.css
│   │   │   ├── PhoneOTP/
│   │   │   │   ├── PhoneOTP.jsx
│   │   │   │   └── PhoneOTP.module.css
│   │   │   └── AddressBook/
│   │   │       ├── AddressBook.jsx
│   │   │       └── AddressBook.module.css
│   │   ├── seller/
│   │   │   ├── SellerDashboard/
│   │   │   │   ├── SellerDashboard.jsx
│   │   │   │   └── SellerDashboard.module.css
│   │   │   ├── ShopProfile/
│   │   │   │   ├── ShopProfile.jsx
│   │   │   │   └── ShopProfile.module.css
│   │   │   ├── ProductForm/
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductForm.module.css
│   │   │   └── OrderManagement/
│   │   │       ├── OrderManagement.jsx
│   │   │       └── OrderManagement.module.css
│   │   ├── chat/
│   │   │   ├── ChatWindow/
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   └── ChatWindow.module.css
│   │   │   ├── ChatList/
│   │   │   │   ├── ChatList.jsx
│   │   │   │   └── ChatList.module.css
│   │   │   └── ChatBubble/
│   │   │       ├── ChatBubble.jsx
│   │   │       └── ChatBubble.module.css
│   │   └── admin/
│   │       ├── AdminSidebar/
│   │       │   ├── AdminSidebar.jsx
│   │       │   └── AdminSidebar.module.css
│   │       ├── StatsCard/
│   │       │   ├── StatsCard.jsx
│   │       │   └── StatsCard.module.css
│   │       ├── DataTable/
│   │       │   ├── DataTable.jsx
│   │       │   └── DataTable.module.css
│   │       └── Charts/
│   │           ├── SalesChart.jsx
│   │           └── Charts.module.css
│   ├── pages/
│   │   ├── Home/
│   │   │   └── HomePage.jsx
│   │   ├── Product/
│   │   │   ├── ProductListPage.jsx
│   │   │   └── ProductDetailPage.jsx
│   │   ├── Cart/
│   │   │   └── CartPage.jsx
│   │   ├── Checkout/
│   │   │   └── CheckoutPage.jsx
│   │   ├── Auth/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── User/
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── OrdersPage.jsx
│   │   │   ├── OrderDetailPage.jsx
│   │   │   ├── WishlistPage.jsx
│   │   │   ├── AddressesPage.jsx
│   │   │   └── SettingsPage.jsx
│   │   ├── Seller/
│   │   │   ├── SellerDashboardPage.jsx
│   │   │   ├── SellerProductsPage.jsx
│   │   │   ├── SellerOrdersPage.jsx
│   │   │   ├── SellerSettingsPage.jsx
│   │   │   └── ShopPage.jsx
│   │   ├── Chat/
│   │   │   └── ChatPage.jsx
│   │   ├── Search/
│   │   │   └── SearchResultsPage.jsx
│   │   ├── Admin/
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   ├── AdminProductsPage.jsx
│   │   │   ├── AdminOrdersPage.jsx
│   │   │   ├── AdminCategoriesPage.jsx
│   │   │   ├── AdminPaymentsPage.jsx
│   │   │   └── AdminSettingsPage.jsx
│   │   └── Static/
│   │       ├── AboutPage.jsx
│   │       ├── ContactPage.jsx
│   │       ├── FAQPage.jsx
│   │       ├── TermsPage.jsx
│   │       └── PrivacyPage.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useCart.js
│   │   ├── useProducts.js
│   │   ├── useOrders.js
│   │   ├── useDebounce.js
│   │   ├── useLocalStorage.js
│   │   ├── useMediaQuery.js
│   │   ├── useInfiniteScroll.js
│   │   ├── usePagination.js
│   │   └── useNotification.js
│   ├── context/
│   │   ├── AuthContext.js
│   │   ├── CartContext.js
│   │   ├── ThemeContext.js
│   │   ├── LanguageContext.js
│   │   └── NotificationContext.js
│   ├── store/
│   │   └── index.js                # Zustand store configuration
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── formatters.js
│   │   ├── validators.js
│   │   └── khmer.js                # Khmer text utilities
│   ├── styles/
│   │   ├── globals.css
│   │   ├── variables.css
│   │   ├── mixins.css
│   │   └── responsive.css
│   └── assets/
│       ├── images/
│       ├── icons/
│       └── fonts/
├── package.json
├── .env.example
├── Dockerfile
└── docker-compose.yml
```

---

## 5. API Design

### 5.1 API Versioning
- Base URL: `/api/v1/`
- All responses follow standard envelope format
- JSON responses only

### 5.2 Standard Response Format
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### 5.3 Error Response Format
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid Cambodian phone number format"
    }
  ],
  "error_code": "VALIDATION_ERROR"
}
```

### 5.4 Authentication
- JWT Bearer tokens
- Access token: 30 minutes
- Refresh token: 30 days
- Token refresh endpoint available

### 5.5 API Endpoints

#### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/register | Register with phone/email |
| POST | /api/v1/auth/login | Login with credentials |
| POST | /api/v1/auth/login/phone | Phone OTP login |
| POST | /api/v1/auth/verify-otp | Verify phone OTP |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Logout (invalidate refresh) |
| POST | /api/v1/auth/forgot-password | Request password reset |
| POST | /api/v1/auth/reset-password | Reset password with token |
| POST | /api/v1/auth/social | Social login (FB, Google) |

#### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/users/me | Get current user profile |
| PUT | /api/v1/users/me | Update current user profile |
| POST | /api/v1/users/me/avatar | Upload profile picture |
| GET | /api/v1/users/:id | Get user public profile |
| GET | /api/v1/users/me/addresses | Get saved addresses |
| POST | /api/v1/users/me/addresses | Add new address |
| PUT | /api/v1/users/me/addresses/:id | Update address |
| DELETE | /api/v1/users/me/addresses/:id | Delete address |

#### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/products | List products (with filters) |
| GET | /api/v1/products/:id | Get product details |
| POST | /api/v1/products | Create product (seller) |
| PUT | /api/v1/products/:id | Update product (seller) |
| DELETE | /api/v1/products/:id | Delete product (seller) |
| GET | /api/v1/products/trending | Get trending products |
| GET | /api/v1/products/flash-sales | Get flash sale products |
| POST | /api/v1/products/:id/variants | Add variant |
| POST | /api/v1/products/bulk | Bulk upload (CSV) |

#### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/categories | Get category tree |
| GET | /api/v1/categories/:id | Get category with children |
| GET | /api/v1/categories/:id/products | Get products in category |

#### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/orders | Create order |
| GET | /api/v1/orders | List user orders |
| GET | /api/v1/orders/:id | Get order details |
| PUT | /api/v1/orders/:id/cancel | Cancel order |
| POST | /api/v1/orders/:id/confirm-receipt | Confirm delivery |
| GET | /api/v1/orders/:id/tracking | Get tracking info |

#### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/payments | Initiate payment |
| POST | /api/v1/payments/aba/callback | ABA payment callback |
| POST | /api/v1/payments/wing/callback | Wing payment callback |
| POST | /api/v1/payments/pipay/callback | PiPay callback |
| GET | /api/v1/payments/:id/status | Check payment status |
| POST | /api/v1/payments/refund | Request refund |

#### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/cart | Get current cart |
| POST | /api/v1/cart/items | Add item to cart |
| PUT | /api/v1/cart/items/:id | Update cart item quantity |
| DELETE | /api/v1/cart/items/:id | Remove item from cart |
| DELETE | /api/v1/cart | Clear cart |

#### Wishlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/wishlist | Get wishlist |
| POST | /api/v1/wishlist | Add to wishlist |
| DELETE | /api/v1/wishlist/:productId | Remove from wishlist |

#### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/products/:id/reviews | Get product reviews |
| POST | /api/v1/products/:id/reviews | Create review |
| PUT | /api/v1/reviews/:id | Update review |
| DELETE | /api/v1/reviews/:id | Delete review |
| POST | /api/v1/reviews/:id/helpful | Mark review helpful |

#### Shipping
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/shipping/calculate | Calculate shipping cost |
| GET | /api/v1/shipping/provinces | Get province/district list |
| POST | /api/v1/shipping/track/:trackingNumber | Track shipment |

#### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/chat/rooms | List chat rooms |
| GET | /api/v1/chat/rooms/:id/messages | Get messages |
| POST | /api/v1/chat/rooms/:id/messages | Send message |
| PUT | /api/v1/chat/rooms/:id/read | Mark as read |

#### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/search | Search products |
| GET | /api/v1/search/suggestions | Autocomplete suggestions |
| GET | /api/v1/search/popular | Popular searches |

#### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/notifications | List notifications |
| PUT | /api/v1/notifications/:id/read | Mark as read |
| PUT | /api/v1/notifications/read-all | Mark all as read |
| POST | /api/v1/notifications/register-device | Register FCM token |

#### Seller
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/seller/register | Register as seller |
| GET | /api/v1/seller/dashboard | Get seller dashboard stats |
| GET | /api/v1/seller/products | List seller products |
| GET | /api/v1/seller/orders | List seller orders |
| PUT | /api/v1/seller/orders/:id/status | Update order status |
| PUT | /api/v1/seller/shop | Update shop profile |
| GET | /api/v1/seller/analytics | Get sales analytics |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/v1/admin/dashboard | Admin dashboard stats |
| GET | /api/v1/admin/users | List all users |
| PUT | /api/v1/admin/users/:id/status | Ban/unban user |
| GET | /api/v1/admin/products | List all products |
| PUT | /api/v1/admin/products/:id/status | Approve/flag product |
| GET | /api/v1/admin/orders | List all orders |
| GET | /api/v1/admin/payments | Payment reports |
| POST | /api/v1/admin/categories | Create category |
| PUT | /api/v1/admin/categories/:id | Update category |
| GET | /api/v1/admin/disputes | List disputes |
| PUT | /api/v1/admin/disputes/:id/resolve | Resolve dispute |

---

## 6. Data Models

### 6.1 Users
```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) UNIQUE,
    phone           VARCHAR(20) UNIQUE NOT NULL,  -- +855XXXXXXXXX
    password_hash   VARCHAR(255),
    full_name       VARCHAR(255) NOT NULL,        -- Khmer or English
    display_name    VARCHAR(100),
    avatar_url      VARCHAR(500),
    role            VARCHAR(20) DEFAULT 'buyer',   -- buyer, seller, admin
    is_verified     BOOLEAN DEFAULT FALSE,
    is_active       BOOLEAN DEFAULT TRUE,
    province        VARCHAR(100),
    district        VARCHAR(100),
    commune         VARCHAR(100),
    address_detail  TEXT,
    default_currency VARCHAR(3) DEFAULT 'USD',    -- USD or KHR
    language_pref   VARCHAR(5) DEFAULT 'km',      -- km or en
    facebook_id     VARCHAR(100),
    google_id       VARCHAR(100),
    fcm_token       VARCHAR(500),
    last_login_at   TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.2 Sellers (Extended from Users)
```sql
CREATE TABLE sellers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) UNIQUE NOT NULL,
    shop_name       VARCHAR(255) NOT NULL,
    shop_name_kh    VARCHAR(255),
    shop_description TEXT,
    shop_logo_url   VARCHAR(500),
    shop_banner_url VARCHAR(500),
    national_id     VARCHAR(50),                   -- For KYC
    national_id_image VARCHAR(500),
    is_verified     BOOLEAN DEFAULT FALSE,
    business_type   VARCHAR(50),                   -- individual, business
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    rating_avg      DECIMAL(3,2) DEFAULT 0.00,
    rating_count    INTEGER DEFAULT 0,
    total_sales     INTEGER DEFAULT 0,
    total_revenue   DECIMAL(15,2) DEFAULT 0.00,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.3 Categories
```sql
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id       UUID REFERENCES categories(id),
    name            VARCHAR(255) NOT NULL,         -- English
    name_kh         VARCHAR(255) NOT NULL,         -- Khmer
    slug            VARCHAR(255) UNIQUE NOT NULL,
    description     TEXT,
    icon_url        VARCHAR(500),
    image_url       VARCHAR(500),
    commission_rate DECIMAL(5,2) DEFAULT 5.00,
    sort_order      INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    level           INTEGER DEFAULT 0,             -- Hierarchy depth
    path            VARCHAR(500),                  -- Materialized path
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.4 Products
```sql
CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id       UUID REFERENCES sellers(id) NOT NULL,
    category_id     UUID REFERENCES categories(id),
    title           VARCHAR(500) NOT NULL,
    title_kh        VARCHAR(500),
    slug            VARCHAR(500) UNIQUE NOT NULL,
    description     TEXT,
    description_kh  TEXT,
    price           DECIMAL(12,2) NOT NULL,
    price_khr       INTEGER,                       -- Auto-calculated
    compare_price   DECIMAL(12,2),                 -- Original/strikethrough price
    cost_price      DECIMAL(12,2),
    currency        VARCHAR(3) DEFAULT 'USD',
    condition       VARCHAR(20) DEFAULT 'new',     -- new, like_new, used_good, used_fair
    sku             VARCHAR(100),
    barcode         VARCHAR(100),
    stock_quantity  INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    weight_grams    INTEGER,
    is_digital      BOOLEAN DEFAULT FALSE,
    digital_url     VARCHAR(500),
    is_active       BOOLEAN DEFAULT TRUE,
    is_featured     BOOLEAN DEFAULT FALSE,
    status          VARCHAR(20) DEFAULT 'active',  -- draft, pending, active, flagged, archived
    view_count      INTEGER DEFAULT 0,
    sold_count      INTEGER DEFAULT 0,
    rating_avg      DECIMAL(3,2) DEFAULT 0.00,
    rating_count    INTEGER DEFAULT 0,
    tags            TEXT[],                         -- Array of tags
    meta_title      VARCHAR(255),
    meta_description TEXT,
    shipping_class  VARCHAR(50),                   -- standard, heavy, fragile
    min_order_qty   INTEGER DEFAULT 1,
    max_order_qty   INTEGER,
    location_province VARCHAR(100),
    location_district VARCHAR(100),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

### 6.5 Product Images
```sql
CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    url             VARCHAR(500) NOT NULL,
    alt_text        VARCHAR(255),
    sort_order      INTEGER DEFAULT 0,
    is_primary      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.6 Product Variants
```sql
CREATE TABLE product_variants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,          -- e.g., "Red - Size XL"
    sku             VARCHAR(100),
    price           DECIMAL(12,2) NOT NULL,
    stock_quantity  INTEGER DEFAULT 0,
    image_url       VARCHAR(500),
    attributes      JSONB,                          -- {"color": "Red", "size": "XL"}
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.7 Cart
```sql
CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id),
    session_id      VARCHAR(255),                   -- For guest users
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    variant_id      UUID REFERENCES product_variants(id),
    quantity        INTEGER DEFAULT 1,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, variant_id)
);
```

### 6.8 Orders
```sql
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number    VARCHAR(20) UNIQUE NOT NULL,    -- KM-YYYYMMDD-XXXXX
    buyer_id        UUID REFERENCES users(id) NOT NULL,
    status          VARCHAR(30) DEFAULT 'pending',
    subtotal        DECIMAL(12,2) NOT NULL,
    shipping_cost   DECIMAL(12,2) DEFAULT 0.00,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount      DECIMAL(12,2) DEFAULT 0.00,
    total           DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    payment_method  VARCHAR(50),
    payment_status  VARCHAR(20) DEFAULT 'pending',  -- pending, paid, failed, refunded
    shipping_address JSONB NOT NULL,
    billing_address  JSONB,
    note            TEXT,
    seller_note     TEXT,
    tracking_number VARCHAR(100),
    shipping_partner VARCHAR(50),
    estimated_delivery DATE,
    delivered_at    TIMESTAMP WITH TIME ZONE,
    completed_at    TIMESTAMP WITH TIME ZONE,
    cancelled_at    TIMESTAMP WITH TIME ZONE,
    cancel_reason   TEXT,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
```

### 6.9 Order Items
```sql
CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES orders(id) ON DELETE CASCADE,
    seller_id       UUID REFERENCES sellers(id),
    product_id      UUID REFERENCES products(id),
    variant_id      UUID REFERENCES product_variants(id),
    product_title   VARCHAR(500) NOT NULL,          -- Snapshot
    product_image   VARCHAR(500),                   -- Snapshot
    variant_name    VARCHAR(255),                   -- Snapshot
    price           DECIMAL(12,2) NOT NULL,         -- Snapshot
    quantity        INTEGER NOT NULL,
    total           DECIMAL(12,2) NOT NULL,
    status          VARCHAR(30) DEFAULT 'pending',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.10 Payments
```sql
CREATE TABLE payments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID REFERENCES orders(id) NOT NULL,
    method          VARCHAR(50) NOT NULL,            -- cod, aba, wing, pipay, truemoney, card, bank_transfer
    provider        VARCHAR(50),
    transaction_id  VARCHAR(255),
    amount          DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(3) DEFAULT 'USD',
    status          VARCHAR(20) DEFAULT 'pending',  -- pending, processing, completed, failed, refunded
    payment_data    JSONB,                          -- Provider-specific data
    refund_amount   DECIMAL(12,2) DEFAULT 0.00,
    refund_reason   TEXT,
    paid_at         TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.11 Reviews
```sql
CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) NOT NULL,
    order_item_id   UUID REFERENCES order_items(id),
    rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title           VARCHAR(255),
    comment         TEXT,
    images          TEXT[],                          -- Array of image URLs
    seller_response TEXT,
    is_verified     BOOLEAN DEFAULT FALSE,
    helpful_count   INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id, order_item_id)
);
```

### 6.12 Wishlist
```sql
CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

### 6.13 Coupons
```sql
CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id       UUID REFERENCES sellers(id),
    code            VARCHAR(50) UNIQUE NOT NULL,
    description     TEXT,
    discount_type   VARCHAR(20) NOT NULL,           -- percentage, fixed_amount
    discount_value  DECIMAL(12,2) NOT NULL,
    min_order_amount DECIMAL(12,2) DEFAULT 0.00,
    max_discount    DECIMAL(12,2),
    usage_limit     INTEGER,
    used_count      INTEGER DEFAULT 0,
    per_user_limit  INTEGER DEFAULT 1,
    start_date      TIMESTAMP WITH TIME ZONE,
    end_date        TIMESTAMP WITH TIME ZONE,
    is_active       BOOLEAN DEFAULT TRUE,
    applicable_products UUID[],                      -- NULL = all products
    applicable_categories UUID[],
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.14 Chat
```sql
CREATE TABLE chat_rooms (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id        UUID REFERENCES users(id) NOT NULL,
    seller_id       UUID REFERENCES sellers(id) NOT NULL,
    order_id        UUID REFERENCES orders(id),
    last_message    TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    buyer_unread    INTEGER DEFAULT 0,
    seller_unread   INTEGER DEFAULT 0,
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id         UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id       UUID REFERENCES users(id) NOT NULL,
    message         TEXT,
    message_type    VARCHAR(20) DEFAULT 'text',     -- text, image, product_link, order_link
    attachments     TEXT[],
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.15 Notifications
```sql
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    title_kh        VARCHAR(255),
    message         TEXT NOT NULL,
    message_kh      TEXT,
    type            VARCHAR(50) NOT NULL,           -- order, promotion, system, chat
    reference_type  VARCHAR(50),                    -- order, product, review
    reference_id    UUID,
    is_read         BOOLEAN DEFAULT FALSE,
    action_url      VARCHAR(500),
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6.16 Addresses
```sql
CREATE TABLE user_addresses (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) NOT NULL,
    recipient_name  VARCHAR(255) NOT NULL,
    phone           VARCHAR(20) NOT NULL,
    province        VARCHAR(100) NOT NULL,
    district        VARCHAR(100) NOT NULL,
    commune         VARCHAR(100),
    village         VARCHAR(100),
    street_address  TEXT,
    postal_code     VARCHAR(10),
    is_default      BOOLEAN DEFAULT FALSE,
    label           VARCHAR(50),                    -- home, office, other
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 7. Cambodia-Specific Features

### 7.1 Language Support
- Full Khmer Unicode support (U+1780-U+17FF)
- Bilingual UI (Khmer/English toggle)
- Khmer phone number validation (+855)
- Khmer province/district/commune data (ISO 3166-2:KH)
- RTL-safe (though Khmer is LTR)

### 7.2 Province Data (25 Provinces)
```
Phnom Penh, Siem Reap, Battambang, Sihanoukville, Kampong Cham,
Kampong Chhnang, Kampong Speu, Kampong Thom, Kampot, Kandal,
Koh Kong, Kratie, Mondulkiri, Oddar Meanchey, Pailin,
Preah Vihear, Prey Veng, Pursat, Ratanakiri, Siem Reap,
Svay Rieng, Takéo, Tbong Khmum, Stung Treng, Kampong Speu
```

### 7.3 Payment Integration Notes
- **ABA Bank**: QR payment via ABA Pay API
- **Wing**: Wings Money API for mobile payments
- **Pi Pay**: PiPay API integration
- **True Money**: TrueMoney Wallet API
- **COD**: Manual status updates by delivery person

### 7.4 Cultural Considerations
- **Khmer New Year** (April 13-16): Major sales event
- **Pchum Ben** (September/October): Holiday sales
- **Water Festival** (November): Festival promotions
- **Sene Dolta**: Memorial day promotions
- **Angkor Sankranta**: New Year celebrations
- Price negotiation culture (offer/counter-offer feature)
- Product authenticity concerns (verified seller badge importance)

### 7.5 Local Address System
Cambodia uses a 4-tier address system:
1. **Province/Khan** (ខេត្ត/ក្រុង)
2. **District/Sangkat** (ស្រុក/ខណ្ឌ)
3. **Commune** (ឃុំ/សង្កាត់)
4. **Village** (ភូមិ)

---

## 8. Security

### 8.1 Authentication
- JWT with short-lived access tokens (30 min)
- Refresh token rotation
- Phone OTP verification (6 digits, 5-minute expiry)
- Rate limiting on auth endpoints (5 attempts/minute)
- Account lockout after 5 failed attempts

### 8.2 Data Protection
- Password hashing with bcrypt (12 rounds)
- Sensitive data encryption at rest (AES-256)
- HTTPS everywhere (TLS 1.3)
- CORS restricted to allowed origins
- Input sanitization (XSS prevention)
- SQL injection prevention (parameterized queries)

### 8.3 API Security
- Rate limiting: 100 requests/minute per user
- Request size limits (10MB max)
- API key authentication for external integrations
- Admin endpoints restricted to admin role
- Seller endpoints restricted to verified sellers

---

## 9. Performance Requirements

| Metric | Target |
|--------|--------|
| API response time | < 200ms (95th percentile) |
| Page load time | < 3 seconds (3G connection) |
| Image load time | < 2 seconds (lazy loading) |
| Search response time | < 500ms |
| Concurrent users | 10,000+ |
| Uptime | 99.9% |
| Database query time | < 50ms |

### 9.1 Caching Strategy
- Redis for session storage
- Product listing cache (5-minute TTL)
- Category tree cache (1-hour TTL)
- Search result cache (2-minute TTL)
- CDN for static assets

### 9.2 Database
- PostgreSQL 15 as primary database
- Read replicas for heavy read operations
- Connection pooling (pgBouncer)
- Automated backups every 6 hours
- Point-in-time recovery

---

## 10. Deployment

### 10.1 Docker Configuration
```yaml
# docker-compose.yml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DATABASE_URL=postgresql+asyncpg://user:pass@db:5432/khmermarket
      - REDIS_URL=redis://redis:6379

  frontend:
    build: ./frontend
    ports:
      - "3000:80"

  db:
    image: postgres:15
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=khmermarket
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/letsencrypt

volumes:
  pgdata:
```

### 10.2 CI/CD Pipeline
- GitHub Actions for CI/CD
- Automated testing on pull requests
- Docker image build and push
- Staging deployment on develop branch
- Production deployment on main branch

---

## 11. Testing Strategy

### 11.1 Backend Tests
- Unit tests for services (pytest)
- API integration tests (pytest-asyncio)
- Database tests with test containers
- Load testing with Locust
- Minimum 80% code coverage

### 11.2 Frontend Tests
- Component tests (React Testing Library)
- E2E tests (Cypress or Playwright)
- Visual regression tests (Storybook)
- Accessibility tests (axe-core)

---

## 12. Future Roadmap

### Phase 1 (MVP) - Months 1-3
- [x] User registration/login (phone, email)
- [x] Product listing and search
- [x] Shopping cart
- [x] Basic checkout with COD
- [x] Order management
- [x] Seller dashboard

### Phase 2 - Months 4-6
- [ ] Payment gateway integration (ABA, Wing, PiPay)
- [ ] Real-time chat (WebSocket)
- [ ] Push notifications (FCM)
- [ ] Review system
- [ ] Coupon/promotion system

### Phase 3 - Months 7-9
- [ ] AI product recommendations
- [ ] Advanced analytics
- [ ] Mobile app (React Native)
- [ ] Multi-vendor marketplace features
- [ ] Flash sales system

### Phase 4 - Months 10-12
- [ ] Loyalty points system
- [ ] Seller financing
- [ ] Logistics management dashboard
- [ ] International shipping
- [ ] White-label seller storefronts

---

## 13. Environment Variables

### Backend (.env)
```env
# Application
APP_NAME=KhmerMarket
APP_ENV=development
DEBUG=true
SECRET_KEY=your-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/khmermarket

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30

# SMS Gateway (e.g., Clickatell, Infobip)
SMS_PROVIDER=clickatell
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-email-password

# File Storage
STORAGE_PROVIDER=s3
S3_BUCKET=khmermarket-uploads
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_REGION=ap-southeast-1

# Payment Gateways
ABA_MERCHANT_ID=your-merchant-id
ABA_API_KEY=your-api-key
ABA_SECRET_KEY=your-secret-key
WING_MERCHANT_ID=your-merchant-id
WING_API_KEY=your-api-key
PIPAY_APP_ID=your-app-id
PIPAY_APP_KEY=your-app-key

# Currency
EXCHANGE_RATE_API_KEY=your-api-key
DEFAULT_CURRENCY=USD
KHR_USD_RATE=4100

# Currency Conversion
EXCHANGE_RATE_API_URL=https://api.exchangerate-api.com/v4/latest/USD
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_FIREBASE_VAPID_KEY=your-vapid-key
REACT_APP_GOOGLE_MAPS_KEY=your-maps-key
REACT_APP_FACEBOOK_APP_ID=your-fb-app-id
```

---

*Document Version: 1.0*
*Last Updated: 2026-07-11*
*Target Launch: Q4 2026*
