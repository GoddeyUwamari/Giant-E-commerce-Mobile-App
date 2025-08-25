import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API, ERROR_MESSAGES } from '../../config/constants';

// Types
export interface ApiError {
    code: string;
    message: string;
    field?: string;
    details?: Record<string, any>;
    statusCode: number;
    timestamp: string;
    requestId?: string;
}

export interface ApiResponse<T = any> {
    data: T;
    message?: string;
    success: boolean;
    timestamp: string;
    requestId: string;
    pagination?: PaginationMeta;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface RequestConfig extends AxiosRequestConfig {
    skipAuth?: boolean;
    skipRetry?: boolean;
    showErrorAlert?: boolean;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
}

export interface TokenRefreshResponse {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}

export interface NetworkState {
    isOnline: boolean;
    isSlowConnection: boolean;
}

// Request/Response Interceptor Types
interface QueuedRequest {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    config: InternalAxiosRequestConfig;
}

// Storage keys
const STORAGE_KEYS = {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
} as const;

// API Client Class
class ApiClient {
    private client: AxiosInstance;
    private isRefreshing = false;
    private refreshQueue: QueuedRequest[] = [];
    private requestQueue: Array<() => Promise<any>> = [];
    private networkState: NetworkState = { isOnline: true, isSlowConnection: false };
    private retryAttempts = new Map<string, number>();

    constructor() {
        this.client = this.createAxiosInstance();
        this.setupInterceptors();
    }

    private createAxiosInstance(): AxiosInstance {
        const instance = axios.create({
            baseURL: API.baseURL,
            timeout: 30000, // 30 seconds
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Version': '1.0',
                'X-Platform': 'mobile',
                'X-App-Version': '1.0.0',
            },
        });

        return instance;
    }

    private setupInterceptors(): void {
        this.setupRequestInterceptor();
        this.setupResponseInterceptor();
    }

    private setupRequestInterceptor(): void {
        this.client.interceptors.request.use(
            async (config: InternalAxiosRequestConfig) => {
                // Add device info
                config.headers['X-Device-ID'] = await this.getDeviceId();
                config.headers['X-Request-ID'] = this.generateRequestId();
                config.headers['X-Timestamp'] = new Date().toISOString();

                // Add auth token if not skipped
                if (!config.skipAuth) {
                    const token = await this.getAccessToken();
                    if (token) {
                        config.headers.Authorization = `Bearer ${token}`;
                    }
                }

                // Add network state headers
                config.headers['X-Network-State'] = this.networkState.isOnline ? 'online' : 'offline';
                if (this.networkState.isSlowConnection) {
                    config.headers['X-Connection-Type'] = 'slow';
                }

                // Log request in development
                if (__DEV__) {
                    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
                        headers: config.headers,
                        data: config.data,
                    });
                }

                return config;
            },
            (error: AxiosError) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(this.handleError(error));
            }
        );
    }

    private setupResponseInterceptor(): void {
        this.client.interceptors.response.use(
            (response: AxiosResponse) => {
                // Log response in development
                if (__DEV__) {
                    console.log(`✅ API Response: ${response.status} ${response.config.url}`, {
                        data: response.data,
                        headers: response.headers,
                    });
                }

                // Reset retry attempts on success
                const requestId = response.config.headers['X-Request-ID'] as string;
                if (requestId) {
                    this.retryAttempts.delete(requestId);
                }

                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config as InternalAxiosRequestConfig & {
                    _retry?: boolean;
                    skipRetry?: boolean;
                    retryAttempts?: number;
                };

                // Handle 401 Unauthorized - Token refresh
                if (error.response?.status === 401 && !originalRequest._retry) {
                    if (!originalRequest.skipAuth) {
                        return this.handleTokenRefresh(originalRequest);
                    }
                }

                // Handle network errors with retry
                if (!originalRequest.skipRetry && this.shouldRetry(error, originalRequest)) {
                    return this.retryRequest(originalRequest);
                }

                // Handle other errors
                const apiError = this.handleError(error);

                // Show error alert if configured
                if (originalRequest.showErrorAlert !== false) {
                    this.showErrorAlert(apiError);
                }

                return Promise.reject(apiError);
            }
        );
    }

    private async handleTokenRefresh(originalRequest: InternalAxiosRequestConfig): Promise<any> {
        if (this.isRefreshing) {
            // Queue the request
            return new Promise((resolve, reject) => {
                this.refreshQueue.push({ resolve, reject, config: originalRequest });
            });
        }

        this.isRefreshing = true;
        originalRequest._retry = true;

        try {
            const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (!refreshToken) {
                await this.handleLogout();
                throw new Error('No refresh token available');
            }

            // Call refresh token endpoint
            const response = await axios.post<TokenRefreshResponse>(
                `${API.baseURL}${API.endpoints.auth}/refresh`,
                { refreshToken },
                { timeout: 10000 }
            );

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Store new tokens
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, accessToken),
                AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken),
            ]);

            // Update authorization header
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Process queued requests
            this.refreshQueue.forEach(({ resolve, config }) => {
                config.headers.Authorization = `Bearer ${accessToken}`;
                resolve(this.client(config));
            });
            this.refreshQueue = [];

            return this.client(originalRequest);
        } catch (refreshError) {
            // Clear tokens and redirect to login
            await this.handleLogout();

            // Reject all queued requests
            this.refreshQueue.forEach(({ reject }) => {
                reject(refreshError);
            });
            this.refreshQueue = [];

            throw refreshError;
        } finally {
            this.isRefreshing = false;
        }
    }

    private shouldRetry(error: AxiosError, config: InternalAxiosRequestConfig): boolean {
        const maxRetries = config.retryAttempts || 3;
        const requestId = config.headers['X-Request-ID'] as string;
        const currentAttempts = this.retryAttempts.get(requestId) || 0;

        // Don't retry if max attempts reached
        if (currentAttempts >= maxRetries) {
            return false;
        }

        // Retry on network errors
        if (!error.response) {
            return true;
        }

        // Retry on server errors (5xx)
        if (error.response.status >= 500) {
            return true;
        }

        // Retry on rate limiting (429)
        if (error.response.status === 429) {
            return true;
        }

        return false;
    }

    private async retryRequest(config: InternalAxiosRequestConfig): Promise<any> {
        const requestId = config.headers['X-Request-ID'] as string;
        const currentAttempts = this.retryAttempts.get(requestId) || 0;

        this.retryAttempts.set(requestId, currentAttempts + 1);

        // Calculate exponential backoff delay
        const baseDelay = 1000; // 1 second
        const delay = baseDelay * Math.pow(2, currentAttempts);
        const jitter = Math.random() * 0.1 * delay; // Add jitter
        const finalDelay = Math.min(delay + jitter, 30000); // Max 30 seconds

        await this.sleep(finalDelay);

        return this.client(config);
    }

    private handleError(error: AxiosError): ApiError {
        const requestId = error.config?.headers?.['X-Request-ID'] as string;

        // Network error
        if (!error.response) {
            return {
                code: 'NETWORK_ERROR',
                message: ERROR_MESSAGES.NETWORK_ERROR,
                statusCode: 0,
                timestamp: new Date().toISOString(),
                requestId,
            };
        }

        // Server returned error response
        const { status, data } = error.response;

        // Try to extract error from response
        const errorData = data as any;

        return {
            code: errorData?.code || `HTTP_${status}`,
            message: errorData?.message || this.getDefaultErrorMessage(status),
            field: errorData?.field,
            details: errorData?.details,
            statusCode: status,
            timestamp: new Date().toISOString(),
            requestId,
        };
    }

    private getDefaultErrorMessage(status: number): string {
        switch (status) {
            case 400:
                return 'Invalid request data';
            case 401:
                return ERROR_MESSAGES.AUTHENTICATION_REQUIRED;
            case 403:
                return ERROR_MESSAGES.PERMISSION_DENIED;
            case 404:
                return 'Resource not found';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
                return ERROR_MESSAGES.GENERIC_ERROR;
            default:
                return ERROR_MESSAGES.GENERIC_ERROR;
        }
    }

    private showErrorAlert(error: ApiError): void {
        // Don't show alerts for certain error types
        if (error.code === 'NETWORK_ERROR' && !this.networkState.isOnline) {
            return;
        }

        Alert.alert('Error', error.message);
    }

    private async handleLogout(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
                AsyncStorage.removeItem(STORAGE_KEYS.USER_ID),
            ]);
        } catch (error) {
            console.error('Error during logout cleanup:', error);
        }
    }

    private async getAccessToken(): Promise<string | null> {
        try {
            return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
        } catch (error) {
            console.error('Error getting access token:', error);
            return null;
        }
    }

    private async getDeviceId(): Promise<string> {
        try {
            let deviceId = await AsyncStorage.getItem('device_id');
            if (!deviceId) {
                deviceId = this.generateDeviceId();
                await AsyncStorage.setItem('device_id', deviceId);
            }
            return deviceId;
        } catch (error) {
            return this.generateDeviceId();
        }
    }

    private generateDeviceId(): string {
        return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private generateRequestId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public methods
    public updateNetworkState(state: NetworkState): void {
        this.networkState = state;
    }

    public setAuthToken(token: string): void {
        this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    public clearAuthToken(): void {
        delete this.client.defaults.headers.common['Authorization'];
    }

    public async get<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
        return this.client.get(url, config);
    }

    public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
        return this.client.post(url, data, config);
    }

    public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
        return this.client.put(url, data, config);
    }

    public async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<AxiosResponse<T>> {
        return this.client.patch(url, data, config);
    }

    public async delete<T = any>(url: string, config?: RequestConfig): Promise<AxiosResponse<T>> {
        return this.client.delete(url, config);
    }

    // File upload
    public async uploadFile<T = any>(
        url: string,
        file: FormData,
        config?: RequestConfig & { onUploadProgress?: (progress: number) => void }
    ): Promise<AxiosResponse<T>> {
        const uploadConfig: AxiosRequestConfig = {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
            onUploadProgress: (progressEvent) => {
                if (config?.onUploadProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    config.onUploadProgress(progress);
                }
            },
        };

        return this.client.post(url, file, uploadConfig);
    }

    // Download file
    public async downloadFile(
        url: string,
        config?: RequestConfig & { onDownloadProgress?: (progress: number) => void }
    ): Promise<AxiosResponse<Blob>> {
        const downloadConfig: AxiosRequestConfig = {
            ...config,
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                if (config?.onDownloadProgress && progressEvent.total) {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    config.onDownloadProgress(progress);
                }
            },
        };

        return this.client.get(url, downloadConfig);
    }

    // Batch requests
    public async batch(requests: Array<() => Promise<any>>): Promise<any[]> {
        const batchSize = 5; // Process 5 requests at a time
        const results: any[] = [];

        for (let i = 0; i < requests.length; i += batchSize) {
            const batch = requests.slice(i, i + batchSize);
            const batchResults = await Promise.allSettled(batch.map(req => req()));
            results.push(...batchResults);
        }

        return results;
    }

    // Request cancellation
    public createCancelToken(): { token: any; cancel: (message?: string) => void } {
        const source = axios.CancelToken.source();
        return {
            token: source.token,
            cancel: source.cancel,
        };
    }

    // Health check
    public async healthCheck(): Promise<boolean> {
        try {
            await this.client.get('/health', {
                timeout: 5000,
                skipAuth: true,
                skipRetry: true
            });
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get instance for direct access
    public getInstance(): AxiosInstance {
        return this.client;
    }
}

// Create and export singleton instance
export const apiClient = new ApiClient();

// Helper functions
export const createFormData = (data: Record<string, any>): FormData => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
        const value = data[key];

        if (value !== null && value !== undefined) {
            if (value instanceof File || value instanceof Blob) {
                formData.append(key, value);
            } else if (Array.isArray(value)) {
                value.forEach((item, index) => {
                    formData.append(`${key}[${index}]`, item);
                });
            } else if (typeof value === 'object') {
                formData.append(key, JSON.stringify(value));
            } else {
                formData.append(key, String(value));
            }
        }
    });

    return formData;
};

export const buildQueryString = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();

    Object.keys(params).forEach(key => {
        const value = params[key];

        if (value !== null && value !== undefined) {
            if (Array.isArray(value)) {
                value.forEach(item => searchParams.append(key, String(item)));
            } else {
                searchParams.append(key, String(value));
            }
        }
    });

    return searchParams.toString();
};

export default apiClient;