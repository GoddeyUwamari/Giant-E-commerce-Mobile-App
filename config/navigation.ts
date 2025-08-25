// Navigation Configuration
// Centralized navigation structure and routing configuration for Walmart Mobile App
// Updated for Expo Router compatibility

import { Ionicons } from '@expo/vector-icons';

// Navigation Route Names - Updated for Expo Router
export const ROUTES = {
    // Auth Stack (file-based routing)
    AUTH: {
        STACK: '/(auth)',
        WELCOME: '/(auth)/welcome',
        LOGIN: '/(auth)/login',
        REGISTER: '/(auth)/register',
        FORGOT_PASSWORD: '/(auth)/forgot-password',
        RESET_PASSWORD: '/(auth)/reset-password',
        VERIFY_EMAIL: '/(auth)/verify-email',
        BIOMETRIC_SETUP: '/(auth)/biometric-setup',
    },

    // Onboarding Stack
    ONBOARDING: {
        STACK: '/(onboarding)',
        INTRO: '/(onboarding)/intro',
        PERMISSIONS: '/(onboarding)/permissions',
        LOCATION_SETUP: '/(onboarding)/location-setup',
        NOTIFICATIONS_SETUP: '/(onboarding)/notifications-setup',
        PREFERENCES: '/(onboarding)/preferences',
        COMPLETE: '/(onboarding)/complete',
    },

    // Main Tab Navigation
    TABS: {
        ROOT: '/(tabs)/',
        HOME: '/(tabs)/',
        SEARCH: '/(tabs)/search',
        CART: '/(tabs)/cart',
        ACCOUNT: '/(tabs)/account',
        SERVICES: '/(tabs)/services',
    },

    // Home Stack - Note: These would be part of the home tab or separate routes
    HOME: {
        STACK: '/(tabs)/',
        MAIN: '/(tabs)/',
        CATEGORIES: '/categories',
        CATEGORY_DETAIL: '/category/[slug]',
        DEALS: '/deals',
        TRENDING: '/trending',
        RECOMMENDATIONS: '/recommendations',
    },

    // Search Stack
    SEARCH: {
        STACK: '/(tabs)/search',
        MAIN: '/(tabs)/search',
        RESULTS: '/search/results',
        FILTERS: '/search/filters',
        VOICE_SEARCH: '/search/voice',
        BARCODE_SCANNER: '/search/barcode',
        VISUAL_SEARCH: '/search/visual',
    },

    // Product Stack
    PRODUCT: {
        STACK: '/product',
        DETAIL: '/product/[id]',
        REVIEWS: '/product/[id]/reviews',
        WRITE_REVIEW: '/product/[id]/write-review',
        GALLERY: '/product/[id]/gallery',
        COMPARE: '/product/compare',
        SPECIFICATIONS: '/product/[id]/specifications',
        QA: '/product/[id]/qa',
        SIMILAR_PRODUCTS: '/product/[id]/similar',
    },

    // Cart Stack - Note: Cart is a tab, checkout is separate
    CART: {
        STACK: '/(tabs)/cart',
        MAIN: '/(tabs)/cart',
        CHECKOUT: '/checkout',
        SHIPPING: '/checkout/shipping',
        PAYMENT: '/checkout/payment',
        REVIEW_ORDER: '/checkout/review',
        ORDER_CONFIRMATION: '/checkout/confirmation',
        SAVED_ITEMS: '/cart/saved-items',
    },

    // Account Stack
    ACCOUNT: {
        STACK: '/(tabs)/account',
        MAIN: '/(tabs)/account',
        PROFILE: '/profile/account',
        EDIT_PROFILE: '/profile/edit',
        ADDRESSES: '/profile/addresses',
        ADD_ADDRESS: '/profile/addresses/add',
        EDIT_ADDRESS: '/profile/addresses/[id]',
        PAYMENT_METHODS: '/profile/payment-methods',
        ADD_PAYMENT: '/profile/payment-methods/add',
        EDIT_PAYMENT: '/profile/payment-methods/[id]',
        ORDER_HISTORY: '/orders',
        ORDER_DETAIL: '/orders/[orderId]',
        TRACK_ORDER: '/orders/[orderId]/track',
        RETURN_ORDER: '/orders/[orderId]/return',
        WISHLIST: '/profile/favorites',
        NOTIFICATIONS: '/profile/notifications',
        PREFERENCES: '/profile/preferences',
        SECURITY: '/profile/security',
        PRIVACY: '/profile/privacy',
        HELP: '/support/help',
        CONTACT_SUPPORT: '/support/contact',
    },

    // Services Stack
    SERVICES: {
        STACK: '/(tabs)/services',
        MAIN: '/(tabs)/services',
        PHARMACY: '/services/pharmacy',
        PHOTO: '/services/photo',
        MONEY_SERVICES: '/services/money',
        VISION_CENTER: '/services/vision',
        AUTO_CARE: '/services/auto',
        WALMART_PLUS: '/services/plus',
        GIFT_CARDS: '/services/gift-cards',
        MARKETPLACE: '/services/marketplace',
    },

    // Store Stack
    STORE: {
        STACK: '/store',
        FINDER: '/store/locator',
        DETAIL: '/store/[storeId]',
        MAP: '/store/map',
        HOURS: '/store/[storeId]/hours',
        SERVICES: '/store/[storeId]/services',
        DIRECTIONS: '/store/[storeId]/directions',
        PICKUP: '/store/[storeId]/pickup',
    },

    // Modals - Using (modals) group route
    MODALS: {
        FILTER: '/(modals)/filter',
        SORT: '/(modals)/sort',
        STORE_SELECTOR: '/(modals)/store-selector',
        LOCATION_PERMISSION: '/(modals)/location-permission',
        CAMERA_PERMISSION: '/(modals)/camera-permission',
        NOTIFICATION_PERMISSION: '/(modals)/notification-permission',
        BIOMETRIC_PROMPT: '/(modals)/biometric-prompt',
        LOGOUT_CONFIRMATION: '/(modals)/logout-confirmation',
        DELETE_CONFIRMATION: '/(modals)/delete-confirmation',
        ADD_TO_CART: '/(modals)/add-to-cart',
        QUICK_VIEW: '/(modals)/quick-view',
        SHARE: '/(modals)/share',
        FEEDBACK: '/(modals)/feedback',
        RATE_APP: '/(modals)/rate-app',
    },

    // Legal
    LEGAL: {
        PRIVACY: '/legal/privacy',
        TERMS: '/legal/terms',
    },

    // Support
    SUPPORT: {
        HELP: '/support/help',
        CONTACT: '/support/contact',
        CHAT: '/support/chat',
    },
} as const;

// Tab Bar Configuration
export const TAB_CONFIG = [
    {
        name: 'index', // expo-router tab name
        route: ROUTES.TABS.HOME,
        title: 'Shop',
        icon: 'storefront-outline' as keyof typeof Ionicons.glyphMap,
        iconFocused: 'storefront' as keyof typeof Ionicons.glyphMap,
        badge: null,
    },
    {
        name: 'search',
        route: ROUTES.TABS.SEARCH,
        title: 'Search',
        icon: 'search-outline' as keyof typeof Ionicons.glyphMap,
        iconFocused: 'search' as keyof typeof Ionicons.glyphMap,
        badge: null,
    },
    {
        name: 'services',
        route: ROUTES.TABS.SERVICES,
        title: 'Services',
        icon: 'apps-outline' as keyof typeof Ionicons.glyphMap,
        iconFocused: 'apps' as keyof typeof Ionicons.glyphMap,
        badge: 'New',
    },
    {
        name: 'account',
        route: ROUTES.TABS.ACCOUNT,
        title: 'Account',
        icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap,
        iconFocused: 'person-circle' as keyof typeof Ionicons.glyphMap,
        badge: 'notificationCount', // Dynamic badge from state
    },
] as const;

// Navigation Screen Options (for expo-router Stack.Screen options)
export const SCREEN_OPTIONS = {
    // Default header style
    DEFAULT_HEADER: {
        headerStyle: {
            backgroundColor: '#FFFFFF',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600' as const,
            color: '#111827',
        },
        headerTintColor: '#374151',
        headerBackTitleVisible: false,
    },

    // Walmart branded header
    WALMART_HEADER: {
        headerStyle: {
            backgroundColor: '#0071CE',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
        },
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600' as const,
            color: '#FFFFFF',
        },
        headerTintColor: '#FFFFFF',
        headerBackTitleVisible: false,
    },

    // Transparent header
    TRANSPARENT_HEADER: {
        headerStyle: {
            backgroundColor: 'transparent',
            shadowColor: 'transparent',
            elevation: 0,
        },
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600' as const,
            color: '#111827',
        },
        headerTintColor: '#374151',
        headerBackTitleVisible: false,
        headerTransparent: true,
    },

    // No header
    NO_HEADER: {
        headerShown: false,
    },

    // Modal presentation
    MODAL: {
        presentation: 'modal' as const,
        headerStyle: {
            backgroundColor: '#FFFFFF',
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
        },
        headerTitleStyle: {
            fontSize: 18,
            fontWeight: '600' as const,
            color: '#111827',
        },
        headerTintColor: '#374151',
    },

    // Full screen modal
    FULL_SCREEN_MODAL: {
        presentation: 'fullScreenModal' as const,
        headerShown: false,
    },
} as const;

// Navigation Animations (for expo-router)
export const ANIMATIONS = {
    // Slide from right (default in expo-router)
    SLIDE_FROM_RIGHT: 'slide_from_right',

    // Slide from bottom
    SLIDE_FROM_BOTTOM: 'slide_from_bottom',

    // Fade transition
    FADE: 'fade',

    // iOS specific
    IOS_SLIDE: 'ios',

    // Android specific
    ANDROID_FADE: 'fade_from_bottom',
} as const;

// Deep Link Configuration (for expo-router)
export const DEEP_LINK_CONFIG = {
    // Expo Router handles this automatically based on file structure
    // But you can still define custom schemes
    scheme: 'walmart',

    // Custom deep link handlers
    customPaths: {
        product: '/product/[id]',
        category: '/category/[slug]',
        store: '/store/[storeId]',
        order: '/orders/[orderId]',
        search: '/search/results',
    },
} as const;

// Screen Tracking Configuration for Analytics
export const SCREEN_TRACKING = {
    // Tab screens
    '/(tabs)/': { name: 'Home', category: 'Main' },
    '/(tabs)/search': { name: 'Search', category: 'Main' },
    '/(tabs)/services': { name: 'Services', category: 'Main' },
    '/(tabs)/account': { name: 'Account', category: 'Main' },

    // Product screens
    '/product/[id]': { name: 'Product Detail', category: 'Product' },
    '/product/[id]/reviews': { name: 'Product Reviews', category: 'Product' },
    '/product/[id]/gallery': { name: 'Product Gallery', category: 'Product' },

    // Checkout screens
    '/checkout': { name: 'Checkout', category: 'Purchase' },
    '/checkout/payment': { name: 'Payment', category: 'Purchase' },
    '/checkout/confirmation': { name: 'Order Confirmation', category: 'Purchase' },

    // Store screens
    '/store/locator': { name: 'Store Finder', category: 'Store' },
    '/store/[storeId]': { name: 'Store Detail', category: 'Store' },

    // Account screens
    '/profile/account': { name: 'Profile', category: 'Account' },
    '/orders': { name: 'Order History', category: 'Account' },
    '/profile/favorites': { name: 'Wishlist', category: 'Account' },
} as const;

// Route Helper Functions
export const navigationHelpers = {
    // Get route display name
    getRouteDisplayName: (routeName: string): string => {
        const tracking = SCREEN_TRACKING[routeName as keyof typeof SCREEN_TRACKING];
        return tracking?.name || routeName;
    },

    // Get route category
    getRouteCategory: (routeName: string): string => {
        const tracking = SCREEN_TRACKING[routeName as keyof typeof SCREEN_TRACKING];
        return tracking?.category || 'Other';
    },

    // Check if route should be tracked
    shouldTrackRoute: (routeName: string): boolean => {
        return routeName in SCREEN_TRACKING;
    },

    // Get tab config by name
    getTabConfig: (tabName: string) => {
        return TAB_CONFIG.find(tab => tab.name === tabName);
    },

    // Check if route is a modal
    isModalRoute: (routeName: string): boolean => {
        return routeName.includes('/(modals)/');
    },

    // Check if route is in auth stack
    isAuthRoute: (routeName: string): boolean => {
        return routeName.includes('/(auth)/');
    },

    // Check if route requires authentication
    requiresAuth: (routeName: string): boolean => {
        const publicRoutes = [
            '/(auth)/',
            '/(onboarding)/',
            '/(tabs)/',
            '/(tabs)/search',
            '/(tabs)/services',
            '/product/[id]',
            '/store/locator',
            '/store/[storeId]',
            '/legal/privacy',
            '/legal/terms',
            '/support/help',
        ];

        return !publicRoutes.some(route => routeName.includes(route));
    },

    // Generate dynamic routes
    getProductRoute: (productId: string) => `/product/${productId}`,
    getCategoryRoute: (slug: string) => `/category/${slug}`,
    getStoreRoute: (storeId: string) => `/store/${storeId}`,
    getOrderRoute: (orderId: string) => `/orders/${orderId}`,
    getAddressRoute: (addressId: string) => `/profile/addresses/${addressId}`,
    getPaymentMethodRoute: (paymentId: string) => `/profile/payment-methods/${paymentId}`,
} as const;

// Expo Router specific configurations
export const EXPO_ROUTER_CONFIG = {
    // Initial route name
    initialRouteName: '/(tabs)/',

    // Screen options for different route patterns
    screenOptions: {
        '/(tabs)': {
            headerShown: false,
            tabBarActiveTintColor: '#0071CE',
            tabBarInactiveTintColor: '#9E9E9E',
        },
        '/(auth)': {
            headerShown: false,
            presentation: 'modal',
        },
        '/(modals)': {
            presentation: 'modal',
            headerShown: true,
        },
        '/checkout': {
            headerShown: true,
            gestureEnabled: false,
        },
        '/product': {
            headerShown: false,
            animation: 'slide_from_right',
        },
    },
} as const;

// Export route type for type safety
export type RouteNames = typeof ROUTES[keyof typeof ROUTES][keyof typeof ROUTES[keyof typeof ROUTES]];

// Tab route names specifically
export type TabRoutes =
    | '/(tabs)/'
    | '/(tabs)/search'
    | '/(tabs)/services'
    | '/(tabs)/account';

// Auth route names
export type AuthRoutes =
    | '/(auth)/login'
    | '/(auth)/register'
    | '/(auth)/forgot-password'
    | '/(auth)/reset-password'
    | '/(auth)/verify-email';

// Modal route names
export type ModalRoutes = typeof ROUTES.MODALS[keyof typeof ROUTES.MODALS];