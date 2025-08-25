// App Configuration
export const APP_CONFIG = {
    NAME: 'Walmart',
    VERSION: '1.0.0',
    BUILD_NUMBER: '1',
    BUNDLE_ID: 'com.walmart.mobile',

    // Environment
    ENVIRONMENT: process.env.NODE_ENV || 'development',
    IS_DEV: process.env.NODE_ENV === 'development',
    IS_PROD: process.env.NODE_ENV === 'production',

    // Deep linking
    SCHEME: 'walmart',
    UNIVERSAL_LINK: 'https://walmart.com',
} as const;

// API Configuration
export const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.walmart.com/v1',
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,

    // API Versions
    VERSIONS: {
        V1: '/v1',
        V2: '/v2',
        LATEST: '/v1',
    },

    // Rate limiting
    RATE_LIMIT: {
        REQUESTS_PER_MINUTE: 100,
        BURST_LIMIT: 20,
    },
} as const;

// Storage Keys
export const STORAGE_KEYS = {
    // User data
    USER_TOKEN: 'user_token',
    USER_PROFILE: 'user_profile',
    USER_PREFERENCES: 'user_preferences',
    USER_ADDRESSES: 'user_addresses',

    // Shopping
    CART_ITEMS: 'cart_items',
    WISHLIST_ITEMS: 'wishlist_items',
    RECENT_SEARCHES: 'recent_searches',
    RECENTLY_VIEWED: 'recently_viewed',

    // App state
    ONBOARDING_COMPLETED: 'onboarding_completed',
    SELECTED_STORE: 'selected_store',
    FAVORITE_STORES: 'favorite_stores',
    LAST_APP_VERSION: 'last_app_version',

    // Settings
    THEME_PREFERENCE: 'theme_preference',
    LANGUAGE_PREFERENCE: 'language_preference',
    NOTIFICATION_SETTINGS: 'notification_settings',

    // Cache
    PRODUCT_CACHE: 'product_cache',
    STORE_CACHE: 'store_cache',
    CATEGORY_CACHE: 'category_cache',
} as const;

// Business Rules and Limits
export const BUSINESS_RULES = {
    // Cart limits
    MAX_CART_ITEMS: 100,
    MAX_ITEM_QUANTITY: 50,
    MIN_ORDER_VALUE: 1.00,
    MAX_ORDER_VALUE: 10000.00,

    // Shipping
    FREE_SHIPPING_THRESHOLD: 35.00,
    MAX_SHIPPING_WEIGHT: 150, // pounds

    // User limits
    MAX_ADDRESSES: 10,
    MAX_PAYMENT_METHODS: 5,
    MAX_WISHLIST_ITEMS: 500,
    MAX_RECENT_SEARCHES: 20,
    MAX_RECENTLY_VIEWED: 50,

    // Reviews
    MIN_REVIEW_LENGTH: 10,
    MAX_REVIEW_LENGTH: 5000,
    MAX_REVIEW_PHOTOS: 10,

    // Search
    MIN_SEARCH_QUERY_LENGTH: 2,
    MAX_SEARCH_QUERY_LENGTH: 100,
    MAX_SEARCH_RESULTS: 1000,

    // Timeouts
    CART_EXPIRY_DAYS: 30,
    SESSION_TIMEOUT_MINUTES: 30,
    PASSWORD_RESET_EXPIRY_HOURS: 24,
    EMAIL_VERIFICATION_EXPIRY_HOURS: 48,

    // File uploads
    MAX_FILE_SIZE_MB: 10,
    MAX_IMAGE_SIZE_MB: 5,
    ALLOWED_IMAGE_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
    ALLOWED_VIDEO_FORMATS: ['mp4', 'mov', 'avi'],
} as const;

// UI Constants
export const UI_CONSTANTS = {
    // Screen dimensions
    HEADER_HEIGHT: 60,
    TAB_BAR_HEIGHT: 80,
    SAFE_AREA_PADDING: 20,

    // Touch targets
    MIN_TOUCH_TARGET: 44,
    BUTTON_HEIGHT: 48,
    INPUT_HEIGHT: 56,

    // Spacing
    SPACING: {
        XS: 4,
        SM: 8,
        MD: 16,
        LG: 24,
        XL: 32,
        XXL: 48,
    },

    // Border radius
    BORDER_RADIUS: {
        XS: 4,
        SM: 8,
        MD: 12,
        LG: 16,
        XL: 24,
        ROUND: 9999,
    },

    // Animation durations (milliseconds)
    ANIMATION: {
        FAST: 150,
        NORMAL: 250,
        SLOW: 350,
        EXTRA_SLOW: 500,
    },

    // Breakpoints
    BREAKPOINTS: {
        SM: 640,
        MD: 768,
        LG: 1024,
        XL: 1280,
    },
} as const;

// Color Constants
export const COLORS = {
    // Walmart brand colors
    WALMART_BLUE: '#0071ce',
    WALMART_YELLOW: '#ffc220',
    WALMART_DARK_BLUE: '#004c91',
    WALMART_LIGHT_BLUE: '#4f99e8',

    // Semantic colors
    SUCCESS: '#10b981',
    WARNING: '#f59e0b',
    ERROR: '#ef4444',
    INFO: '#3b82f6',

    // Neutral colors
    BLACK: '#000000',
    WHITE: '#ffffff',
    GRAY_50: '#f9fafb',
    GRAY_100: '#f3f4f6',
    GRAY_200: '#e5e7eb',
    GRAY_300: '#d1d5db',
    GRAY_400: '#9ca3af',
    GRAY_500: '#6b7280',
    GRAY_600: '#4b5563',
    GRAY_700: '#374151',
    GRAY_800: '#1f2937',
    GRAY_900: '#111827',

    // Transparency
    TRANSPARENT: 'transparent',
    OVERLAY: 'rgba(0, 0, 0, 0.5)',
    BACKDROP: 'rgba(0, 0, 0, 0.3)',
} as const;

// Typography
export const TYPOGRAPHY = {
    FONT_FAMILY: {
        REGULAR: 'System',
        MEDIUM: 'System-Medium',
        SEMIBOLD: 'System-Semibold',
        BOLD: 'System-Bold',
    },

    FONT_SIZE: {
        XS: 12,
        SM: 14,
        MD: 16,
        LG: 18,
        XL: 20,
        XXL: 24,
        XXXL: 32,
    },

    LINE_HEIGHT: {
        TIGHT: 1.2,
        NORMAL: 1.4,
        RELAXED: 1.6,
        LOOSE: 1.8,
    },

    LETTER_SPACING: {
        TIGHT: -0.5,
        NORMAL: 0,
        WIDE: 0.5,
        WIDER: 1,
    },
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
    // Core features
    ENABLE_BIOMETRIC_AUTH: true,
    ENABLE_PUSH_NOTIFICATIONS: true,
    ENABLE_LOCATION_SERVICES: true,
    ENABLE_OFFLINE_MODE: true,

    // Shopping features
    ENABLE_BARCODE_SCANNER: true,
    ENABLE_VOICE_SEARCH: true,
    ENABLE_VISUAL_SEARCH: true,
    ENABLE_AR_FEATURES: false,
    ENABLE_SUBSCRIPTION_PRODUCTS: true,
    ENABLE_GIFT_CARDS: true,

    // Social features
    ENABLE_REVIEWS: true,
    ENABLE_WISHLISTS: true,
    ENABLE_SOCIAL_SHARING: true,
    ENABLE_REFERRALS: true,

    // Advanced features
    ENABLE_ANALYTICS: true,
    ENABLE_CRASH_REPORTING: true,
    ENABLE_A_B_TESTING: true,
    ENABLE_PERFORMANCE_MONITORING: true,

    // Beta features
    ENABLE_CHAT_SUPPORT: false,
    ENABLE_VIDEO_CHAT: false,
    ENABLE_LIVE_SHOPPING: false,
    ENABLE_CRYPTO_PAYMENTS: false,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    GENERIC: 'Something went wrong. Please try again.',
    NETWORK: 'Network connection failed. Please check your internet connection.',
    TIMEOUT: 'Request timed out. Please try again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',
    FORBIDDEN: 'Access denied.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER_ERROR: 'Server error. Please try again later.',

    // Validation errors
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_ZIP_CODE: 'Please enter a valid ZIP code.',
    WEAK_PASSWORD: 'Password must be at least 8 characters long.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',

    // Business logic errors
    CART_LIMIT_EXCEEDED: 'You have reached the maximum number of items in your cart.',
    OUT_OF_STOCK: 'This item is currently out of stock.',
    INVALID_QUANTITY: 'Please enter a valid quantity.',
    MIN_ORDER_VALUE: 'Your order must be at least $1.00.',
    MAX_ORDER_VALUE: 'Your order cannot exceed $10,000.00.',

    // Authentication errors
    LOGIN_FAILED: 'Invalid email or password.',
    ACCOUNT_LOCKED: 'Your account has been temporarily locked.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address.',
    TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    ITEM_ADDED_TO_CART: 'Item added to cart',
    ITEM_REMOVED_FROM_CART: 'Item removed from cart',
    ITEM_ADDED_TO_WISHLIST: 'Item added to wishlist',
    ORDER_PLACED: 'Your order has been placed successfully',
    PROFILE_UPDATED: 'Profile updated successfully',
    ADDRESS_SAVED: 'Address saved successfully',
    PAYMENT_METHOD_SAVED: 'Payment method saved successfully',
    REVIEW_SUBMITTED: 'Review submitted successfully',
    EMAIL_VERIFIED: 'Email verified successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-\(\)]{10,}$/,
    ZIP_CODE: /^\d{5}(-\d{4})?$/,
    CREDIT_CARD: /^\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}$/,
    CVV: /^\d{3,4}$/,
    STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    SKU: /^[A-Z0-9\-]{6,20}$/,
    UPC: /^\d{12}$/,
} as const;

// URL Patterns
export const URL_PATTERNS = {
    PRODUCT_DETAIL: '/product/:productId',
    CATEGORY: '/category/:categoryId',
    SEARCH: '/search/:query?',
    STORE_DETAIL: '/store/:storeId',
    ORDER_DETAIL: '/order/:orderId',
    USER_PROFILE: '/profile/:userId?',
} as const;

// Third-party Service Keys
export const SERVICE_KEYS = {
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
    FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    AMPLITUDE_API_KEY: process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY,
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
    // App lifecycle
    APP_OPENED: 'app_opened',
    APP_BACKGROUNDED: 'app_backgrounded',
    APP_CRASHED: 'app_crashed',

    // User actions
    USER_REGISTERED: 'user_registered',
    USER_LOGGED_IN: 'user_logged_in',
    USER_LOGGED_OUT: 'user_logged_out',

    // Shopping actions
    PRODUCT_VIEWED: 'product_viewed',
    PRODUCT_SEARCHED: 'product_searched',
    ITEM_ADDED_TO_CART: 'item_added_to_cart',
    ITEM_REMOVED_FROM_CART: 'item_removed_from_cart',
    CART_VIEWED: 'cart_viewed',
    CHECKOUT_STARTED: 'checkout_started',
    ORDER_COMPLETED: 'order_completed',

    // Engagement
    REVIEW_WRITTEN: 'review_written',
    PRODUCT_SHARED: 'product_shared',
    STORE_VISITED: 'store_visited',
    HELP_ARTICLE_VIEWED: 'help_article_viewed',

    // Errors
    API_ERROR: 'api_error',
    PAYMENT_ERROR: 'payment_error',
    SEARCH_NO_RESULTS: 'search_no_results',
} as const;

// Push Notification Categories
export const NOTIFICATION_CATEGORIES = {
    ORDER_UPDATE: 'order_update',
    PROMOTION: 'promotion',
    PRICE_DROP: 'price_drop',
    STOCK_ALERT: 'stock_alert',
    DELIVERY_UPDATE: 'delivery_update',
    ACCOUNT_SECURITY: 'account_security',
    RECOMMENDATION: 'recommendation',
    STORE_UPDATE: 'store_update',
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
    // TTL in milliseconds
    PRODUCT_CACHE_TTL: 15 * 60 * 1000, // 15 minutes
    CATEGORY_CACHE_TTL: 60 * 60 * 1000, // 1 hour
    STORE_CACHE_TTL: 24 * 60 * 60 * 1000, // 24 hours
    USER_CACHE_TTL: 30 * 60 * 1000, // 30 minutes

    // Max entries
    MAX_PRODUCT_CACHE_ENTRIES: 100,
    MAX_IMAGE_CACHE_ENTRIES: 200,
    MAX_API_CACHE_ENTRIES: 50,

    // Storage limits (MB)
    MAX_CACHE_SIZE: 100,
    MAX_IMAGE_CACHE_SIZE: 50,
} as const;

// Pagination
export const PAGINATION = {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
    INITIAL_PAGE: 1,

    // Infinite scroll
    INFINITE_SCROLL_THRESHOLD: 0.8,
    PRELOAD_PAGES: 2,
} as const;

// Image Sizes
export const IMAGE_SIZES = {
    THUMBNAIL: { width: 80, height: 80 },
    SMALL: { width: 150, height: 150 },
    MEDIUM: { width: 300, height: 300 },
    LARGE: { width: 600, height: 600 },
    HERO: { width: 1200, height: 600 },

    // Aspect ratios
    SQUARE: 1,
    LANDSCAPE: 16 / 9,
    PORTRAIT: 3 / 4,
} as const;

// Map Configuration
export const MAP_CONFIG = {
    DEFAULT_ZOOM: 12,
    MIN_ZOOM: 8,
    MAX_ZOOM: 18,
    SEARCH_RADIUS_MILES: 25,

    // Default location (Walmart HQ)
    DEFAULT_LOCATION: {
        latitude: 36.3429,
        longitude: -94.2088,
    },

    // Map styles
    STYLE_STANDARD: 'standard',
    STYLE_SATELLITE: 'satellite',
    STYLE_HYBRID: 'hybrid',
    STYLE_TERRAIN: 'terrain',
} as const;

// Date and Time Formats
export const DATE_FORMATS = {
    FULL_DATE: 'MMMM d, yyyy',
    SHORT_DATE: 'MMM d, yyyy',
    NUMERIC_DATE: 'MM/dd/yyyy',
    ISO_DATE: 'yyyy-MM-dd',
    TIME_12: 'h:mm a',
    TIME_24: 'HH:mm',
    DATETIME: 'MMM d, yyyy h:mm a',
    RELATIVE: 'relative', // e.g., "2 hours ago"
} as const;

// Currency Configuration
export const CURRENCY_CONFIG = {
    DEFAULT_CURRENCY: 'USD',
    SUPPORTED_CURRENCIES: ['USD', 'CAD', 'MXN'],
    DECIMAL_PLACES: 2,
    THOUSAND_SEPARATOR: ',',
    DECIMAL_SEPARATOR: '.',

    // Currency symbols
    SYMBOLS: {
        USD: '$',
        CAD: 'C$',
        MXN: 'MX$',
        EUR: '€',
        GBP: '£',
    },
} as const;

// Social Media URLs
export const SOCIAL_URLS = {
    FACEBOOK: 'https://www.facebook.com/walmart',
    TWITTER: 'https://twitter.com/walmart',
    INSTAGRAM: 'https://www.instagram.com/walmart',
    YOUTUBE: 'https://www.youtube.com/walmart',
    LINKEDIN: 'https://www.linkedin.com/company/walmart',
    TIKTOK: 'https://www.tiktok.com/@walmart',
} as const;

// Support URLs
export const SUPPORT_URLS = {
    HELP_CENTER: 'https://help.walmart.com',
    CONTACT_US: 'https://help.walmart.com/contact',
    PRIVACY_POLICY: 'https://corporate.walmart.com/privacy-security',
    TERMS_OF_SERVICE: 'https://help.walmart.com/terms-of-use',
    ACCESSIBILITY: 'https://help.walmart.com/accessibility',
    RETURNS: 'https://help.walmart.com/returns-policy',
    SHIPPING: 'https://help.walmart.com/shipping-delivery',
} as const;

// Store Types
export const STORE_TYPES = {
    SUPERCENTER: 'supercenter',
    NEIGHBORHOOD_MARKET: 'neighborhood',
    EXPRESS: 'express',
    SAMS_CLUB: 'sams_club',
    PICKUP_ONLY: 'pickup',
    DISTRIBUTION_CENTER: 'distribution',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    PAYPAL: 'paypal',
    APPLE_PAY: 'apple_pay',
    GOOGLE_PAY: 'google_pay',
    GIFT_CARD: 'gift_card',
    STORE_CREDIT: 'store_credit',
    CASH: 'cash',
} as const;

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
    REFUNDED: 'refunded',
} as const;

// Platform-specific Constants
export const PLATFORM = {
    IS_IOS: process.env.EXPO_OS === 'ios',
    IS_ANDROID: process.env.EXPO_OS === 'android',
    IS_WEB: process.env.EXPO_OS === 'web',

    // Platform-specific values
    SAFE_AREA_TOP: process.env.EXPO_OS === 'ios' ? 44 : 24,
    STATUS_BAR_HEIGHT: process.env.EXPO_OS === 'ios' ? 20 : 24,
    TAB_BAR_HEIGHT: process.env.EXPO_OS === 'ios' ? 83 : 56,
} as const;

// Development/Debug Constants
export const DEBUG = {
    ENABLE_LOGGING: __DEV__,
    ENABLE_REDUX_DEVTOOLS: __DEV__,
    ENABLE_FLIPPER: __DEV__,
    SHOW_PERFORMANCE_OVERLAY: false,
    MOCK_API_RESPONSES: false,
    SIMULATE_SLOW_NETWORK: false,
} as const;