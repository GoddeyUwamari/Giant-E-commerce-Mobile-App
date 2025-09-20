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

    // API Keys (client-safe)
    export const ANTHROPIC_API_KEY: string;
    export const STRIPE_PUBLISHABLE_KEY: string;

    // Google Services (separated by platform)
    export const GOOGLE_MAPS_API_KEY_IOS: string;
    export const GOOGLE_MAPS_API_KEY_ANDROID: string;
    export const GOOGLE_PLACES_API_KEY: string;
    export const GOOGLE_OAUTH_CLIENT_ID: string;

    // Google Sign-In Client IDs
    export const GOOGLE_CLIENT_ID_WEB: string;
    export const GOOGLE_CLIENT_ID_IOS: string;
    export const GOOGLE_CLIENT_ID_ANDROID: string;

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
    export const ENABLE_BARCODE_SCANNER: string;
    export const ENABLE_CAMERA_FEATURES: string;
    export const ENABLE_ANALYTICS: string;
    export const ENABLE_CRASH_REPORTING: string;
    export const ENABLE_PERFORMANCE_MONITORING: string;

    // External APIs (client-safe only)
    export const WALMART_API_KEY: string;
    export const USPS_API_KEY: string;
    export const UPS_API_KEY: string;
    export const FEDEX_API_KEY: string;

    // CDN & Assets
    export const CDN_BASE_URL: string;
    export const ASSETS_BASE_URL: string;
    export const IMAGE_BASE_URL: string;

    // Monitoring & Logging (client-safe)
    export const SENTRY_DSN: string;
    export const BUGSNAG_API_KEY: string;

    // Development Tools
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

    // REMOVED - These should NEVER be in client-side code:
    // JWT_SECRET, ENCRYPTION_KEY, HMAC_SECRET
    // WALMART_API_SECRET, GOOGLE_OAUTH_CLIENT_SECRET
    // DATABASE_URL, REDIS_URL
    // AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
    // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    // TWILIO_AUTH_TOKEN (only SID and phone number are client-safe)
}