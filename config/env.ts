// Environment Configuration
// Centralized environment variables and configuration management

import Constants from 'expo-constants';

// Environment Types
export type Environment = 'development' | 'staging' | 'production';

// Environment Detection
export const getEnvironment = (): Environment => {
    if (__DEV__) return 'development';

    const releaseChannel = Constants.expoConfig?.extra?.releaseChannel;

    switch (releaseChannel) {
        case 'staging':
            return 'staging';
        case 'production':
            return 'production';
        default:
            return 'development';
    }
};

export const ENV = getEnvironment();
export const isDevelopment = ENV === 'development';
export const isStaging = ENV === 'staging';
export const isProduction = ENV === 'production';

// Environment-specific Configuration
interface EnvConfig {
    API_BASE_URL: string;
    API_VERSION: string;
    SOCKET_URL: string;
    CDN_URL: string;

    // Analytics
    AMPLITUDE_API_KEY: string;
    FIREBASE_CONFIG: {
        apiKey: string;
        authDomain: string;
        projectId: string;
        storageBucket: string;
        messagingSenderId: string;
        appId: string;
        measurementId?: string;
    };

    // Payment Processing
    STRIPE_PUBLISHABLE_KEY: string;

    // Maps & Location
    GOOGLE_MAPS_API_KEY: string;

    // External Services
    SENTRY_DSN: string;
    BUGSNAG_API_KEY: string;

    // Feature Flags Service
    LAUNCHDARKLY_MOBILE_KEY: string;

    // Push Notifications
    ONESIGNAL_APP_ID: string;

    // Social Login
    GOOGLE_CLIENT_ID: string;
    FACEBOOK_APP_ID: string;
    APPLE_SERVICE_ID: string;

    // Debug & Testing
    FLIPPER_ENABLED: boolean;
    LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
    ENABLE_NETWORK_LOGGING: boolean;
    ENABLE_REDUX_LOGGING: boolean;

    // Security
    API_TIMEOUT: number;
    CERTIFICATE_PINNING: boolean;
    OBFUSCATION_ENABLED: boolean;
}

// Development Environment
const developmentConfig: EnvConfig = {
    API_BASE_URL: 'https://api-dev.walmart.com',
    API_VERSION: 'v1',
    SOCKET_URL: 'wss://ws-dev.walmart.com',
    CDN_URL: 'https://cdn-dev.walmart.com',

    // Analytics - Development Keys
    AMPLITUDE_API_KEY: 'dev_amplitude_key_here',
    FIREBASE_CONFIG: {
        apiKey: 'dev_firebase_api_key',
        authDomain: 'walmart-dev.firebaseapp.com',
        projectId: 'walmart-dev',
        storageBucket: 'walmart-dev.appspot.com',
        messagingSenderId: 'dev_sender_id',
        appId: 'dev_app_id',
        measurementId: 'dev_measurement_id',
    },

    // Payment - Test Keys
    STRIPE_PUBLISHABLE_KEY: 'pk_test_dev_stripe_key',

    // Maps
    GOOGLE_MAPS_API_KEY: 'dev_google_maps_key',

    // Error Tracking - Development
    SENTRY_DSN: 'https://dev_sentry_dsn@sentry.io/dev_project',
    BUGSNAG_API_KEY: 'dev_bugsnag_key',

    // Feature Flags
    LAUNCHDARKLY_MOBILE_KEY: 'mob-dev-launchdarkly-key',

    // Push Notifications
    ONESIGNAL_APP_ID: 'dev_onesignal_app_id',

    // Social Login - Development
    GOOGLE_CLIENT_ID: 'dev_google_client_id.apps.googleusercontent.com',
    FACEBOOK_APP_ID: 'dev_facebook_app_id',
    APPLE_SERVICE_ID: 'com.walmart.dev.signin',

    // Debug Settings
    FLIPPER_ENABLED: true,
    LOG_LEVEL: 'debug',
    ENABLE_NETWORK_LOGGING: true,
    ENABLE_REDUX_LOGGING: true,

    // Security - Relaxed for Development
    API_TIMEOUT: 60000,
    CERTIFICATE_PINNING: false,
    OBFUSCATION_ENABLED: false,
};

// Staging Environment
const stagingConfig: EnvConfig = {
    API_BASE_URL: 'https://api-staging.walmart.com',
    API_VERSION: 'v1',
    SOCKET_URL: 'wss://ws-staging.walmart.com',
    CDN_URL: 'https://cdn-staging.walmart.com',

    // Analytics - Staging Keys
    AMPLITUDE_API_KEY: 'staging_amplitude_key_here',
    FIREBASE_CONFIG: {
        apiKey: 'staging_firebase_api_key',
        authDomain: 'walmart-staging.firebaseapp.com',
        projectId: 'walmart-staging',
        storageBucket: 'walmart-staging.appspot.com',
        messagingSenderId: 'staging_sender_id',
        appId: 'staging_app_id',
        measurementId: 'staging_measurement_id',
    },

    // Payment - Test Keys
    STRIPE_PUBLISHABLE_KEY: 'pk_test_staging_stripe_key',

    // Maps
    GOOGLE_MAPS_API_KEY: 'staging_google_maps_key',

    // Error Tracking - Staging
    SENTRY_DSN: 'https://staging_sentry_dsn@sentry.io/staging_project',
    BUGSNAG_API_KEY: 'staging_bugsnag_key',

    // Feature Flags
    LAUNCHDARKLY_MOBILE_KEY: 'mob-staging-launchdarkly-key',

    // Push Notifications
    ONESIGNAL_APP_ID: 'staging_onesignal_app_id',

    // Social Login - Staging
    GOOGLE_CLIENT_ID: 'staging_google_client_id.apps.googleusercontent.com',
    FACEBOOK_APP_ID: 'staging_facebook_app_id',
    APPLE_SERVICE_ID: 'com.walmart.staging.signin',

    // Debug Settings
    FLIPPER_ENABLED: true,
    LOG_LEVEL: 'info',
    ENABLE_NETWORK_LOGGING: true,
    ENABLE_REDUX_LOGGING: false,

    // Security - Moderate
    API_TIMEOUT: 30000,
    CERTIFICATE_PINNING: true,
    OBFUSCATION_ENABLED: false,
};

// Production Environment
const productionConfig: EnvConfig = {
    API_BASE_URL: 'https://api.walmart.com',
    API_VERSION: 'v1',
    SOCKET_URL: 'wss://ws.walmart.com',
    CDN_URL: 'https://cdn.walmart.com',

    // Analytics - Production Keys
    AMPLITUDE_API_KEY: 'prod_amplitude_key_here',
    FIREBASE_CONFIG: {
        apiKey: 'prod_firebase_api_key',
        authDomain: 'walmart-prod.firebaseapp.com',
        projectId: 'walmart-prod',
        storageBucket: 'walmart-prod.appspot.com',
        messagingSenderId: 'prod_sender_id',
        appId: 'prod_app_id',
        measurementId: 'prod_measurement_id',
    },

    // Payment - Live Keys
    STRIPE_PUBLISHABLE_KEY: 'pk_live_prod_stripe_key',

    // Maps
    GOOGLE_MAPS_API_KEY: 'prod_google_maps_key',

    // Error Tracking - Production
    SENTRY_DSN: 'https://prod_sentry_dsn@sentry.io/prod_project',
    BUGSNAG_API_KEY: 'prod_bugsnag_key',

    // Feature Flags
    LAUNCHDARKLY_MOBILE_KEY: 'mob-prod-launchdarkly-key',

    // Push Notifications
    ONESIGNAL_APP_ID: 'prod_onesignal_app_id',

    // Social Login - Production
    GOOGLE_CLIENT_ID: 'prod_google_client_id.apps.googleusercontent.com',
    FACEBOOK_APP_ID: 'prod_facebook_app_id',
    APPLE_SERVICE_ID: 'com.walmart.signin',

    // Debug Settings - Disabled in Production
    FLIPPER_ENABLED: false,
    LOG_LEVEL: 'error',
    ENABLE_NETWORK_LOGGING: false,
    ENABLE_REDUX_LOGGING: false,

    // Security - Maximum
    API_TIMEOUT: 30000,
    CERTIFICATE_PINNING: true,
    OBFUSCATION_ENABLED: true,
};

// Configuration Selector
const getConfig = (): EnvConfig => {
    switch (ENV) {
        case 'development':
            return developmentConfig;
        case 'staging':
            return stagingConfig;
        case 'production':
            return productionConfig;
        default:
            return developmentConfig;
    }
};

// Export Current Configuration
export const config = getConfig();

// Environment Utilities
export const envUtils = {
    // Check if running in development
    isDev: isDevelopment,

    // Check if running in staging
    isStaging,

    // Check if running in production
    isProd: isProduction,

    // Get current environment name
    getEnv: () => ENV,

    // Check if debug features should be enabled
    isDebugEnabled: () => isDevelopment || isStaging,

    // Check if analytics should be enabled
    isAnalyticsEnabled: () => isStaging || isProduction,

    // Check if crash reporting should be enabled
    isCrashReportingEnabled: () => isStaging || isProduction,

    // Check if performance monitoring should be enabled
    isPerformanceMonitoringEnabled: () => isProduction,

    // Get log level for current environment
    getLogLevel: () => config.LOG_LEVEL,

    // Check if network logging is enabled
    isNetworkLoggingEnabled: () => config.ENABLE_NETWORK_LOGGING,

    // Check if Redux logging is enabled
    isReduxLoggingEnabled: () => config.ENABLE_REDUX_LOGGING,

    // Get API configuration
    getApiConfig: () => ({
        baseURL: config.API_BASE_URL,
        version: config.API_VERSION,
        timeout: config.API_TIMEOUT,
    }),

    // Get Firebase configuration
    getFirebaseConfig: () => config.FIREBASE_CONFIG,

    // Get feature flag configuration
    getFeatureFlagConfig: () => ({
        mobileKey: config.LAUNCHDARKLY_MOBILE_KEY,
    }),

    // Get analytics configuration
    getAnalyticsConfig: () => ({
        amplitudeApiKey: config.AMPLITUDE_API_KEY,
        firebaseConfig: config.FIREBASE_CONFIG,
    }),

    // Get error tracking configuration
    getErrorTrackingConfig: () => ({
        sentryDsn: config.SENTRY_DSN,
        bugsnagApiKey: config.BUGSNAG_API_KEY,
    }),

    // Get push notification configuration
    getPushConfig: () => ({
        oneSignalAppId: config.ONESIGNAL_APP_ID,
    }),

    // Get social login configuration
    getSocialLoginConfig: () => ({
        googleClientId: config.GOOGLE_CLIENT_ID,
        facebookAppId: config.FACEBOOK_APP_ID,
        appleServiceId: config.APPLE_SERVICE_ID,
    }),

    // Get security configuration
    getSecurityConfig: () => ({
        certificatePinning: config.CERTIFICATE_PINNING,
        obfuscationEnabled: config.OBFUSCATION_ENABLED,
    }),
};

// Environment-specific feature toggles
export const environmentFeatures = {
    // Development only features
    development: {
        MOCK_DATA: true,
        DEBUG_PANEL: true,
        PERFORMANCE_OVERLAY: true,
        NETWORK_INSPECTOR: true,
        REDUX_DEVTOOLS: true,
    },

    // Staging features
    staging: {
        MOCK_DATA: false,
        DEBUG_PANEL: true,
        PERFORMANCE_OVERLAY: false,
        NETWORK_INSPECTOR: true,
        REDUX_DEVTOOLS: false,
        BETA_FEATURES: true,
    },

    // Production features
    production: {
        MOCK_DATA: false,
        DEBUG_PANEL: false,
        PERFORMANCE_OVERLAY: false,
        NETWORK_INSPECTOR: false,
        REDUX_DEVTOOLS: false,
        BETA_FEATURES: false,
    },
};

// Get current environment features
export const currentFeatures = environmentFeatures[ENV];

// Environment validation
export const validateEnvironment = (): boolean => {
    const requiredKeys = [
        'API_BASE_URL',
        'FIREBASE_CONFIG',
        'STRIPE_PUBLISHABLE_KEY',
        'GOOGLE_MAPS_API_KEY',
    ];

    return requiredKeys.every(key => {
        const value = config[key as keyof EnvConfig];
        return value !== undefined && value !== '';
    });
};

// Export environment info for debugging
export const environmentInfo = {
    environment: ENV,
    config: isDevelopment ? config : { API_BASE_URL: config.API_BASE_URL }, // Only expose minimal info in production
    features: currentFeatures,
    isValid: validateEnvironment(),
    buildTime: new Date().toISOString(),
    version: Constants.expoConfig?.version || '1.0.0',
    buildNumber: Constants.expoConfig?.extra?.buildNumber || '1',
};