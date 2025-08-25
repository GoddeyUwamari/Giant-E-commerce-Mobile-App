import { useAppStore } from './slices/appSlice';
import { useAuthStore, authTokens } from './slices/authSlice';
import { useUserStore } from './slices/userSlice';
import secureStorage from './storage/secureStorage';
import asyncStorage, { STORAGE_KEYS } from './storage/asyncStorage';

// API Response interface
export interface APIResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        hasMore?: boolean;
    };
}

// Request configuration
export interface RequestConfig {
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    timeout?: number;
    retries?: number;
    cache?: boolean;
    auth?: boolean;
    skipInterceptors?: boolean;
}

// Cache entry
interface CacheEntry {
    data: any;
    timestamp: number;
    ttl: number;
}

// Request cache
const requestCache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default

// Request queue for retry logic
const requestQueue: Array<{
    config: RequestConfig;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    attempt: number;
}> = [];

// Network status
let isOnline = true;
let isProcessingQueue = false;

/**
 * Authentication Middleware
 * Handles token injection, refresh, and authentication errors
 */
export const authMiddleware = {
    // Request interceptor - adds auth headers
    request: async (config: RequestConfig): Promise<RequestConfig> => {
        if (config.auth !== false) {
            try {
                // Get access token
                const accessToken = await authTokens.getAccess();

                if (accessToken) {
                    // Validate token before using
                    const isValid = await authTokens.isAccessTokenValid();

                    if (isValid) {
                        config.headers = {
                            ...config.headers,
                            'Authorization': `Bearer ${accessToken}`,
                        };
                    } else {
                        // Try to refresh token
                        const refreshed = await authTokens.isRefreshTokenValid();
                        if (refreshed) {
                            await useAuthStore.getState().refreshTokens();
                            const newAccessToken = await authTokens.getAccess();
                            if (newAccessToken) {
                                config.headers = {
                                    ...config.headers,
                                    'Authorization': `Bearer ${newAccessToken}`,
                                };
                            }
                        } else {
                            // Redirect to login if refresh failed
                            await useAuthStore.getState().logout();
                            throw new Error('Authentication required');
                        }
                    }
                }
            } catch (error) {
                console.error('Auth middleware error:', error);
                if (config.auth === true) {
                    throw error;
                }
            }
        }

        return config;
    },

    // Response interceptor - handles auth errors
    response: async (response: Response, config: RequestConfig): Promise<Response> => {
        if (response.status === 401) {
            try {
                // Try to refresh token
                const refreshSuccess = await useAuthStore.getState().refreshTokens();

                if (refreshSuccess) {
                    // Retry the original request with new token
                    const newAccessToken = await authTokens.getAccess();
                    if (newAccessToken) {
                        config.headers = {
                            ...config.headers,
                            'Authorization': `Bearer ${newAccessToken}`,
                        };

                        // Retry the request
                        return fetch(config.url, {
                            method: config.method,
                            headers: config.headers,
                            body: config.body ? JSON.stringify(config.body) : undefined,
                        });
                    }
                }

                // Refresh failed, logout user
                await useAuthStore.getState().logout();
                throw new Error('Authentication expired');
            } catch (error) {
                console.error('Auth response middleware error:', error);
                throw error;
            }
        }

        return response;
    },
};

/**
 * Error Handling Middleware
 * Standardizes error responses and logging
 */
export const errorMiddleware = {
    // Global error handler
    handleError: (error: any, config: RequestConfig): APIResponse => {
        console.error('API Error:', {
            url: config.url,
            method: config.method,
            error: error.message,
            stack: error.stack,
        });

        // Log error to analytics
        useUserStore.getState().logActivity({
            type: 'support_contact',
            description: 'API Error',
            metadata: {
                url: config.url,
                method: config.method,
                error: error.message,
            },
        });

        // Categorize errors
        let errorCode = 'UNKNOWN_ERROR';
        let errorMessage = 'An unexpected error occurred';

        if (error.name === 'NetworkError' || error.message.includes('network')) {
            errorCode = 'NETWORK_ERROR';
            errorMessage = 'Network connection failed. Please check your internet connection.';
            useAppStore.getState().setOnlineStatus(false);
        } else if (error.name === 'TimeoutError' || error.message.includes('timeout')) {
            errorCode = 'TIMEOUT_ERROR';
            errorMessage = 'Request timed out. Please try again.';
        } else if (error.message.includes('Authentication')) {
            errorCode = 'AUTH_ERROR';
            errorMessage = 'Please log in to continue.';
        } else if (error.message.includes('Permission')) {
            errorCode = 'PERMISSION_ERROR';
            errorMessage = 'You do not have permission to perform this action.';
        }

        return {
            success: false,
            error: {
                code: errorCode,
                message: errorMessage,
                details: __DEV__ ? error : undefined,
            },
        };
    },

    // Network error handler
    handleNetworkError: (config: RequestConfig): void => {
        if (isOnline) {
            isOnline = false;
            useAppStore.getState().setOnlineStatus(false);

            // Show network error notification
            useAppStore.getState().setError('Network connection lost. Requests will be retried when connection is restored.');
        }
    },

    // Recovery handler when network comes back
    handleRecovery: (): void => {
        if (!isOnline) {
            isOnline = true;
            useAppStore.getState().setOnlineStatus(true);
            useAppStore.getState().clearError();

            // Process queued requests
            processRequestQueue();
        }
    },
};

/**
 * Caching Middleware
 * Handles request/response caching
 */
export const cacheMiddleware = {
    // Generate cache key
    generateKey: (config: RequestConfig): string => {
        const { url, method, body } = config;
        const bodyString = body ? JSON.stringify(body) : '';
        return `${method}:${url}:${bodyString}`;
    },

    // Get cached response
    get: (config: RequestConfig): any | null => {
        if (config.method !== 'GET' || config.cache === false) {
            return null;
        }

        const key = cacheMiddleware.generateKey(config);
        const entry = requestCache.get(key);

        if (entry && Date.now() - entry.timestamp < entry.ttl) {
            return entry.data;
        }

        if (entry) {
            requestCache.delete(key);
        }

        return null;
    },

    // Set cached response
    set: (config: RequestConfig, data: any, ttl: number = CACHE_TTL): void => {
        if (config.method !== 'GET' || config.cache === false) {
            return;
        }

        const key = cacheMiddleware.generateKey(config);
        requestCache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });

        // Clean up old entries
        cacheMiddleware.cleanup();
    },

    // Clear cache
    clear: (pattern?: string): void => {
        if (pattern) {
            for (const [key] of requestCache) {
                if (key.includes(pattern)) {
                    requestCache.delete(key);
                }
            }
        } else {
            requestCache.clear();
        }
    },

    // Cleanup expired entries
    cleanup: (): void => {
        const now = Date.now();
        for (const [key, entry] of requestCache) {
            if (now - entry.timestamp >= entry.ttl) {
                requestCache.delete(key);
            }
        }
    },
};

/**
 * Retry Middleware
 * Handles request retries with exponential backoff
 */
export const retryMiddleware = {
    // Add request to queue
    addToQueue: (
        config: RequestConfig,
        resolve: (value: any) => void,
        reject: (error: any) => void,
        attempt: number = 0
    ): void => {
        requestQueue.push({ config, resolve, reject, attempt });
    },

    // Process retry logic
    shouldRetry: (error: any, attempt: number, maxRetries: number = 3): boolean => {
        if (attempt >= maxRetries) return false;

        // Retry on network errors, timeouts, and 5xx errors
        return (
            error.name === 'NetworkError' ||
            error.name === 'TimeoutError' ||
            (error.status >= 500 && error.status < 600)
        );
    },

    // Calculate retry delay with exponential backoff
    getRetryDelay: (attempt: number): number => {
        return Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
    },

    // Execute retry
    executeRetry: async (
        config: RequestConfig,
        attempt: number
    ): Promise<APIResponse> => {
        const delay = retryMiddleware.getRetryDelay(attempt);

        return new Promise((resolve) => {
            setTimeout(async () => {
                try {
                    const response = await executeRequest(config);
                    resolve(response);
                } catch (error) {
                    if (retryMiddleware.shouldRetry(error, attempt + 1, config.retries)) {
                        const retryResponse = await retryMiddleware.executeRetry(config, attempt + 1);
                        resolve(retryResponse);
                    } else {
                        resolve(errorMiddleware.handleError(error, config));
                    }
                }
            }, delay);
        });
    },
};

/**
 * Logging Middleware
 * Logs requests and responses for debugging
 */
export const loggingMiddleware = {
    // Log request
    logRequest: (config: RequestConfig): void => {
        if (__DEV__) {
            console.log('🚀 API Request:', {
                method: config.method,
                url: config.url,
                headers: config.headers,
                body: config.body,
                timestamp: new Date().toISOString(),
            });
        }
    },

    // Log response
    logResponse: (config: RequestConfig, response: any, duration: number): void => {
        if (__DEV__) {
            console.log('📥 API Response:', {
                method: config.method,
                url: config.url,
                status: response.status || 'success',
                duration: `${duration}ms`,
                data: response.data,
                timestamp: new Date().toISOString(),
            });
        }
    },

    // Log error
    logError: (config: RequestConfig, error: any, duration: number): void => {
        if (__DEV__) {
            console.error('❌ API Error:', {
                method: config.method,
                url: config.url,
                error: error.message,
                duration: `${duration}ms`,
                timestamp: new Date().toISOString(),
            });
        }
    },
};

/**
 * Rate Limiting Middleware
 * Prevents excessive API calls
 */
export const rateLimitMiddleware = {
    requests: new Map<string, number[]>(),

    // Check if request is rate limited
    isRateLimited: (config: RequestConfig, limit: number = 100, window: number = 60000): boolean => {
        const key = `${config.method}:${config.url}`;
        const now = Date.now();
        const requests = rateLimitMiddleware.requests.get(key) || [];

        // Remove old requests outside the window
        const validRequests = requests.filter(time => now - time < window);

        if (validRequests.length >= limit) {
            return true;
        }

        // Add current request
        validRequests.push(now);
        rateLimitMiddleware.requests.set(key, validRequests);

        return false;
    },

    // Clear rate limit data
    clear: (): void => {
        rateLimitMiddleware.requests.clear();
    },
};

/**
 * Performance Monitoring Middleware
 * Tracks API performance metrics
 */
export const performanceMiddleware = {
    metrics: new Map<string, {
        count: number;
        totalDuration: number;
        averageDuration: number;
        errors: number;
    }>(),

    // Start timing
    startTimer: (): number => {
        return Date.now();
    },

    // End timing and record metrics
    endTimer: (config: RequestConfig, startTime: number, success: boolean): void => {
        const duration = Date.now() - startTime;
        const key = `${config.method}:${config.url}`;

        const existing = performanceMiddleware.metrics.get(key) || {
            count: 0,
            totalDuration: 0,
            averageDuration: 0,
            errors: 0,
        };

        existing.count++;
        existing.totalDuration += duration;
        existing.averageDuration = existing.totalDuration / existing.count;

        if (!success) {
            existing.errors++;
        }

        performanceMiddleware.metrics.set(key, existing);

        // Log slow requests
        if (duration > 5000) {
            console.warn(`🐌 Slow API request: ${config.method} ${config.url} took ${duration}ms`);
        }
    },

    // Get metrics
    getMetrics: (): Map<string, any> => {
        return performanceMiddleware.metrics;
    },

    // Clear metrics
    clear: (): void => {
        performanceMiddleware.metrics.clear();
    },
};

/**
 * Request Queue Processing
 */
const processRequestQueue = async (): Promise<void> => {
    if (isProcessingQueue || requestQueue.length === 0) {
        return;
    }

    isProcessingQueue = true;

    while (requestQueue.length > 0) {
        const queueItem = requestQueue.shift();
        if (!queueItem) continue;

        try {
            const response = await executeRequest(queueItem.config);
            queueItem.resolve(response);
        } catch (error) {
            if (retryMiddleware.shouldRetry(error, queueItem.attempt + 1)) {
                retryMiddleware.addToQueue(
                    queueItem.config,
                    queueItem.resolve,
                    queueItem.reject,
                    queueItem.attempt + 1
                );
            } else {
                queueItem.reject(error);
            }
        }
    }

    isProcessingQueue = false;
};

/**
 * Core request executor
 */
const executeRequest = async (config: RequestConfig): Promise<APIResponse> => {
    const startTime = performanceMiddleware.startTimer();

    try {
        // Check rate limiting
        if (rateLimitMiddleware.isRateLimited(config)) {
            throw new Error('Rate limit exceeded');
        }

        // Check cache
        const cachedResponse = cacheMiddleware.get(config);
        if (cachedResponse) {
            loggingMiddleware.logResponse(config, cachedResponse, Date.now() - startTime);
            return cachedResponse;
        }

        // Apply auth middleware
        const configWithAuth = await authMiddleware.request(config);

        // Log request
        loggingMiddleware.logRequest(configWithAuth);

        // Set default headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...configWithAuth.headers,
        };

        // Make request with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout || 30000);

        const response = await fetch(configWithAuth.url, {
            method: configWithAuth.method,
            headers,
            body: configWithAuth.body ? JSON.stringify(configWithAuth.body) : undefined,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Apply auth response middleware
        const processedResponse = await authMiddleware.response(response, configWithAuth);

        // Parse response
        let data;
        const contentType = processedResponse.headers.get('content-type');
        if (contentType?.includes('application/json')) {
            data = await processedResponse.json();
        } else {
            data = await processedResponse.text();
        }

        const apiResponse: APIResponse = {
            success: processedResponse.ok,
            data: processedResponse.ok ? data : undefined,
            error: !processedResponse.ok ? {
                code: processedResponse.status.toString(),
                message: data?.message || processedResponse.statusText,
                details: data,
            } : undefined,
        };

        // Cache successful GET responses
        if (processedResponse.ok && configWithAuth.method === 'GET') {
            cacheMiddleware.set(configWithAuth, apiResponse);
        }

        // Log response
        loggingMiddleware.logResponse(configWithAuth, apiResponse, Date.now() - startTime);

        // Record performance metrics
        performanceMiddleware.endTimer(configWithAuth, startTime, processedResponse.ok);

        return apiResponse;

    } catch (error) {
        // Handle network errors
        if (!isOnline) {
            errorMiddleware.handleNetworkError(config);

            return new Promise((resolve, reject) => {
                retryMiddleware.addToQueue(config, resolve, reject);
            });
        }

        // Log error
        loggingMiddleware.logError(config, error, Date.now() - startTime);

        // Record performance metrics
        performanceMiddleware.endTimer(config, startTime, false);

        // Try retry if applicable
        if (retryMiddleware.shouldRetry(error, 0, config.retries)) {
            return retryMiddleware.executeRetry(config, 0);
        }

        throw error;
    }
};

/**
 * Main API client with middleware
 */
export const apiClient = {
    // Main request method
    request: async (config: RequestConfig): Promise<APIResponse> => {
        try {
            return await executeRequest(config);
        } catch (error) {
            return errorMiddleware.handleError(error, config);
        }
    },

    // Convenience methods
    get: (url: string, options: Partial<RequestConfig> = {}): Promise<APIResponse> => {
        return apiClient.request({ ...options, url, method: 'GET' });
    },

    post: (url: string, body?: any, options: Partial<RequestConfig> = {}): Promise<APIResponse> => {
        return apiClient.request({ ...options, url, method: 'POST', body });
    },

    put: (url: string, body?: any, options: Partial<RequestConfig> = {}): Promise<APIResponse> => {
        return apiClient.request({ ...options, url, method: 'PUT', body });
    },

    patch: (url: string, body?: any, options: Partial<RequestConfig> = {}): Promise<APIResponse> => {
        return apiClient.request({ ...options, url, method: 'PATCH', body });
    },

    delete: (url: string, options: Partial<RequestConfig> = {}): Promise<APIResponse> => {
        return apiClient.request({ ...options, url, method: 'DELETE' });
    },
};

/**
 * Middleware configuration and utilities
 */
export const middlewareConfig = {
    // Enable/disable middleware
    auth: true,
    caching: true,
    retries: true,
    logging: __DEV__,
    rateLimit: true,
    performance: true,

    // Default settings
    defaults: {
        timeout: 30000,
        retries: 3,
        cache: true,
        auth: true,
    },

    // Clear all middleware data
    clearAll: (): void => {
        cacheMiddleware.clear();
        rateLimitMiddleware.clear();
        performanceMiddleware.clear();
    },

    // Get middleware stats
    getStats: () => ({
        cache: {
            size: requestCache.size,
            entries: Array.from(requestCache.keys()),
        },
        rateLimit: {
            trackedEndpoints: rateLimitMiddleware.requests.size,
        },
        performance: {
            trackedEndpoints: performanceMiddleware.metrics.size,
            metrics: Object.fromEntries(performanceMiddleware.metrics),
        },
        queue: {
            pendingRequests: requestQueue.length,
            isProcessing: isProcessingQueue,
        },
    }),
};

// Network status monitoring
export const networkMonitor = {
    // Initialize network monitoring
    initialize: (): void => {
        // Listen for network status changes
        if (typeof window !== 'undefined') {
            window.addEventListener('online', errorMiddleware.handleRecovery);
            window.addEventListener('offline', () => errorMiddleware.handleNetworkError({} as RequestConfig));
        }
    },

    // Cleanup listeners
    cleanup: (): void => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', errorMiddleware.handleRecovery);
            window.removeEventListener('offline', () => errorMiddleware.handleNetworkError({} as RequestConfig));
        }
    },

    // Manual network check
    checkConnectivity: async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/health', {
                method: 'HEAD',
                cache: 'no-cache',
            });
            const online = response.ok;

            if (online !== isOnline) {
                if (online) {
                    errorMiddleware.handleRecovery();
                } else {
                    errorMiddleware.handleNetworkError({} as RequestConfig);
                }
            }

            return online;
        } catch {
            if (isOnline) {
                errorMiddleware.handleNetworkError({} as RequestConfig);
            }
            return false;
        }
    },
};

// Initialize middleware
networkMonitor.initialize();

export default {
    apiClient,
    middlewareConfig,
    networkMonitor,
    authMiddleware,
    errorMiddleware,
    cacheMiddleware,
    retryMiddleware,
    loggingMiddleware,
    rateLimitMiddleware,
    performanceMiddleware,
};