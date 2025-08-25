// types/env.d.ts
declare module '@env' {
    // API Configuration
    export const API_BASE_URL: string;
    export const API_TIMEOUT: string;
    export const API_RETRY_ATTEMPTS: string;

    // Environment
    export const NODE_ENV: string;
    export const APP_ENV: string;

    // App Configuration
    export const APP_NAME: string;
    export const APP_VERSION: string;
    export const APP_BUNDLE_ID: string;
    export const APP_SCHEME: string;

    // Firebase Configuration
    export const FIREBASE_API_KEY: string;
    export const FIREBASE_AUTH_DOMAIN: string;
    export const FIREBASE_PROJECT_ID: string;
    export const FIREBASE_STORAGE_BUCKET: string;
    export const FIREBASE_MESSAGING_SENDER_ID: string;
    export const FIREBASE_APP_ID: string;
    export const FIREBASE_MEASUREMENT_ID: string;

    // Firebase Web Config
    export const FIREBASE_WEB_API_KEY: string;
    export const FIREBASE_WEB_AUTH_DOMAIN: string;
    export const FIREBASE_WEB_PROJECT_ID: string;

    // Stripe Configuration
    export const STRIPE_PUBLISHABLE_KEY: string;
    export const STRIPE_MERCHANT_ID: string;

    // Google Services
    export const GOOGLE_MAPS_API_KEY: string;
    export const GOOGLE_PLACES_API_KEY: string;
    export const GOOGLE_OAUTH_CLIENT_ID: string;
    export const GOOGLE_OAUTH_CLIENT_SECRET: string;

    // Apple Services
    export const APPLE_CLIENT_ID: string;
    export const APPLE_REDIRECT_URI: string;

    // Facebook Configuration
    export const FACEBOOK_APP_ID: string;
    export const FACEBOOK_CLIENT_TOKEN: string;

    // Analytics
    export const AMPLITUDE_API_KEY: string;
    export const GOOGLE_ANALYTICS_TRACKING_ID: string;

    // Push Notifications
    export const EXPO_PUSH_TOKEN: string;
    export const FCM_SERVER_KEY: string;

    // Deep Linking
    export const DEEP_LINK_SCHEME: string;
    export const UNIVERSAL_LINK_DOMAIN: string;

    // Feature Flags
    export const ENABLE_BIOMETRIC_AUTH: string;
    export const ENABLE_SOCIAL_LOGIN: string;
    export const ENABLE_PUSH_NOTIFICATIONS: string;
    export const ENABLE_LOCATION_SERVICES: string;
    export const ENABLE_WALMART_PLUS: string;
    export const ENABLE_BARCODE_SCANNER: string;
    export const ENABLE_CAMERA_FEATURES: string;
    export const ENABLE_ANALYTICS: string;
    export const ENABLE_CRASH_REPORTING: string;
    export const ENABLE_PERFORMANCE_MONITORING: string;

    // Security
    export const JWT_SECRET: string;
    export const ENCRYPTION_KEY: string;
    export const HMAC_SECRET: string;

    // External APIs
    export const WALMART_API_KEY: string;
    export const WALMART_API_SECRET: string;
    export const USPS_API_KEY: string;
    export const UPS_API_KEY: string;
    export const FEDEX_API_KEY: string;

    // Database
    export const DATABASE_URL: string;
    export const REDIS_URL: string;

    // AWS Services
    export const AWS_ACCESS_KEY_ID: string;
    export const AWS_SECRET_ACCESS_KEY: string;
    export const AWS_REGION: string;
    export const AWS_S3_BUCKET: string;

    // CDN & Assets
    export const CDN_BASE_URL: string;
    export const ASSETS_BASE_URL: string;
    export const IMAGE_BASE_URL: string;

    // Email Service
    export const SENDGRID_API_KEY: string;
    export const MAILGUN_API_KEY: string;
    export const SMTP_HOST: string;
    export const SMTP_PORT: string;
    export const SMTP_USER: string;
    export const SMTP_PASS: string;

    // SMS Service
    export const TWILIO_ACCOUNT_SID: string;
    export const TWILIO_AUTH_TOKEN: string;
    export const TWILIO_PHONE_NUMBER: string;

    // Monitoring & Logging
    export const SENTRY_DSN: string;
    export const BUGSNAG_API_KEY: string;
    export const DATADOG_API_KEY: string;

    // Development Tools
    export const FLIPPER_ENABLED: string;
    export const REACTOTRON_ENABLED: string;
    export const DEBUG_MODE: string;
    export const LOG_LEVEL: string;

    // Testing
    export const TEST_USER_EMAIL: string;
    export const TEST_USER_PASSWORD: string;
    export const MOCK_API_ENABLED: string;

    // Store Configuration
    export const DEFAULT_STORE_ID: string;
    export const STORE_LOCATOR_RADIUS: string;
    export const MAX_DELIVERY_DISTANCE: string;

    // Payment Configuration
    export const PAYMENT_PROCESSING_FEE: string;
    export const TAX_CALCULATION_SERVICE: string;
    export const CURRENCY: string;
    export const LOCALE: string;

    // Cache Configuration
    export const CACHE_TTL: string;
    export const CACHE_ENABLED: string;
    export const OFFLINE_CACHE_SIZE: string;

    // Rate Limiting
    export const API_RATE_LIMIT: string;
    export const API_RATE_WINDOW: string;

    // Expo Configuration
    export const EXPO_PROJECT_ID: string;
    export const EXPO_OWNER: string;
}