import Constants from 'expo-constants';

// API Configuration - FIXED: Correct Firebase project ID and fallback mode
export const API = {
    baseURL: Constants.expoConfig?.extra?.API_BASE_URL || 'https://us-central1-walmart-mobile-a6865.cloudfunctions.net',
    stripe: {
        publishableKey: Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY || 'pk_test_51Rn53AH8pNFfrvRPiHaJwfe8sjVzmw816AHxvQqHWFD3hJey1a9sqUZu6MvtQY8Y2AyR5DXf5ToFnqJz6ZAQbqd100pCWgURwb',
        // ❌ REMOVED SECRET KEY - SECURITY RISK
    },
    // 🔧 FIXED: Default to false (use real APIs), only enable fallback when explicitly set
    fallbackMode: Constants.expoConfig?.extra?.API_FALLBACK_MODE === 'true', // Default to false
    endpoints: {
        // Firebase Functions endpoints
        calculateTax: '/calculateTax',
        calculateShipping: '/calculateShipping',
        validatePromoCode: '/validatePromoCode',
        createPaymentIntent: '/createPaymentIntent',
        createSetupIntent: '/createSetupIntent',
        confirmPayment: '/confirmPayment',
        createRefund: '/createRefund',
        stripeWebhook: '/stripeWebhook',
        healthCheck: '/healthCheck',

        // Legacy endpoints (if you have other APIs)
        payments: '/payments',
        customers: '/payments/customers',
        paymentMethods: '/payments/payment-methods',
        paymentIntents: '/payments/intents',
        refunds: '/payments/refunds',
        subscriptions: '/payments/subscriptions',
        webhooks: '/payments/webhook',
        auth: '/auth',
        products: '/products',
        orders: '/orders',
        cart: '/cart',
        users: '/users',
    }
} as const;

// Stripe Configuration
export const STRIPE_CONFIG = {
    apiVersion: '2023-10-16' as const,
    currency: 'usd',
    country: 'US',
    locale: 'en',
    appearance: {
        theme: 'stripe' as const,
        variables: {
            colorPrimary: '#0071e3', // Walmart blue
            colorBackground: '#ffffff',
            colorText: '#1c1c1e',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
        },
    },
} as const;

// Application Constants
export const APP_CONFIG = {
    name: 'Walmart Mobile App',
    version: '1.0.0',
    environment: __DEV__ ? 'development' : 'production',
    debug: __DEV__,
} as const;

// Storage Keys for AsyncStorage
export const STORAGE_KEYS = {
    NOTIFICATIONS: '@walmart_notifications_settings',
    USER_PREFERENCES: '@walmart_user_preferences',
    CART_DATA: '@walmart_cart_data',
    PAYMENT_METHODS: '@walmart_payment_methods',
    DELIVERY_ADDRESSES: '@walmart_delivery_addresses',
    SEARCH_HISTORY: '@walmart_search_history',
    PUSH_TOKEN: '@walmart_push_token',
    DEVICE_ID: '@walmart_device_id',
    NOTIFICATION_HISTORY: '@walmart_notification_history',
    SCHEDULED_NOTIFICATIONS: '@walmart_scheduled_notifications',
} as const;

// Firebase Configuration
export const FIREBASE_CONFIG = {
    apiKey: Constants.expoConfig?.extra?.FIREBASE_API_KEY,
    authDomain: Constants.expoConfig?.extra?.FIREBASE_AUTH_DOMAIN,
    projectId: Constants.expoConfig?.extra?.FIREBASE_PROJECT_ID || 'walmart-mobile-a6865',
    storageBucket: Constants.expoConfig?.extra?.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: Constants.expoConfig?.extra?.FIREBASE_MESSAGING_SENDER_ID,
    appId: Constants.expoConfig?.extra?.FIREBASE_APP_ID,
} as const;

// Payment Method Types
export const PAYMENT_METHOD_TYPES = {
    CARD: 'card',
    PAYPAL: 'paypal',
    APPLE_PAY: 'apple_pay',
    GOOGLE_PAY: 'google_pay',
    BANK_ACCOUNT: 'bank_account',
} as const;

// Order Status Constants
export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded',
} as const;

// Payment Status Constants
export const PAYMENT_STATUS = {
    REQUIRES_PAYMENT_METHOD: 'requires_payment_method',
    REQUIRES_CONFIRMATION: 'requires_confirmation',
    REQUIRES_ACTION: 'requires_action',
    PROCESSING: 'processing',
    REQUIRES_CAPTURE: 'requires_capture',
    CANCELED: 'canceled',
    SUCCEEDED: 'succeeded',
} as const;

// Shipping Method Types
export const SHIPPING_TYPES = {
    STANDARD: 'standard',
    EXPEDITED: 'expedited',
    OVERNIGHT: 'overnight',
    SAME_DAY: 'same_day',
    TWO_DAY: 'two_day',
} as const;

// Tax Configuration
export const TAX_CONFIG = {
    defaultRate: 0.08, // 8% default tax rate
    exemptCategories: ['groceries', 'medicine'],
    taxableStates: ['CA', 'NY', 'TX', 'FL'], // States where tax is calculated
} as const;

// Promo Code Types
export const PROMO_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed',
    FREE_SHIPPING: 'free_shipping',
    BOGO: 'bogo',
} as const;

// Walmart+ Configuration
export const WALMART_PLUS_CONFIG = {
    monthlyPrice: 12.95,
    yearlyPrice: 98.00,
    benefits: [
        'Free shipping on orders',
        'Free grocery delivery',
        'Member prices on fuel',
        'Mobile Scan & Go',
        'Early access to deals',
    ],
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
    enableApplePay: true,
    enableGooglePay: true,
    enableBankPayments: false,
    enableSubscriptions: true,
    enablePushNotifications: true,
    enableAnalytics: true,
    enableChatSupport: false,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
    productCacheTTL: 5 * 60 * 1000, // 5 minutes
    cartCacheTTL: 30 * 60 * 1000, // 30 minutes
    userCacheTTL: 60 * 60 * 1000, // 1 hour
    paymentMethodsCacheTTL: 15 * 60 * 1000, // 15 minutes
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please try again.',
    PAYMENT_FAILED: 'Payment processing failed. Please try again.',
    INVALID_CARD: 'Invalid card information. Please check and try again.',
    EXPIRED_CARD: 'Your card has expired. Please use a different payment method.',
    INSUFFICIENT_FUNDS: 'Insufficient funds. Please try a different payment method.',
    GENERIC_ERROR: 'Something went wrong. Please try again later.',
    AUTHENTICATION_REQUIRED: 'Please sign in to continue.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    PAYMENT_SUCCESS: 'Payment processed successfully!',
    ORDER_PLACED: 'Your order has been placed successfully!',
    ACCOUNT_CREATED: 'Account created successfully!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PAYMENT_METHOD_ADDED: 'Payment method added successfully!',
    PAYMENT_METHOD_REMOVED: 'Payment method removed successfully!',
} as const;

// Firebase Functions URL Helper - ENHANCED: Better error handling and validation
export const getFirebaseFunctionUrl = (functionName: string): string => {
    if (!functionName) {
        throw new Error('Function name is required');
    }

    const baseUrl = API.baseURL;
    if (!baseUrl) {
        throw new Error('API base URL is not configured');
    }

    // Remove trailing slash from baseURL and leading slash from functionName
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanFunctionName = functionName.replace(/^\//, '');

    const fullUrl = `${cleanBaseUrl}/${cleanFunctionName}`;

    if (__DEV__) {
        console.log(`🔗 Firebase Function URL: ${fullUrl}`);
    }

    return fullUrl;
};

// API Helper Functions - ENHANCED: Added validation and better error handling
export const API_HELPERS = {
    // Get full URL for Firebase Functions
    getTaxCalculationUrl: () => getFirebaseFunctionUrl('calculateTax'),
    getShippingCalculationUrl: () => getFirebaseFunctionUrl('calculateShipping'),
    getPromoValidationUrl: () => getFirebaseFunctionUrl('validatePromoCode'),
    getPaymentIntentUrl: () => getFirebaseFunctionUrl('createPaymentIntent'),
    getSetupIntentUrl: () => getFirebaseFunctionUrl('createSetupIntent'),
    getConfirmPaymentUrl: () => getFirebaseFunctionUrl('confirmPayment'),
    getRefundUrl: () => getFirebaseFunctionUrl('createRefund'),
    getWebhookUrl: () => getFirebaseFunctionUrl('stripeWebhook'),
    getHealthCheckUrl: () => getFirebaseFunctionUrl('healthCheck'),

    // 🆕 NEW: URL validation helper
    validateUrl: (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },

    // 🆕 NEW: Test connection helper
    testConnection: async (): Promise<boolean> => {
        try {
            const healthUrl = API_HELPERS.getHealthCheckUrl();
            const response = await fetch(healthUrl, {
                method: 'GET',
                headers: REQUEST_CONFIG.headers,
                signal: AbortSignal.timeout(5000), // 5 second timeout
            });
            return response.ok;
        } catch (error) {
            console.error('❌ Connection test failed:', error);
            return false;
        }
    },
} as const;

// Environment Detection - ENHANCED: Better detection logic
export const ENV = {
    isDevelopment: __DEV__,
    isProduction: !__DEV__,
    isFirebaseEmulator: API.baseURL.includes('localhost') || API.baseURL.includes('127.0.0.1'),
    isFirebaseProduction: !API.baseURL.includes('localhost') && !API.baseURL.includes('127.0.0.1'),
    isTestMode: API.stripe.publishableKey.includes('pk_test_'),
    isLiveMode: API.stripe.publishableKey.includes('pk_live_'),
} as const;

// Logging Configuration
export const LOG_CONFIG = {
    enableConsoleLogging: ENV.isDevelopment,
    enableRemoteLogging: ENV.isProduction,
    logLevel: ENV.isDevelopment ? 'debug' : 'error',
} as const;

// Request Configuration - ENHANCED: Better timeout and retry logic
export const REQUEST_CONFIG = {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': `${APP_CONFIG.name}/${APP_CONFIG.version}`,
    },
    // 🆕 NEW: CORS configuration for Firebase Functions
    cors: {
        mode: 'cors' as RequestMode,
        credentials: 'omit' as RequestCredentials,
    },
} as const;

// 🆕 NEW: Configuration validation
export const validateConfiguration = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check API base URL
    if (!API.baseURL) {
        errors.push('API base URL is not configured');
    } else if (!API_HELPERS.validateUrl(API.baseURL)) {
        errors.push('API base URL is not a valid URL');
    }

    // Check Stripe configuration
    if (!API.stripe.publishableKey) {
        errors.push('Stripe publishable key is not configured');
    } else if (!API.stripe.publishableKey.startsWith('pk_')) {
        errors.push('Stripe publishable key format is invalid');
    }

    // Check Firebase project ID
    if (!FIREBASE_CONFIG.projectId) {
        errors.push('Firebase project ID is not configured');
    }

    // Warn about fallback mode in production
    if (ENV.isProduction && API.fallbackMode) {
        errors.push('WARNING: Fallback mode is enabled in production');
    }

    // Warn about test keys in production
    if (ENV.isProduction && ENV.isTestMode) {
        errors.push('WARNING: Using test Stripe keys in production');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

// Development Helpers - ENHANCED: Better debugging information
if (__DEV__) {
    console.log('🚀 Walmart Mobile App Configuration Loaded');
    console.log('📡 API Base URL:', API.baseURL);
    console.log('🔥 Firebase Project:', FIREBASE_CONFIG.projectId);
    console.log('🌍 Environment:', ENV.isFirebaseProduction ? 'PRODUCTION' : 'EMULATOR');
    console.log('💳 Stripe Mode:', ENV.isTestMode ? 'TEST' : 'LIVE');
    console.log('🛡️ Fallback Mode:', API.fallbackMode ? 'ENABLED' : 'DISABLED');

    // Validate configuration
    const validation = validateConfiguration();
    if (!validation.isValid) {
        console.warn('⚠️ Configuration Issues:');
        validation.errors.forEach(error => console.warn(`  - ${error}`));
    } else {
        console.log('✅ Configuration is valid');
    }

    // Test a sample URL
    try {
        const sampleUrl = API_HELPERS.getPaymentIntentUrl();
        console.log('🔗 Sample Function URL:', sampleUrl);
    } catch (error) {
        console.error('❌ URL generation failed:', error);
    }
}