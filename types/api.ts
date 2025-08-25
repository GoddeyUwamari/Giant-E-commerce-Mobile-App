// Base API Response Types
export interface BaseApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
    field?: string;
    timestamp: string;
}

export interface ApiErrorResponse {
    success: false;
    error: ApiError;
    timestamp: string;
}

export interface PaginatedResponse<T> extends BaseApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Request/Response Headers
export interface ApiHeaders {
    'Content-Type'?: string;
    'Authorization'?: string;
    'X-API-Key'?: string;
    'X-Client-Version'?: string;
    'X-Platform'?: 'ios' | 'android' | 'web';
    'X-Device-ID'?: string;
    'X-Session-ID'?: string;
    'Accept-Language'?: string;
    'X-Store-ID'?: string;
    'X-User-Location'?: string;
}

// API Endpoints Configuration
export interface ApiEndpoints {
    // Authentication
    auth: {
        login: string;
        logout: string;
        refresh: string;
        register: string;
        forgotPassword: string;
        resetPassword: string;
        verifyEmail: string;
        verifyPhone: string;
        socialAuth: string;
        biometricAuth: string;
    };

    // User Management
    user: {
        profile: string;
        addresses: string;
        paymentMethods: string;
        preferences: string;
        activity: string;
        statistics: string;
        subscription: string;
        loyalty: string;
        support: string;
    };

    // Products
    products: {
        search: string;
        details: string;
        reviews: string;
        recommendations: string;
        categories: string;
        trending: string;
        deals: string;
        availability: string;
        compare: string;
        wishlist: string;
    };

    // Cart & Checkout
    cart: {
        items: string;
        add: string;
        update: string;
        remove: string;
        clear: string;
        sync: string;
        promos: string;
        estimate: string;
    };

    // Orders
    orders: {
        create: string;
        list: string;
        details: string;
        track: string;
        cancel: string;
        return: string;
        reorder: string;
        invoice: string;
    };

    // Stores
    stores: {
        list: string;
        details: string;
        hours: string;
        services: string;
        inventory: string;
        directions: string;
    };

    // Notifications
    notifications: {
        list: string;
        mark: string;
        settings: string;
        subscribe: string;
        unsubscribe: string;
    };

    // Analytics
    analytics: {
        events: string;
        pageView: string;
        conversion: string;
        error: string;
    };
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Request Configuration
export interface ApiRequestConfig {
    method: HttpMethod;
    url: string;
    headers?: ApiHeaders;
    params?: Record<string, any>;
    body?: any;
    timeout?: number;
    retries?: number;
    cache?: boolean | number; // boolean or TTL in milliseconds
    auth?: boolean;
    skipInterceptors?: boolean;
    responseType?: 'json' | 'text' | 'blob' | 'arrayBuffer';
}

// Search & Filtering
export interface SearchParams {
    query?: string;
    category?: string;
    brand?: string;
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    sortBy?: 'relevance' | 'price' | 'rating' | 'newest' | 'popularity';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
    filters?: Record<string, any>;
}

export interface SearchResponse<T> extends PaginatedResponse<T> {
    query: string;
    filters: {
        applied: Record<string, any>;
        available: Record<string, Array<{ value: string; count: number }>>;
    };
    suggestions?: string[];
    correctedQuery?: string;
    searchTime: number;
}

// Geolocation
export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: {
        street?: string;
        city?: string;
        state?: string;
        zipCode?: string;
        country?: string;
    };
    timestamp: string;
}

// File Upload
export interface FileUploadResponse {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
    uploadId: string;
    timestamp: string;
}

export interface FileUploadParams {
    file: File | Blob;
    filename?: string;
    folder?: string;
    public?: boolean;
    maxSize?: number;
    allowedTypes?: string[];
}

// Batch Operations
export interface BatchRequest {
    id: string;
    method: HttpMethod;
    url: string;
    body?: any;
    headers?: Record<string, string>;
}

export interface BatchResponse {
    id: string;
    status: number;
    data?: any;
    error?: ApiError;
}

// Real-time / WebSocket
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: string;
    id?: string;
}

export interface SubscriptionParams {
    channel: string;
    filters?: Record<string, any>;
    userId?: string;
    storeId?: string;
}

// API Rate Limiting
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    reset: number;
    retryAfter?: number;
}

export interface RateLimitResponse extends ApiErrorResponse {
    rateLimit: RateLimitInfo;
}

// Health Check
export interface HealthCheckResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    version: string;
    timestamp: string;
    services: {
        database: 'up' | 'down';
        cache: 'up' | 'down';
        search: 'up' | 'down';
        payment: 'up' | 'down';
        notifications: 'up' | 'down';
    };
    responseTime: number;
}

// Content Management
export interface ContentItem {
    id: string;
    type: 'banner' | 'promotion' | 'announcement' | 'feature';
    title: string;
    content: string;
    image?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    priority: number;
    targeting?: {
        userType?: string[];
        location?: string[];
        platform?: string[];
    };
}

// A/B Testing
export interface ExperimentVariant {
    id: string;
    name: string;
    weight: number;
    config: Record<string, any>;
}

export interface ExperimentResponse {
    experimentId: string;
    variantId: string;
    config: Record<string, any>;
    trackingId: string;
}

// Feature Flags
export interface FeatureFlag {
    key: string;
    enabled: boolean;
    value?: any;
    conditions?: {
        userType?: string[];
        platform?: string[];
        version?: string[];
        percentage?: number;
    };
}

export interface FeatureFlagsResponse {
    flags: Record<string, FeatureFlag>;
    userId?: string;
    context: Record<string, any>;
}

// Analytics Events
export interface AnalyticsEvent {
    event: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
    properties?: Record<string, any>;
    userId?: string;
    sessionId?: string;
    timestamp?: string;
}

export interface PageViewEvent {
    page: string;
    title?: string;
    referrer?: string;
    userId?: string;
    sessionId?: string;
    timestamp?: string;
    properties?: Record<string, any>;
}

// Error Tracking
export interface ErrorEvent {
    message: string;
    stack?: string;
    level: 'error' | 'warning' | 'info';
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    userId?: string;
    timestamp?: string;
    environment?: string;
    release?: string;
}

// Push Notifications
export interface PushNotificationPayload {
    title: string;
    body: string;
    icon?: string;
    image?: string;
    badge?: number;
    sound?: string;
    data?: Record<string, any>;
    actions?: Array<{
        action: string;
        title: string;
        icon?: string;
    }>;
}

export interface NotificationSubscription {
    endpoint: string;
    keys: {
        p256dh: string;
        auth: string;
    };
    userId?: string;
    deviceId?: string;
    platform?: string;
}

// Payment Processing
export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
    clientSecret: string;
    paymentMethods: string[];
    metadata?: Record<string, any>;
}

export interface PaymentMethod {
    id: string;
    type: 'card' | 'bank_account' | 'digital_wallet';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
    fingerprint?: string;
    isDefault: boolean;
}

// Inventory & Availability
export interface InventoryInfo {
    productId: string;
    storeId: string;
    quantity: number;
    reserved: number;
    available: number;
    status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
    restockDate?: string;
    lastUpdated: string;
}

export interface BulkInventoryRequest {
    products: Array<{
        productId: string;
        storeId: string;
    }>;
}

// Recommendations
export interface RecommendationRequest {
    userId?: string;
    productId?: string;
    category?: string;
    type: 'similar' | 'complementary' | 'trending' | 'personalized';
    limit?: number;
    excludeOwned?: boolean;
}

export interface RecommendationResponse {
    recommendations: Array<{
        productId: string;
        score: number;
        reason: string;
        metadata?: Record<string, any>;
    }>;
    algorithm: string;
    requestId: string;
}

// API Client Configuration
export interface ApiClientConfig {
    baseURL: string;
    timeout: number;
    retries: number;
    headers: ApiHeaders;
    interceptors: {
        request: boolean;
        response: boolean;
        auth: boolean;
        error: boolean;
    };
    cache: {
        enabled: boolean;
        ttl: number;
        maxSize: number;
    };
    retry: {
        enabled: boolean;
        attempts: number;
        delay: number;
        backoff: 'linear' | 'exponential';
    };
    offline: {
        enabled: boolean;
        queueSize: number;
        storage: 'memory' | 'persistent';
    };
}

// Environment Configuration
export interface ApiEnvironment {
    name: 'development' | 'staging' | 'production';
    baseURL: string;
    endpoints: ApiEndpoints;
    features: {
        analytics: boolean;
        errorTracking: boolean;
        performanceMonitoring: boolean;
        debugLogging: boolean;
    };
    limits: {
        requestTimeout: number;
        maxRetries: number;
        rateLimitWindow: number;
        rateLimitRequests: number;
    };
}

// Type Guards
export const isApiError = (response: any): response is ApiErrorResponse => {
    return response && !response.success && response.error;
};

export const isPaginatedResponse = <T>(response: any): response is PaginatedResponse<T> => {
    return response && response.success && response.pagination;
};

export const isRateLimitError = (response: any): response is RateLimitResponse => {
    return isApiError(response) && response.error.code === 'RATE_LIMIT_EXCEEDED';
};

// Utility Types
export type ApiResponse<T> = BaseApiResponse<T> | ApiErrorResponse;
export type AsyncApiResponse<T> = Promise<ApiResponse<T>>;

// Request Builder
export interface RequestBuilder {
    method(method: HttpMethod): RequestBuilder;
    url(url: string): RequestBuilder;
    headers(headers: ApiHeaders): RequestBuilder;
    params(params: Record<string, any>): RequestBuilder;
    body(body: any): RequestBuilder;
    timeout(timeout: number): RequestBuilder;
    cache(cache: boolean | number): RequestBuilder;
    auth(auth: boolean): RequestBuilder;
    build(): ApiRequestConfig;
}

// Response Interceptor
export interface ResponseInterceptor<T = any> {
    onSuccess?: (response: BaseApiResponse<T>) => BaseApiResponse<T> | Promise<BaseApiResponse<T>>;
    onError?: (error: ApiErrorResponse) => ApiErrorResponse | Promise<ApiErrorResponse>;
}

// Request Interceptor
export interface RequestInterceptor {
    onRequest?: (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
    onError?: (error: Error) => Error | Promise<Error>;
}

// Export default configuration
export const DEFAULT_API_CONFIG: ApiClientConfig = {
    baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.walmart.com/v1',
    timeout: 30000,
    retries: 3,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': 'mobile',
    },
    interceptors: {
        request: true,
        response: true,
        auth: true,
        error: true,
    },
    cache: {
        enabled: true,
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 100,
    },
    retry: {
        enabled: true,
        attempts: 3,
        delay: 1000,
        backoff: 'exponential',
    },
    offline: {
        enabled: true,
        queueSize: 50,
        storage: 'persistent',
    },
};